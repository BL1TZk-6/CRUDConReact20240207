import express from "express"; // framework web para Node.js
import multer from "multer"; // middleware para manejar multipart/form-data
import userRegisterController from "../controllers/usersRegisterController.js"; // controlador para manejar la lógica de registro de usuarios
import { validate } from "../middlewares/validate.js"; // middleware de validación
import { validateRegisterPayload } from "../shared/validator.js"; // función de validación

const router = express.Router(); // creamos un router de Express
const upload = multer(); // configuramos multer

// Ruta de registro: POST /register
router
  .route("/") // ruta para registrar un nuevo usuario
  .post(
    upload.none(),
    validate(validateRegisterPayload),
    userRegisterController.register,
  );
router
  .route("/verifyCodeEmail") // ruta para verificar el código de email
  .post(upload.none(), userRegisterController.verifyCode);

export default router; // exportamos el router para usarlo en app.js
