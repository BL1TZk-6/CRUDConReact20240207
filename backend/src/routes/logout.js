import express from "express"; // framework web para Node.js
import multer from "multer"; // middleware para manejar multipart/form-data
import loginController from "../controllers/loginController.js"; // controlador de login
import { validate } from "../middlewares/validate.js"; // middleware de validación
import { validateLoginPayload } from "../shared/validator.js"; // función de validación

const router = express.Router(); // creamos un router de Express
const upload = multer(); // configuramos multer

router
  .route("/") // definimos la ruta raíz para login/logout
  .post(upload.none(), loginController.logout);

  export default router; // exportamos el router para usarlo en app.js