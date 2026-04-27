import HttpResponses from "../traits/HttpResponses.js";
import {
  initiatePasswordRecovery,
  confirmPasswordRecovery,
} from "../services/passwordRecoveryService.js";
import {
  setPasswordRecoveryCookie,
  clearPasswordRecoveryCookie,
  COOKIE_NAMES,
} from "../shared/cookies.js";

const passwordRecoveryController = {};

// Controlador para iniciar recuperación de contraseña.
passwordRecoveryController.requestRecovery = async (req, res) => {
  try {
    const result = await initiatePasswordRecovery(req.validatedBody);

    if (!result.ok) {
      const status = result.status === "email_config_missing" ? "serverError" : "badRequest";
      return HttpResponses[status](res, result.message);
    }

    if (result.token) {
      setPasswordRecoveryCookie(res, result.token);
    }

    return HttpResponses.ok(
      res,
      null,
      "Si el correo existe, recibirás un código para recuperar tu contraseña",
    );
  } catch (error) {
    return HttpResponses.serverError(res, "Error interno del servidor", error.message);
  }
};

// Controlador para confirmar OTP y cambiar contraseña.
passwordRecoveryController.confirmRecovery = async (req, res) => {
  try {
    const { verificationCodeRequest, newPassword } = req.validatedBody;

    const result = await confirmPasswordRecovery(
      verificationCodeRequest,
      newPassword,
      req.cookies[COOKIE_NAMES.PASSWORD_RECOVERY],
    );

    if (!result.ok) {
      if (
        result.status === "invalid_token"
        || result.status === "invalid_purpose"
        || result.status === "missing_cookie"
      ) {
        clearPasswordRecoveryCookie(res);
      }

      const handlers = {
        not_found: () => HttpResponses.notFound(res, result.message),
      };

      return handlers[result.status]?.() ?? HttpResponses.badRequest(res, result.message);
    }

    clearPasswordRecoveryCookie(res);
    return HttpResponses.ok(res, null, "Contraseña actualizada correctamente");
  } catch (error) {
    return HttpResponses.serverError(res, "Error interno del servidor", error.message);
  }
};

export default passwordRecoveryController;
