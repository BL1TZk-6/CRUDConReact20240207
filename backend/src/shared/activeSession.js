import usersModel from "../models/users.js";

export const hasActiveSession = async (userId, sessionId) => {
  if (!userId || !sessionId) { // si faltan datos de sesión, consideramos que no hay una sesión activa válida
    return false;
  }

  const user = await usersModel.findById(userId).select("currentSessionId"); // buscamos únicamente el identificador de sesión activa del usuario
  if (!user) { // si el usuario no existe, no puede tener una sesión activa válida
    return false;
  }

  return user.currentSessionId === sessionId; // retornamos true solo si la sesión del token coincide con la sesión activa guardada
};

export const clearActiveSession = async (userId, sessionId = null) => {
  if (!userId) { // si no hay usuario, no hay nada que limpiar
    return;
  }

  const user = await usersModel.findById(userId).select("currentSessionId"); // buscamos al usuario con su sesión actual para poder invalidarla
  if (!user) { // si no existe el usuario, no hacemos nada
    return;
  }

  if (sessionId && user.currentSessionId !== sessionId) { // si la sesión a limpiar no coincide con la sesión activa, evitamos borrar otra sesión distinta
    return;
  }

  user.currentSessionId = null; // eliminamos el identificador de sesión activa para dejar al usuario sin una sesión vigente
  await user.save();
};