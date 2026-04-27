import express from "express"; // framework web para Node.js
import refreshController from "../controllers/refreshController.js"; // controlador para manejar la lógica de refrescar tokens

const router = express.Router(); // creamos un router de Express

router.route("/").post(refreshController.refresh); // ruta para refrescar tokens

export default router; // exportamos el router para usarlo en app.js
