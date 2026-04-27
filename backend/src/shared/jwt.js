import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

//TTLs centralizados
export const TTL = {
  ACCESS:       "5m", // Token de acceso: corto, renovable con refresh
  REFRESH:      "5m", // Token de renovación: expira igual que el token de acceso
  VERIFICATION: "5m", // Token de verificación de registro: expira rápido
};

//Firma

//Token de acceso para rutas protegidas (5 min).
export const signAccessToken = (payload) =>
  jsonwebtoken.sign(payload, config.JWT.secret, { expiresIn: TTL.ACCESS });

//Token de renovación (5 min). Usa refreshSecret si está definido, si no usa secret.
export const signRefreshToken = (payload) =>
  jsonwebtoken.sign(
    payload,
    config.JWT.refreshSecret || config.JWT.secret,
    { expiresIn: TTL.REFRESH },
  );

//Token temporal para verificar código de registro (5 min).
export const signVerificationToken = (payload) =>
  jsonwebtoken.sign(payload, config.JWT.secret, { expiresIn: TTL.VERIFICATION });

//Verificación

/**
 * Verifica cualquier token y devuelve un resultado sin lanzar excepciones.
 * @param {"access"|"refresh"} type
 * @returns {{ ok: true, payload: object } | { ok: false, error: string }}
 */
export const verifyToken = (token, type = "access") => {
  if (!token) return { ok: false, error: "Token no proporcionado" };

  const secret =
    type === "refresh"
      ? config.JWT.refreshSecret || config.JWT.secret
      : config.JWT.secret;

  try {
    const payload = jsonwebtoken.verify(token, secret);
    return { ok: true, payload };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

//Refresh
/**
 * Verifica el token de renovación y emite un nuevo token de acceso con los mismos atributos.
 * @returns {{ ok: true, accessToken: string, claims: object } | { ok: false, message: string }}
 */
export const refreshAccessToken = (refreshToken) => {
  const result = verifyToken(refreshToken, "refresh");
  if (!result.ok) {
    return { ok: false, message: "Refresh token inválido o expirado" };
  }

  // Extraemos solo los atributos de negocio (sin metadatos JWT: iat, exp, nbf)
  const { iat, exp, nbf, ...claims } = result.payload;
  const accessToken = signAccessToken(claims);

  return { ok: true, accessToken, claims };
};
