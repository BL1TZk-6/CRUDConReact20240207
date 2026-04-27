import { clsx } from "clsx"; // clsx para combinar clases de manera condicional
import { twMerge } from "tailwind-merge" // twMerge para eliminar clases duplicadas y resolver conflictos de Tailwind

export function cn(...inputs) { // Función para combinar clases de Tailwind
  return twMerge(clsx(inputs));
}
