import express from "express"; // framework web para Node.js
import multer from "multer"; // middleware para manejar multipart/form-data
import userController from "../controllers/usersController.js"; // controlador de usuarios
import authRequired from "../middlewares/authRequired.js"; // middleware de autenticación
import { validate, validateParamId } from "../middlewares/validate.js"; // middleware de validación
import { validateUserUpdatePayload } from "../shared/validator.js"; // función de validación para actualizar usuarios

const router = express.Router(); // creamos un router de Express
const upload = multer(); // configuramos multer

router.use(authRequired); // todas las rutas de usuarios requieren autenticación

router.route("/").get(userController.getUsers); // ruta para obtener todos los usuarios

router
  .route("/:id") // ruta para obtener, actualizar o eliminar un usuario por id
  .get(validateParamId, userController.getUsersById)
  .put(
    upload.none(),
    validateParamId,
    validate(validateUserUpdatePayload),
    userController.putUser,
  )
  .delete(validateParamId, userController.deleteUser);

export default router; // exportamos el router para usarlo en app.js
