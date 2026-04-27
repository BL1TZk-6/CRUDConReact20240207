const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const ONLY_LETTERS_REGEX = /^[\p{L}\s'’-]+$/u;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const ONLY_ALPHANUMERIC_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OTP_REGEX = /^[a-f0-9]{6}$/i;
const USER_TYPES = ["admin", "supervisor", "vendedor", "usuario"];

// construye el detalle de requisitos de una contraseña para poder reutilizarlo en las validaciones o en la interfaz
export const getPasswordCriteria = (value = "") => {
	const password = typeof value === "string" ? value : "";

	return [
		{
			key: "length",
			label: "Mínimo 8 caracteres",
			valid: password.length >= 8,
		},
		{
			key: "uppercase",
			label: "Al menos una mayúscula",
			valid: /[A-Z]/.test(password),
		},
		{
			key: "lowercase",
			label: "Al menos una minúscula",
			valid: /[a-z]/.test(password),
		},
		{
			key: "number",
			label: "Al menos un número",
			valid: /\d/.test(password),
		},
		{
			key: "symbol",
			label: "Al menos un carácter especial",
			valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
		},
	];
};

// centraliza los mensajes de error de contraseña para reutilizarlos en registro, recuperación y otros flujos
export const getPasswordValidationErrors = (value = "", fieldName = "password") => {
	const password = typeof value === "string" ? value : "";
	const errors = [];

	if (!password) {
		errors.push(`${fieldName} es obligatorio`);
		return errors;
	}

	if (!hasMinLength(password, 8)) {
		errors.push(`${fieldName} debe tener al menos 8 caracteres`);
	}

	if (!isStrongPassword(password)) {
		errors.push(`${fieldName} debe incluir mayúscula, minúscula, número y carácter especial`);
	}

	return errors;
};

const normalizeString = (value) => {
	if (typeof value !== "string") return "";
	return value.trim().normalize("NFC");
};

/** Solo letras (incluye acentos, ñ y espacios) */
export const isOnlyLetters = (value) =>
	typeof value === "string" && ONLY_LETTERS_REGEX.test(value.trim());

/** Solo dígitos (0-9, sin puntos ni comas) */
export const isOnlyNumbers = (value) =>
	typeof value === "string" && ONLY_NUMBERS_REGEX.test(value.trim());

/** Solo letras y números, sin espacios ni caracteres especiales */
export const isAlphanumeric = (value) =>
	typeof value === "string" && ONLY_ALPHANUMERIC_REGEX.test(value.trim());

/** Longitud mínima (sin contar espacios extremos) */
export const hasMinLength = (value, min) =>
	typeof value === "string" && value.trim().length >= min;

/** Longitud máxima (sin contar espacios extremos) */
export const hasMaxLength = (value, max) =>
	typeof value === "string" && value.trim().length <= max;

/** Longitud dentro de un rango [min, max] */
export const hasLengthBetween = (value, min, max) =>
	hasMinLength(value, min) && hasMaxLength(value, max);

/**
 * Correo con validación estricta:
 * - usuario válido (sin doble punto, no empieza/termina con punto)
 * - dominio con al menos un punto
 * - TLD de 2+ caracteres
 */
export const isValidEmail = (value) => {
	if (typeof value !== "string") return false;
	const email = value.trim().toLowerCase();
	if (!EMAIL_REGEX.test(email)) return false;
	const [local, domain] = email.split("@");
	if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
	if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false;
	return true;
};

/**
 * Contraseña fuerte:
 * mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
 */
export const isStrongPassword = (value) =>
	typeof value === "string" && STRONG_PASSWORD_REGEX.test(value);

/** Número de teléfono: acepta +503 xxxx-xxxx, (xxx) xxx-xxxx, etc. */
export const isValidPhone = (value) =>
	typeof value === "string" && PHONE_REGEX.test(value.trim());

/** URL válida que empieza con http:// o https:// */
export const isValidUrl = (value) =>
	typeof value === "string" && URL_REGEX.test(value.trim());

/** Slug: solo minúsculas, números y guiones (ej: "mi-producto-123") */
export const isValidSlug = (value) =>
	typeof value === "string" && SLUG_REGEX.test(value.trim());

/** Entero positivo (> 0) */
export const isPositiveInteger = (value) => {
	const n = Number(value);
	return Number.isInteger(n) && n > 0;
};

/** Número no negativo (>= 0) */
export const isNonNegativeNumber = (value) => {
	const n = Number(value);
	return Number.isFinite(n) && n >= 0;
};

/** Valor dentro de un rango numérico [min, max] */
export const isInRange = (value, min, max) => {
	const n = Number(value);
	return Number.isFinite(n) && n >= min && n <= max;
};

export const validateObjectId = (value) => OBJECT_ID_REGEX.test(String(value || ""));

export const validateRegisterPayload = (payload = {}) => {
	const errors = [];
	const name = normalizeString(payload.name);
	const lastName = normalizeString(payload.lastName);
	const email = normalizeString(payload.email).toLowerCase();
	const password = typeof payload.password === "string" ? payload.password : "";
	const birthDate = payload.birthDate;
	const userType = normalizeString(payload.userType || "usuario").toLowerCase();

	if (!name) errors.push("name es obligatorio");
	else if (!isOnlyLetters(name)) errors.push("name solo debe contener letras");
	else if (!hasLengthBetween(name, 2, 50)) errors.push("name debe tener entre 2 y 50 caracteres");

	if (!lastName) errors.push("lastName es obligatorio");
	else if (!isOnlyLetters(lastName)) errors.push("lastName solo debe contener letras");
	else if (!hasLengthBetween(lastName, 2, 50)) errors.push("lastName debe tener entre 2 y 50 caracteres");

	if (!email || !isValidEmail(email)) errors.push("email inválido");

	if (!password) {
		errors.push("password es obligatorio");
	} else {
		errors.push(...getPasswordValidationErrors(password, "password"));
	}

	if (birthDate === undefined || birthDate === null || birthDate === "") {
		errors.push("birthDate es obligatorio");
	} else {
		const parsedDate = new Date(birthDate);
		if (Number.isNaN(parsedDate.getTime())) {
			errors.push("birthDate inválido");
		}
	}

	if (!USER_TYPES.includes(userType)) {
		errors.push(`userType inválido. Tipos permitidos: ${USER_TYPES.join(", ")}`);
	}

	return {
		valid: errors.length === 0,
		errors,
		data: {
			name,
			lastName,
			email,
			password,
			birthDate,
			userType,
			isVerified: false,
		},
	};
};

export const validatePasswordRecoveryRequestPayload = (payload = {}) => {
	const errors = [];
	const email = normalizeString(payload.email).toLowerCase();

	if (!email || !isValidEmail(email)) {
		errors.push("email inválido");
	}

	return {
		valid: errors.length === 0,
		errors,
		data: { email },
	};
};

export const validatePasswordRecoveryConfirmPayload = (payload = {}) => {
	const errors = [];
	const verificationCodeRequest = normalizeString(payload.verificationCodeRequest);
	const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";

	if (!verificationCodeRequest) {
		errors.push("verificationCodeRequest es obligatorio");
	} else if (!OTP_REGEX.test(verificationCodeRequest)) {
		errors.push("verificationCodeRequest debe ser un código hexadecimal de 6 caracteres");
	}

	if (!newPassword) {
		errors.push("newPassword es obligatorio");
	} else {
		errors.push(...getPasswordValidationErrors(newPassword, "newPassword"));
	}

	return {
		valid: errors.length === 0,
		errors,
		data: {
			verificationCodeRequest,
			newPassword,
		},
	};
};

export const validateLoginPayload = (payload = {}) => {
	const errors = [];
	const email = normalizeString(payload.email);
	const password = typeof payload.password === "string" ? payload.password : "";

	if (!email || !isValidEmail(email)) errors.push("Correo inválido");
	if (!password) errors.push("La contraseña es obligatoria");
	else if (!hasMinLength(password, 8)) errors.push("La contraseña debe tener al menos 8 caracteres");

	return {
		valid: errors.length === 0,
		errors,
		data: { email, password },
	};
};

export const validateUserUpdatePayload = (payload = {}) => {
	const errors = [];
	const allowedFields = ["name", "lastName", "birthDate", "email", "isVerified", "userType"];
	const updateData = {};

	for (const key of Object.keys(payload || {})) {
		if (!allowedFields.includes(key)) {
			errors.push(`Campo no permitido: ${key}`);
		}
	}

	if (payload.name !== undefined) {
		const name = normalizeString(payload.name);
		if (!name) errors.push("name no puede ser vacio");
		else if (!isOnlyLetters(name)) errors.push("name solo debe contener letras");
		else if (!hasLengthBetween(name, 2, 50)) errors.push("name debe tener entre 2 y 50 caracteres");
		else updateData.name = name;
	}

	if (payload.lastName !== undefined) {
		const lastName = normalizeString(payload.lastName);
		if (!lastName) errors.push("lastName no puede ser vacio");
		else if (!isOnlyLetters(lastName)) errors.push("lastName solo debe contener letras");
		else if (!hasLengthBetween(lastName, 2, 50)) errors.push("lastName debe tener entre 2 y 50 caracteres");
		else updateData.lastName = lastName;
	}

	if (payload.email !== undefined) {
		const email = normalizeString(payload.email).toLowerCase();
		if (!isValidEmail(email)) errors.push("email inválido");
		else updateData.email = email;
	}

	if (payload.birthDate !== undefined) {
		const parsedDate = new Date(payload.birthDate);
		if (Number.isNaN(parsedDate.getTime())) errors.push("birthDate inválido");
		else updateData.birthDate = payload.birthDate;
	}

	if (payload.isVerified !== undefined) {
		updateData.isVerified = Boolean(payload.isVerified);
	}

	if (payload.userType !== undefined) {
		const userType = normalizeString(payload.userType).toLowerCase();
		if (!USER_TYPES.includes(userType)) {
			errors.push(`userType inválido. Tipos permitidos: ${USER_TYPES.join(", ")}`);
		} else {
			updateData.userType = userType;
		}
	}

	if (Object.keys(updateData).length === 0) {
		errors.push("No hay datos validos para actualizar");
	}

	return {
		valid: errors.length === 0,
		errors,
		data: updateData,
	};
};

export const validateProductPayload = (payload = {}, options = { partial: false }) => {
	const errors = [];
	const partial = Boolean(options.partial);
	const data = {};

	const requiredFields = ["name", "price", "stock"];
	if (!partial) {
		for (const field of requiredFields) {
			if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
				errors.push(`${field} es obligatorio`);
			}
		}
	}

	if (payload.name !== undefined) {
		const name = normalizeString(payload.name);
		if (!name) errors.push("name no puede ser vacio");
		else if (!hasLengthBetween(name, 2, 100)) errors.push("name del producto debe tener entre 2 y 100 caracteres");
		else data.name = name;
	}

	if (payload.description !== undefined) {
		const description = normalizeString(payload.description);
		if (description && !hasMaxLength(description, 500)) errors.push("description no puede superar 500 caracteres");
		else data.description = description;
	}

	if (payload.price !== undefined) {
		if (!isNonNegativeNumber(payload.price)) {
			errors.push("price debe ser un número mayor o igual a 0");
		} else {
			data.price = Number(payload.price);
		}
	}

	if (payload.stock !== undefined) {
		if (!isNonNegativeNumber(payload.stock) || !Number.isInteger(Number(payload.stock))) {
			errors.push("stock debe ser un entero mayor o igual a 0");
		} else {
			data.stock = Number(payload.stock);
		}
	}

	if (partial && Object.keys(data).length === 0) {
		errors.push("No hay datos validos para actualizar");
	}

	return {
		valid: errors.length === 0,
		errors,
		data,
	};
};

