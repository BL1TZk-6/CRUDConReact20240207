import { Schema, model } from "mongoose"; // importamos Schema y model de Mongoose

const userSchema = new Schema( // definimos el esquema de usuarios con los campos name, lastName, birthdate, email, password, isVerified, loginAttemps y timeOut
  {
    name: { type: String, required: true }, // el nombre del usuario es un string obligatorio
    lastName: { type: String, required: true }, // el apellido del usuario es un string obligatorio
    birthDate: { type: Date, required: true }, // la fecha de nacimiento del usuario es un Date obligatorio
    email: { type: String, required: true }, // el correo electrónico del usuario es un string obligatorio
    password: { type: String, required: true, minlength: 8 }, // la contraseña del usuario es un string obligatorio con una longitud mínima de 8 caracteres
    userType: { // el tipo de usuario es un string que puede ser "admin", "supervisor", "vendedor" o "usuario", con un valor por defecto de "usuario"
      type: String,
      enum: ["admin", "supervisor", "vendedor", "usuario"],
      default: "usuario",
    },
    isVerified: { type: Boolean, default: false }, // indica si el usuario ha verificado su cuenta, es un booleano opcional
    currentSessionId: { type: String, default: null }, // identificador de la única sesión activa permitida para el usuario
    loginAttemps: { type: Number, default: 0, max: 5 }, // el número de intentos de inicio de sesión fallidos, es un número opcional con un valor máximo de 5
    timeOut: { type: Date }, // la fecha y hora del último intento de inicio de sesión fallido es un Date opcional
  },
  {
    timestamps: true, // agrega campos createdAt y updatedAt automáticamente
    strict: false, // permite guardar campos adicionales que no estén definidos en el esquema (opcional)
  },
);

export default model("Users", userSchema); // exportamos el modelo de usuarios para usarlo en los controladores y rutas