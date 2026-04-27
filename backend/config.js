import dotenv from "dotenv"; // librería para cargar variables de entorno desde un archivo .env

//Ejecutamos la libreria dotenv
dotenv.config();

export const config = { // exportamos un objeto de configuración con las variables de entorno necesarias para la aplicación
  db: {
    URI: process.env.DB_URI,
  },
  JWT: {
    secret: process.env.JWT_secret_key,
  },
  email: {
    senderEmail: process.env.SENDER_EMAIL || process.env.USER_EMAIL,
    senderPassword: process.env.SENDER_PASSWORD || process.env.USER_PASSWORD,
  },
  app: {
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};