import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP
import { verifyToken, signAccessToken, signRefreshToken } from "../shared/jwt.js"; // manejo de JWT
import { setAuthCookies } from "../shared/cookies.js"; // manejo de cookies
import { getAccessTokenFromRequest } from "../shared/requestTokens.js";
import { isTokenRevoked } from "../shared/revokedTokens.js";
import { hasActiveSession } from "../shared/activeSession.js";

// Middleware para proteger rutas que requieren autenticación
const authRequired = async (req, res, next) => {
  const token = getAccessTokenFromRequest(req); // soporta Authorization Bearer o cookie httpOnly

  if (!token) { // si no se proporcionó ningún token, respondemos con un 401
    return HttpResponses.unauthorized(res, "Token requerido");
  }

  if (isTokenRevoked(token)) {
    return HttpResponses.unauthorized(res, "Sesión cerrada, inicia sesión nuevamente");
  }

  const result = verifyToken(token, "access"); // verificamos el token usando la función de verificación de JWT, especificando que es un access token
  if (!result.ok) { // si el token no es válido o ha expirado, respondemos con un 401 y el mensaje de error específico
    return HttpResponses.unauthorized(res, "Token inválido o expirado", result.error);
  }

  const sessionIsActive = await hasActiveSession(result.payload.id, result.payload.sessionId); // validamos que el token pertenezca a la sesión activa actual del usuario
  if (!sessionIsActive) {
    return HttpResponses.unauthorized(res, "Tu sesión fue cerrada porque inició sesión en otro dispositivo");
  }

  req.auth = result.payload; // adjuntamos el payload del token a req.auth para que esté disponible en los controladores de las rutas protegidas

  // cada petición exitosa reinicia el contador de inactividad y reemitimos ambas cookies con TTL renovado de 5 min
  const { iat, exp, nbf, ...claims } = result.payload;
  setAuthCookies(res, signAccessToken(claims), signRefreshToken(claims));

  return next(); // continuamos al siguiente middleware o controlador de la ruta
};

export default authRequired; // exportamos el middleware para usarlo en las rutas protegidas
