//Nombres de cookies centralizados
export const COOKIE_NAMES = {
  ACCESS:       "authCookie",
  REFRESH:      "refreshCookie",
  REGISTRATION: "resgistrationCookie",
  PASSWORD_RECOVERY: "passwordRecoveryCookie",
};

//Opciones base
const BASE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
};

const MS = {
  FIVE_MIN: 5 * 60 * 1000,
};

//Cookies de autenticación (acceso + renovación)

/**
 * Setea las dos cookies de autenticación:
 * authCookie    - token de acceso      (5 min)
 * refreshCookie - token de renovación  (5 min)
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(COOKIE_NAMES.ACCESS, accessToken, {
    ...BASE_OPTIONS,
    maxAge: MS.FIVE_MIN,
  });
  res.cookie(COOKIE_NAMES.REFRESH, refreshToken, {
    ...BASE_OPTIONS,
    maxAge: MS.FIVE_MIN,
  });
};

//Limpia ambas cookies de autenticación.
export const clearAuthCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS, BASE_OPTIONS);
  res.clearCookie(COOKIE_NAMES.REFRESH, BASE_OPTIONS);
};

//Cookie de registro

/** Setea la cookie temporal de verificación de registro (5 min). */
export const setRegistrationCookie = (res, token) => {
  res.cookie(COOKIE_NAMES.REGISTRATION, token, {
    ...BASE_OPTIONS,
    maxAge: MS.FIVE_MIN,
  });
};

//Limpia la cookie de registro.
export const clearRegistrationCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REGISTRATION, BASE_OPTIONS);
};

//Cookie de recuperación de contraseña

/** Setea la cookie temporal para recuperación de contraseña (5 min). */
export const setPasswordRecoveryCookie = (res, token) => {
  res.cookie(COOKIE_NAMES.PASSWORD_RECOVERY, token, {
    ...BASE_OPTIONS,
    maxAge: MS.FIVE_MIN,
  });
};

//Limpia la cookie de recuperación de contraseña.
export const clearPasswordRecoveryCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.PASSWORD_RECOVERY, BASE_OPTIONS);
};
