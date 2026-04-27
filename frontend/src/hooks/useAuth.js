import { useContext } from "react"; // Importación de useContext para acceder al contexto de autenticación
import { AuthContext } from "../contexts/authContext"; // Importación del contexto de autenticación para acceder a la información del usuario y las funciones de autenticación

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
