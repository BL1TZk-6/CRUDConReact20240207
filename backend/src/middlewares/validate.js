import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP
import { validateObjectId } from "../shared/validator.js"; //validación de ObjectId de Mongo

// Middleware de validación de payloads usando funciones de validación personalizadas
export const validate = (fn, opts = {}) =>
  (req, res, next) => {
    const result = fn(req.body || {}, opts); // validamos el body
    if (!result.valid) { // si no es válido, respondemos con un 400 y los errores
      return HttpResponses.badRequest(
        res,
        "Datos de entrada inválidos",
        null,
        { errors: result.errors }, // incluimos los errores específicos en meta.errors
      );
    }
    req.validatedBody = result.data; // adjuntamos los datos validados a req.validatedBody para que estén disponibles en los controladores de las rutas
    return next(); // continuamos al siguiente middleware o controlador de la ruta
  };

// Middleware específico para validar que el parámetro id de la ruta es un ObjectId válido
export const validateParamId = (req, res, next) => {
  if (!validateObjectId(req.params.id)) { // si el id no es un ObjectId válido, respondemos con un 400 y un mensaje de error específico
    return HttpResponses.badRequest(
      res,
      "ID inválido",
      null,
      { errors: ["El ID proporcionado no tiene un formato válido"] }, // incluimos un mensaje de error específico en meta.errors
    );
  }
  return next(); // si el id es válido, continuamos
};
