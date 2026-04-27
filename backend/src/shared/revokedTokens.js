import jsonwebtoken from "jsonwebtoken"; // librería para manejar JSON Web Tokens

const revokedTokens = new Map(); // Mapa para almacenar tokens revocados
const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

const purgeExpiredRevocations = () => { // Función para eliminar tokens revocados
  const now = Date.now(); // obtenemos el tiempo actual

  for (const [token, expiresAt] of revokedTokens.entries()) {
    if (expiresAt <= now) { // si el token ha expirado, lo eliminamos del mapa
      revokedTokens.delete(token);
    }
  }
};

const getTokenExpiry = (token) => { // Función para obtener la fecha de expiración de un token
  const decodedToken = jsonwebtoken.decode(token);

  if (!decodedToken || typeof decodedToken !== "object" || !decodedToken.exp) {
    return Date.now() + FIVE_MINUTES_IN_MS; // si no se puede decodificar, asumimos la expiración máxima permitida
  }

  return decodedToken.exp * 1000; // convertimos la fecha de expiración a milisegundos
};

export const revokeToken = (token) => {
  if (!token) { // si no se proporciona un token, no hacemos nada
    return;
  }

  purgeExpiredRevocations();
  revokedTokens.set(token, getTokenExpiry(token)); // agregamos el token al mapa
};

export const isTokenRevoked = (token) => {
  if (!token) { // si no se proporciona un token, no está revocado
    return false;
  }

  purgeExpiredRevocations();

  const expiresAt = revokedTokens.get(token); // obtenemos la fecha de expiración del token
  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    revokedTokens.delete(token); // si el token ha expirado, lo eliminamos del mapa y consideramos que no está revocado
    return false;
  }

  return true; // el token está revocado y aún no ha expirado
};