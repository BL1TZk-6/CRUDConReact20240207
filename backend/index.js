import app from "./app.js"; // importamos la aplicación Express
import "./database.js"; // importamos la conexión a la base de datos

function startServer(port) { // función para iniciar el servidor con PORT
  const server = app.listen(port, () => {
    console.log(`Servidor en el puerto ${port}`);
  });

  server.on("error", (error) => { // manejamos errores al iniciar el servidor
    if (error.code === "EADDRINUSE") {
      console.error(`Puerto ${port} ya está en uso. Por favor, elige otro puerto.`);
      return;
    }

    // manejamos otros errores inesperados
    console.error("Error del servidor:", error);
  });
}

// Ejecuta el servidor con el puerto configurado.
const port = Number(process.env.PORT) || 3000;
startServer(port);

// Manejamos errores no capturados y rechazos no manejados
process.on("unhandledRejection", (reason) => {
  console.error("Rechazo no manejado:", reason);
});

// Manejamos excepciones no capturadas
process.on("uncaughtException", (error) => {
  console.error("Excepción no capturada:", error);
});