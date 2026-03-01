import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número para o padrão de milhares.
 * Exemplo: 1500.5 -> "1.500,50" ou "1.500" dependendo da necessidade.
 */
export const addThousandsSeparator = (
  value: number | string | undefined,
): string => {
  if (value === undefined || value === null) return "0,00";

  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numberValue)) return "0,00";

  // Formata para o padrão brasileiro (pt-BR)
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

/**
 * Opcional: Uma versão que retorna apenas o número inteiro com separador,
 * útil para labels pequenos dentro de gráficos como o Circle Packing.
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};
