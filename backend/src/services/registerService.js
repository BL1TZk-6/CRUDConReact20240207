import crypto from "crypto";
import bcryptjs from "bcryptjs";
import userModel from "../models/users.js";
import { sendVerificationEmail } from "./emailService.js";
import { signVerificationToken, verifyToken } from "../shared/jwt.js";
import { getPasswordValidationErrors } from "../shared/validator.js";
import { config } from "../../config.js";

/**
 * Inicia el flujo de registro:
 * verifica duplicado, hashea password, genera código, firma token y envía correo.
 *
 * @returns {{ ok: true, token: string }
 *          | { ok: false, status: 'already_exists'|'email_config_missing', message: string }}
 */
export const initiateRegistration = async ({ name, lastName, birthDate, email, password, userType }) => {
  const existing = await userModel.findOne({ email }); // verificamos si ya existe un usuario con el mismo correo
  if (existing) {
    return { ok: false, status: "already_exists", message: "El usuario ya existe" };
  }

  const passwordErrors = getPasswordValidationErrors(password, "password"); // validamos la fortaleza de la contraseña en la capa de servicio
  if (passwordErrors.length > 0) {
    return { ok: false, status: "weak_password", message: passwordErrors[0] };
  }

  if (!config.email.senderEmail || !config.email.senderPassword) { // validamos que exista configuración de correo antes de continuar
    return { ok: false, status: "email_config_missing", message: "Configuración de correo incompleta" };
  }

  const passwordHashed = await bcryptjs.hash(password, 10); // hasheamos la contraseña para no guardarla en texto plano
  const verificationCode = crypto.randomBytes(3).toString("hex"); // generamos código OTP de verificación

  const token = signVerificationToken( // firmamos token temporal con los datos del registro
    {
      verificationCode,
      name,
      lastName,
      birthDate,
      email,
      password: passwordHashed,
      userType,
      isVerified: false,
    },
  );

  const otpRoute = "/register/otp";
  const frontendBase = (config.app.frontendUrl || "http://localhost:5173").replace(/\/+$/, "");
  const otpUrl = `${frontendBase}${otpRoute}`;

  await sendVerificationEmail( // enviamos el correo con el código y enlace al paso OTP
    config.email.senderEmail,
    config.email.senderPassword,
    email,
    verificationCode,
    otpUrl,
  );

  return { ok: true, token };
};

/**
 * Confirma el registro comparando el código del usuario con el token de la cookie.
 *
 * @returns {{ ok: true, user: object }
 *          | { ok: false, status: 'missing_cookie'|'invalid_token'|'incomplete_token'|'wrong_code', message: string }}
 */
export const confirmRegistration = async (verificationCodeRequest, registrationToken) => {
  if (!registrationToken) { // si no hay cookie/token de registro, no se puede completar la verificación
    return { ok: false, status: "missing_cookie", message: "Cookie de registro no encontrada o expirada" };
  }

  const verification = verifyToken(registrationToken, "access"); // validamos el token temporal de registro
  if (!verification.ok) {
    return { ok: false, status: "invalid_token", message: "El enlace de verificación ha expirado" };
  }
  const decoded = verification.payload;

  const {
    verificationCode: storedCode,
    name,
    lastName,
    birthDate,
    email,
    password,
    userType,
  } = decoded;

  if (!name || !lastName || !birthDate || !email || !password) {
    return {
      ok: false,
      status: "incomplete_token",
      message: "Datos de registro incompletos, vuelve a registrarte",
    };
  }

  if (verificationCodeRequest !== storedCode) { // comparamos el OTP ingresado contra el OTP firmado en el token
    return { ok: false, status: "wrong_code", message: "Código de verificación inválido" };
  }

  const newUser = new userModel({ // creamos el usuario definitivo una vez validado el código OTP
    name,
    lastName,
    birthDate,
    email,
    password,
    userType: userType || "usuario",
    isVerified: true,
  });
  await newUser.save(); // persistimos el nuevo usuario verificado

  return { ok: true, user: newUser };
};
