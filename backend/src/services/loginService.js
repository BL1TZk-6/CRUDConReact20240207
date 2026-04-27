import bcrypt from "bcryptjs";
import crypto from "crypto";
import users from "../models/users.js";
import { signAccessToken, signRefreshToken } from "../shared/jwt.js";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000;

/**
 * Resultado de intento de login.
 * @typedef {{ ok: true, token: string, user: object }
 *          | { ok: false, status: 'not_found'|'blocked'|'wrong_password'|'unverified', message: string }} LoginResult
 */

/**
 * Busca el usuario, valida la contraseña y gestiona el bloqueo por intentos.
 * No sabe nada de HTTP — devuelve un objeto de resultado que el controlador interpreta.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginResult>}
 */
export const attemptLogin = async (email, password) => {
  const user = await users.findOne({ email }); // buscamos el usuario por correo

  if (!user) {
    return { ok: false, status: "not_found", message: "Usuario no encontrado" };
  }

  if (isBlocked(user)) { // bloqueamos el acceso si la cuenta está temporalmente bloqueada
    return { ok: false, status: "blocked", message: "Cuenta bloqueada temporalmente" };
  }

  if (!user.isVerified) { // evitamos login en cuentas que no hayan completado verificación OTP
    return { ok: false, status: "unverified", message: "Debes verificar tu cuenta antes de iniciar sesión" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password); // comparamos contraseña ingresada contra hash almacenado

  if (!passwordMatch) {
    await registerFailedAttempt(user);
    const blocked = isBlocked(user);
    return {
      ok: false,
      status: blocked ? "blocked" : "wrong_password",
      message: blocked
        ? "Cuenta bloqueada por múltiples intentos fallidos"
        : "Contraseña incorrecta",
    };
  }

  await resetAttempts(user); // limpiamos contador y bloqueo tras login exitoso

  const sessionId = crypto.randomUUID(); // generamos un identificador único para la nueva sesión activa del usuario
  user.currentSessionId = sessionId; // guardamos la nueva sesión, reemplazando cualquier sesión previa del mismo usuario
  await user.save();

  const tokenPayload = { id: user._id, userType: user.userType || "usuario", sessionId }; // incluimos la sesión activa en los tokens para validarla en cada petición
  const accessToken  = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  return {
    ok: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      userType: user.userType || "usuario",
      sessionId, // devolvemos la sesión emitida por consistencia con el contexto autenticado actual
    },
  };
};

const isBlocked = (user) => // revisa si existe un bloqueo vigente por intentos fallidos
  Boolean(user.timeOut && user.timeOut > Date.now());

const registerFailedAttempt = async (user) => {
  user.loginAttemps = (user.loginAttemps || 0) + 1; // incrementamos el contador de intentos fallidos

  if (user.loginAttemps >= MAX_ATTEMPTS) { // si excede el máximo, bloqueamos temporalmente la cuenta
    user.timeOut = Date.now() + BLOCK_DURATION_MS;
    user.loginAttemps = 0;
  }

  await user.save();
};

const resetAttempts = async (user) => {
  user.loginAttemps = 0; // reiniciamos intentos fallidos
  user.timeOut = null; // eliminamos bloqueo temporal
  await user.save();
};


