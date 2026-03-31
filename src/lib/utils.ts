import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const joinWithConjunction = (
  items: readonly string[],
  type: "and" | "or" = "and"
): string => {
  return (
    items.slice(0, -1).join(", ") +
    (items.length > 1 ? ` ${type} ` : "") +
    items[items.length - 1]
  );
};

export const clampText = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 3).trimEnd()}...`;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
