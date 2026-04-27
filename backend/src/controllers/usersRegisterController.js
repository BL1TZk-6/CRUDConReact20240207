import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP
import { initiateRegistration, confirmRegistration } from "../services/registerService.js"; // lógica de registro
import { setRegistrationCookie, clearRegistrationCookie, COOKIE_NAMES } from "../shared/cookies.js"; // manejo de cookies

const registerUserController = {}; // objeto controlador para registro de usuarios

// Controlador para manejar la ruta POST /api/register
registerUserController.register = async (req, res) => {
  try {
    const result = await initiateRegistration(req.validatedBody); // intentamos iniciar el proceso de registro con los datos validados

    if (!result.ok) { // si no se pudo iniciar el registro, respondemos con el error específico
      const status = result.status === "email_config_missing" ? "serverError" : "badRequest";
      return HttpResponses[status](res, result.message); // manejamos el error específico o badRequest
    }

    setRegistrationCookie(res, result.token); // seteamos una cookie temporal para el proceso de registro con el token generado

    return HttpResponses.ok(res, null, "Revisa tu correo para verificar tu cuenta"); // respondemos con un mensaje de éxito indicando que se envió el correo de verificación
  } catch (error) { // manejamos errores inesperados con un 500
    return HttpResponses.serverError(res, "Error interno del servidor", error.message);
  }
};

// Controlador para manejar la ruta POST /api/register/verify
registerUserController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest } = req.body || {}; // obtenemos el código de verificación del body

    if (!verificationCodeRequest) { // si no se proporcionó el código de verificación, respondemos con un 400
      return HttpResponses.badRequest(res, "El código de verificación es obligatorio");
    }

    const result = await confirmRegistration( // intentamos confirmar el registro con el código de verificación y el token de la cookie
      verificationCodeRequest,
      req.cookies[COOKIE_NAMES.REGISTRATION],
    );

    if (!result.ok) { // si no se pudo confirmar el registro, respondemos con el error específico
      if (result.status === "invalid_token" || result.status === "incomplete_token") {
        clearRegistrationCookie(res);
      }
      const status = result.status === "missing_cookie" ? "badRequest" : "badRequest";
      return HttpResponses[status](res, result.message); // manejamos el error específico o badRequest
    }

    clearRegistrationCookie(res); // limpiamos la cookie de registro ya que el proceso ha finalizado
    return HttpResponses.ok(res, result.user, "Usuario registrado correctamente");
  } catch (error) { // manejamos errores inesperados con un 500
    return HttpResponses.serverError(res, "Error interno del servidor", error.message);
  }
};

export default registerUserController; // exportamos el controlador para usarlo en las rutas

