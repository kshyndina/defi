import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toTitleCase(str: string): string {
  // Handle special cases like "&" that should remain lowercase
  return str.replace(/\w+(&\w+)?/g, (txt) => {
    // If the word contains "&", split and capitalize each part
    if (txt.includes('&')) {
      return txt.split('&')
        .map(part => part.charAt(0).toUpperCase() + part.substr(1).toLowerCase())
        .join(' & ');
    }
    // Otherwise just capitalize the first letter
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
