import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get a specific piece of normalized location data
export function normalizePlaceName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.replace(/\s+/g, ' ').trim();
}
