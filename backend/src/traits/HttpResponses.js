const buildResponse = ({ok, message, data = null, error = null, meta = null }) => ({ // función para construir la estructura de respuesta estándar
  ok,
  message,
  data,
  error,
  meta,
  timestamp: new Date().toISOString(),
});

const HttpResponses = { // objeto con métodos para enviar respuestas HTTP estándar
  ok(res, data = null, message = "Solicitud exitosa", meta = null) {
    return res.status(200).json(
      buildResponse({
        ok: true,
        message,
        data,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 201
  created(res, data = null, message = "Recurso creado correctamente", meta = null) {
    return res.status(201).json(
      buildResponse({
        ok: true,
        message,
        data,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 204
  noContent(res) {
    return res.status(204).send();
  },

  // método para enviar respuesta HTTP 400
  badRequest(res, message = "Solicitud invalida", error = null, meta = null) {
    return res.status(400).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 401
  unauthorized(res, message = "No autorizado", error = null, meta = null) {
    return res.status(401).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 403
  forbidden(res, message = "Acceso denegado", error = null, meta = null) {
    return res.status(403).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 404
  notFound(res, message = "Recurso no encontrado", error = null, meta = null) {
    return res.status(404).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 409
  conflict(res, message = "Conflicto en la solicitud", error = null, meta = null) {
    return res.status(409).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 422
  unprocessable(res, message = "Error de validacion", error = null, meta = null) {
    return res.status(422).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 500
  serverError(res, message = "Error interno del servidor", error = null, meta = null) {
    return res.status(500).json(
      buildResponse({
        ok: false,
        message,
        error,
        meta,
      })
    );
  },

  // método para enviar respuesta HTTP 200 con formato de paginación
  paginated(res, data = [], pagination = {}, message = "Listado obtenido correctamente") {
    return res.status(200).json(
      buildResponse({
        ok: true,
        message,
        data,
        meta: { pagination },
      })
    );
  },
};

export default HttpResponses; // exportamos HttpResponses