"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AgencyTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  name?: string;
}

interface ThemeContextType {
  theme: AgencyTheme;
  setTheme: (theme: AgencyTheme) => void;
}

const defaultTheme: AgencyTheme = {
  primaryColor: "#3b82f6", // blue-500
  secondaryColor: "#1e293b", // slate-800
  accentColor: "#60a5fa", // blue-400
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<AgencyTheme>;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<AgencyTheme>({
    ...defaultTheme,
    ...initialTheme,
  });

  useEffect(() => {
    // Apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primaryColor);
    root.style.setProperty("--color-secondary", theme.secondaryColor);
    root.style.setProperty("--color-accent", theme.accentColor);

    // Also set RGB values for opacity variants
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : "59, 130, 246";
    };

    root.style.setProperty("--color-primary-rgb", hexToRgb(theme.primaryColor));
    root.style.setProperty("--color-secondary-rgb", hexToRgb(theme.secondaryColor));
    root.style.setProperty("--color-accent-rgb", hexToRgb(theme.accentColor));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useAgencyColors() {
  const { theme } = useTheme();
  return {
    primary: theme.primaryColor,
    secondary: theme.secondaryColor,
    accent: theme.accentColor,
  };
}
