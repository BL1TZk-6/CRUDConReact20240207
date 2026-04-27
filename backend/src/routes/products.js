import express from "express"; // framework web para Node.js
import multer from "multer"; // middleware para manejar multipart/form-data
import productsController from "../controllers/productsController.js"; // controlador de productos
import authRequired from "../middlewares/authRequired.js"; // middleware para requerir autenticación
import { validate, validateParamId } from "../middlewares/validate.js"; // middleware de validación y validación de parámetro id
import { validateProductPayload } from "../shared/validator.js"; // función de validación para productos

const router = express.Router(); // creamos un router de Express
const upload = multer(); // configuramos multer

router.use(authRequired); // todas las rutas de productos requieren autenticación

router
  .route("/") // ruta para obtener todos los productos o crear un nuevo producto
  .get(productsController.getProducts)
  .post(
    upload.none(),
    validate(validateProductPayload),
    productsController.postProduct,
  );

router
  .route("/:id") // ruta para obtener, actualizar o eliminar un producto por id
  .get(validateParamId, productsController.getProductById)
  .put(
    upload.none(),
    validateParamId,
    validate(validateProductPayload, { partial: true }),
    productsController.putProduct,
  )
  .delete(validateParamId, productsController.deleteProduct);

export default router; // exportamos el router para usarlo en app.js
