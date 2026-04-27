import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import productsRoutes from "./src/routes/products.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import userRoutes from "./src/routes/users.js";
import registerUsersRoutes from "./src/routes/registerUsers.js";
import refreshRoutes from "./src/routes/refresh.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";


const app = express();

const allowedOrigins = [ // Seagregan orígenes permitidos para CORS, incluyendo la URL del frontend desde variables de entorno o un valor por defecto
	process.env.FRONTEND_URL,
	"http://localhost:5173",
].filter(Boolean);

app.use( // Configuración de CORS para permitir solicitudes desde el frontend y manejar credenciales
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error("Origen no permitido por CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use(cookieParser()); // Middleware para parsear cookies en las solicitudes entrantes

app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos codificados en URL, útil para formularios tradicionales

//Rutas
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/refresh", refreshRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/register", registerUsersRoutes);
app.use("/api/password-recovery", passwordRecoveryRoutes);

export default app;