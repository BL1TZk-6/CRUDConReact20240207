const useFetch = () => { // Hook personalizado para manejar las solicitudes de autenticación al servidor, en este caso para el login de usuarios
  const SERVER_URL = "http://localhost:3000/api";

  // Función para realizar la solicitud de login al servidor
  const useLogin = async (email, password) => {
    const response = await fetch(`${SERVER_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }), // Se envían el correo electrónico y la contraseña en el cuerpo de la solicitud como JSON
    });

    // Se intenta parsear la respuesta del servidor como JSON
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Si la respuesta no es exitosa, se lanza un error con el mensaje del servidor o un mensaje por defecto
      throw new Error(payload.message || "Error en la autenticación");
    }

    const data = payload?.data ?? null;
    return { // Si la autenticación es exitosa, se devuelve un objeto con ok: true, el mensaje del servidor o un mensaje por defecto, y los datos de la respuesta (como el usuario autenticado o el token de sesión)
      message: payload?.message || "Login exitoso",
      data,
    };
  };

  return { useLogin }; // El hook devuelve la función useLogin para que pueda ser utilizada en los componentes que necesiten realizar la autenticación de usuarios
};

export default useFetch; // Exporta el hook useFetch
