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
