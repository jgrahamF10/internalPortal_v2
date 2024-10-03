import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/tailwind.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ThemeColors() {
  // Use a type assertion to treat tailwindConfig as Config type
  const fullConfig = resolveConfig(tailwindConfig as any);
  const backgroundColor = fullConfig.theme?.colors?.background;
  const fontColor = fullConfig.theme?.colors?.primary?.foreground;
  const mutedColor = fullConfig.theme?.colors?.muted?.foreground;

  return {
    backgroundColor,
    fontColor,
    mutedColor,
  };
}