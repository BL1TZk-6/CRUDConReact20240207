import mongoose from "mongoose"; // importamos Mongoose para conectar con la base
import { config } from "./config.js"; // importamos la configuración

mongoose.connect(config.db.URI); // conectamos a la base de datos

//Comprobar que todo funciona
const connection = mongoose.connection;

connection.once("open", () => { // evento que se ejecuta cuando la conexión se abre exitosamente
  console.log("DB is connected");
});

connection.on("disconnected", (error) => { // evento que se ejecuta cuando la conexión se desconecta
  console.log("DB is disconnected" + error);
});

connection.on("error", (error) => { // evento que se ejecuta cuando ocurre un error en la conexión
  console.log("error found" + error);
});