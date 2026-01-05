import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem("mode") || "dark");
  const [accent, setAccent] = useState(localStorage.getItem("accent") || "violet");

  useEffect(() => {
    const root = document.documentElement;

    // Reset mode classes
    root.classList.toggle("light", mode === "light");

    // Remove all accent classes first
    root.classList.remove(
      "theme-violet",
      "theme-rose",
      "theme-emerald",
      "theme-indigo",
      "theme-orange",
      "theme-teal",
      "theme-pink",
      "theme-lime"
    );

    // Add the active accent class
    root.classList.add(`theme-${accent}`);

    // Persist in localStorage
    localStorage.setItem("mode", mode);
    localStorage.setItem("accent", accent);
  }, [mode, accent]);

  const value = { mode, setMode, accent, setAccent };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
