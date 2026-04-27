// devuelve el checklist de seguridad de contraseña para mostrar feedback en la UI
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
      label: "Una letra mayúscula",
      valid: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: "Una letra minúscula",
      valid: /[a-z]/.test(password),
    },
    {
      key: "number",
      label: "Un número",
      valid: /\d/.test(password),
    },
    {
      key: "symbol",
      label: "Un carácter especial",
      valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    },
  ];
};

// retorna true solo si la contraseña cumple todos los criterios definidos
export const isStrongPassword = (value = "") =>
  getPasswordCriteria(value).every((criterion) => criterion.valid);
