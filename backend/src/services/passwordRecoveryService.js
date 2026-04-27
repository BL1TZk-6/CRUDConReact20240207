import crypto from "crypto";
import bcryptjs from "bcryptjs";
import userModel from "../models/users.js";
import { sendPasswordRecoveryEmail } from "./emailService.js";
import { signVerificationToken, verifyToken } from "../shared/jwt.js";
import { getPasswordValidationErrors } from "../shared/validator.js";
import { config } from "../../config.js";

/**
 * Inicia el flujo de recuperación de contraseña:
 * busca usuario, genera OTP, firma token y envía correo.
 *
 * @returns {{ ok: true, token: string | null }
 *          | { ok: false, status: 'email_config_missing', message: string }}
 */
export const initiatePasswordRecovery = async ({ email }) => {
  if (!config.email.senderEmail || !config.email.senderPassword) { // validamos que exista configuración de correo
    return { ok: false, status: "email_config_missing", message: "Configuración de correo incompleta" };
  }

  const user = await userModel.findOne({ email }); // buscamos el usuario por correo

  // Por seguridad, no revelamos si el correo existe o no.
  if (!user) {
    return { ok: true, token: null };
  }

  const verificationCode = crypto.randomBytes(3).toString("hex"); // generamos código OTP para recuperación
  const token = signVerificationToken({
    verificationCode,
    email,
    purpose: "password_recovery", // marcamos el propósito del token para evitar reutilización en otros flujos
  });

  const otpRoute = "/recover-password/otp";
  const frontendBase = (config.app.frontendUrl || "http://localhost:5173").replace(/\/+$/, "");
  const otpUrl = `${frontendBase}${otpRoute}`;

  await sendPasswordRecoveryEmail( // enviamos correo con OTP y enlace al flujo de recuperación
    config.email.senderEmail,
    config.email.senderPassword,
    email,
    verificationCode,
    otpUrl,
  );

  return { ok: true, token };
};

/**
 * Confirma OTP y actualiza contraseña del usuario.
 *
 * @returns {{ ok: true }
 *          | { ok: false, status: 'missing_cookie'|'invalid_token'|'invalid_purpose'|'wrong_code'|'not_found', message: string }}
 */
export const confirmPasswordRecovery = async (
  verificationCodeRequest,
  newPassword,
  recoveryToken,
) => {
  const passwordErrors = getPasswordValidationErrors(newPassword, "newPassword"); // validamos nuevamente la fortaleza de la contraseña aunque el request ya venga validado
  if (passwordErrors.length > 0) {
    return { ok: false, status: "weak_password", message: passwordErrors[0] };
  }

  if (!recoveryToken) { // validamos que exista token/cookie de recuperación
    return { ok: false, status: "missing_cookie", message: "Solicitud de recuperación no encontrada o expirada" };
  }

  const verification = verifyToken(recoveryToken, "access"); // validamos token temporal de recuperación
  if (!verification.ok) {
    return { ok: false, status: "invalid_token", message: "La solicitud de recuperación expiró" };
  }

  const { verificationCode: storedCode, email, purpose } = verification.payload;

  if (purpose !== "password_recovery") { // verificamos que el token pertenezca al flujo de recuperación
    return { ok: false, status: "invalid_purpose", message: "Token inválido para recuperación de contraseña" };
  }

  if (verificationCodeRequest !== storedCode) { // comparamos el OTP ingresado contra el OTP firmado en token
    return { ok: false, status: "wrong_code", message: "Código de verificación inválido" };
  }

  const user = await userModel.findOne({ email }); // buscamos el usuario al que pertenece la recuperación
  if (!user) {
    return { ok: false, status: "not_found", message: "Usuario no encontrado" };
  }

  user.password = await bcryptjs.hash(newPassword, 10); // guardamos la nueva contraseña de forma hasheada
  user.loginAttemps = 0; // reiniciamos el contador de intentos fallidos para no dejar bloqueada la cuenta
  user.timeOut = null; // limpiamos el bloqueo temporal si existía
  await user.save();

  return { ok: true };
};
