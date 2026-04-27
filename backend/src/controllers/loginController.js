import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP
import { attemptLogin } from "../services/loginService.js"; // lógica de login
import { clearAuthCookies, setAuthCookies } from "../shared/cookies.js"; // cookies de autenticación
import {
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
} from "../shared/requestTokens.js";
import { revokeToken } from "../shared/revokedTokens.js";
import { clearActiveSession } from "../shared/activeSession.js";
import { verifyToken } from "../shared/jwt.js";

const loginController = {}; // objeto controlador para login

// Controlador para manejar la ruta POST /api/login
loginController.login = async (req, res) => {
  const { email, password } = req.validatedBody; // obtenemos email y password del body
  try {
    const result = await attemptLogin(email, password); // intentamos loguear al usuario
    if (!result.ok) {
      const handlers = {
        // manejadores específicos para cada tipo de error de login
        not_found: () => HttpResponses.notFound(res, result.message),
        blocked: () => HttpResponses.forbidden(res, result.message),
        unverified: () => HttpResponses.forbidden(res, result.message),
        wrong_password: () => HttpResponses.unauthorized(res, result.message),
      };
      return (
        handlers[result.status]?.() ?? // manejamos el error específico o badRequest
        HttpResponses.badRequest(res, result.message)
      );
    }

    setAuthCookies(res, result.accessToken, result.refreshToken); // seteamos cookies de autenticación

    return HttpResponses.ok(
      // respondemos con el token y datos del usuario
      res,
      { accessToken: result.accessToken, user: result.user },
      "Login exitoso", // mensaje de éxito
    );
  } catch (error) {
    // manejamos errores inesperados con un 500
    return HttpResponses.serverError(
      res,
      "Error interno del servidor",
      error.message,
    );
  }
};

loginController.logout = async (req, res) => {
  try {
    const accessToken = getAccessTokenFromRequest(req); // obtenemos el token de acceso actual desde el request
    const refreshToken = getRefreshTokenFromRequest(req); // obtenemos el token de renovación actual desde el request
    const accessPayload = verifyToken(accessToken, "access"); // decodificamos el token de acceso para identificar la sesión activa
    const refreshPayload = verifyToken(refreshToken, "refresh"); // decodificamos el refresh token como respaldo si el access token ya no es válido

    revokeToken(accessToken); // revocamos el token de acceso para impedir su reutilización
    revokeToken(refreshToken); // revocamos el token de renovación para cerrar completamente la sesión

    if (accessPayload.ok) { // si el token de acceso sigue siendo válido, limpiamos la sesión asociada a ese token
      await clearActiveSession(accessPayload.payload.id, accessPayload.payload.sessionId);
    } else if (refreshPayload.ok) { // si no, intentamos limpiar la sesión usando los datos del refresh token
      await clearActiveSession(refreshPayload.payload.id, refreshPayload.payload.sessionId);
    }

    clearAuthCookies(res);

    return HttpResponses.ok(res, null, "Logout exitoso");
  } catch (error) {
    return HttpResponses.serverError(
      res,
      "Error interno del servidor",
      error.message,
    );
  }
};

export default loginController; // exportamos el controlador para usarlo en las rutas
