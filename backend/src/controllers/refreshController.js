import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP
import { refreshAccessToken, signRefreshToken } from "../shared/jwt.js"; // manejo de JWT
import { setAuthCookies, clearAuthCookies } from "../shared/cookies.js"; // manejo de cookies
import { getRefreshTokenFromRequest } from "../shared/requestTokens.js"; // función para obtener el token de renovación de la solicitud
import { isTokenRevoked } from "../shared/revokedTokens.js"; // función para verificar si un token ha sido revocado
import { hasActiveSession } from "../shared/activeSession.js";

const refreshController = {}; // objeto controlador para renovación de tokens

// Controlador para manejar la ruta POST /api/refresh
refreshController.refresh = async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req); // obtenemos el token de renovación de las cookies

  if (!refreshToken) { // si no hay token de renovación, respondemos con un 401
    return HttpResponses.unauthorized(res, "Sesión expirada, inicia sesión nuevamente");
  }

  if (isTokenRevoked(refreshToken)) {
    clearAuthCookies(res);
    return HttpResponses.unauthorized(res, "Sesión cerrada, inicia sesión nuevamente");
  }

  const result = refreshAccessToken(refreshToken); // intentamos renovar el token de acceso usando el token de renovación

  if (!result.ok) { // si no se pudo renovar el token, respondemos con un 401
    clearAuthCookies(res);
    return HttpResponses.unauthorized(res, "Sesión expirada, inicia sesión nuevamente");
  }

  const sessionIsActive = await hasActiveSession(result.claims.id, result.claims.sessionId); // validamos que el refresh token siga perteneciendo a la sesión activa del usuario
  if (!sessionIsActive) { // si la sesión ya no es activa, respondemos con un 401 y limpiamos las cookies para cerrar la sesión en el cliente
    clearAuthCookies(res);
    return HttpResponses.unauthorized(res, "Tu sesión fue cerrada porque inició sesión en otro dispositivo");
  }

  // Si el token de renovación es válido, emitimos un nuevo token de acceso y uno de renovación con los mismos atributos
  const { iat, exp, nbf, ...claims } = result.claims;
  setAuthCookies(res, result.accessToken, signRefreshToken(claims)); // seteamos las cookies con el nuevo token de acceso y de renovación

  return HttpResponses.ok( // respondemos con el nuevo token de acceso y mensaje de éxito
    res,
    { accessToken: result.accessToken },
    "Token renovado correctamente",
  );
};

export default refreshController; // exportamos el controlador para usarlo en las rutas
