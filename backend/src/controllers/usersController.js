import usersModel from "../models/users.js"; // modelo de usuarios
import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP

const usersController = {}; // objeto controlador para usuarios

// Controlador para manejar la ruta GET /api/users
usersController.getUsers = async (req, res) => {
  try {
    const users = await usersModel.find({ _id: { $ne: req.auth.id } }); // obtenemos todos los usuarios excepto el autenticado
    return HttpResponses.ok(res, users, "Usuarios obtenidos correctamente"); // respondemos con los usuarios y mensaje de éxito
  } catch (error) {
    // manejamos errores inesperados con un 500
    return HttpResponses.serverError(
      res,
      "Error devolviendo usuarios",
      error.message,
    );
  }
};

// Controlador para manejar la ruta GET /api/users/:id
usersController.getUsersById = async (req, res) => {
  try {
    if (req.params.id === req.auth.id) { // bloqueamos que el usuario autenticado consulte su propio registro desde este módulo
      return HttpResponses.forbidden(res, "No puedes consultar tu propio registro desde este módulo");
    }

    const user = await usersModel.findById(req.params.id); // obtenemos el usuario por ID
    if (!user) {
      // si no existe el usuario, respondemos con un 404
      return HttpResponses.notFound(res, "Usuario no encontrado");
    }
    return HttpResponses.ok(res, user, "Usuario obtenido correctamente"); // respondemos con el usuario y mensaje de éxito
  } catch (error) {
    // manejamos errores inesperados con un 500
    return HttpResponses.serverError(
      res,
      "Error devolviendo usuario",
      error.message,
    );
  }
};

// Controlador para manejar la ruta PUT /api/users/:id
usersController.putUser = async (req, res) => {
  try {
    if (req.params.id === req.auth.id) { // evitamos que el usuario autenticado se edite a sí mismo desde el módulo administrativo
      return HttpResponses.forbidden(res, "No puedes editar tu propio registro desde este módulo");
    }

    const userUpdated = await usersModel.findByIdAndUpdate(
      // actualizamos el usuario por ID con los datos validados
      req.params.id, // ID del usuario a actualizar
      req.validatedBody, // datos validados para actualizar el usuario
      { new: true }, // opción para devolver el documento actualizado en lugar del original
    );
    if (!userUpdated) {
      // si no se encontró el usuario, respondemos con un 404
      return HttpResponses.notFound(res, "Usuario no encontrado");
    }
    return HttpResponses.ok(
      // respondemos con el usuario actualizado y mensaje de éxito
      res,
      userUpdated,
      "Usuario actualizado correctamente",
    );
  } catch (error) {
    // manejamos errores inesperados con un 500
    return HttpResponses.serverError(
      res,
      "Error actualizando usuario",
      error.message,
    );
  }
};

// Controlador para manejar la ruta DELETE /api/users/:id
usersController.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.auth.id) { // evitamos que el usuario autenticado elimine su propia cuenta desde este módulo
      return HttpResponses.forbidden(res, "No puedes eliminar tu propio registro");
    }

    const deletedUser = await usersModel.findByIdAndDelete(req.params.id); // eliminamos el usuario por ID
    if (!deletedUser) { // si no se encontró el usuario, respondemos con un 404
      return HttpResponses.notFound(res, "Usuario no encontrado");
    }
    return HttpResponses.ok( // respondemos con el usuario eliminado y mensaje de éxito
      res,
      deletedUser,
      "Usuario eliminado correctamente",
    );
  } catch (error) { // manejamos errores inesperados con un 500
    return HttpResponses.serverError(
      res,
      "Error eliminando usuario",
      error.message,
    );
  }
};

export default usersController; // exportamos el controlador para usarlo en las rutas
