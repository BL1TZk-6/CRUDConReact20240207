import { COOKIE_NAMES } from "./cookies.js"; // importamos los nombres de cookies centralizados

export const getBearerToken = (req) => {// obtenemos el token del header Authorization
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) { // si el header no tiene el formato esperado, retornamos null
    return null;
  }

  return authHeader.slice(7).trim() || null; // extraemos el token después de "Bearer " y lo retornamos, o null si está vacío
};

export const getAccessTokenFromRequest = (req) =>
  getBearerToken(req) || req.cookies?.[COOKIE_NAMES.ACCESS] || null; // soporta Authorization Bearer o cookie httpOnly

export const getRefreshTokenFromRequest = (req) => // obtenemos el refresh token de la cookie httpOnly
  req.cookies?.[COOKIE_NAMES.REFRESH] || null;