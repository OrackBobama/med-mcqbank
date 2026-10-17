"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type AccentColor = "clinical" | "emerald" | "violet" | "rose" | "amber";

interface ThemeContextValue {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  applyTheme: (mode: ThemeMode, color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "light",
  accentColor: "clinical",
  setThemeMode: () => {},
  setAccentColor: () => {},
  applyTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function applyDomTheme(mode: ThemeMode, color: AccentColor) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-accent", color);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [accentColor, setAccentColorState] = useState<AccentColor>("clinical");

  useEffect(() => {
    // Load cached preference from localStorage immediately
    const savedMode = (localStorage.getItem("fracto_theme_mode") ||
      "light") as ThemeMode;
    const savedAccent = (localStorage.getItem("fracto_accent_color") ||
      "clinical") as AccentColor;

    setThemeModeState(savedMode);
    setAccentColorState(savedAccent);
    applyDomTheme(savedMode, savedAccent);

    // Sync from authenticated user profile if logged in
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          const userMode = (data.user.themeMode || savedMode) as ThemeMode;
          const userAccent = (data.user.accentColor ||
            savedAccent) as AccentColor;
          setThemeModeState(userMode);
          setAccentColorState(userAccent);
          localStorage.setItem("fracto_theme_mode", userMode);
          localStorage.setItem("fracto_accent_color", userAccent);
          applyDomTheme(userMode, userAccent);
        }
      })
      .catch(() => {});
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("fracto_theme_mode", mode);
    applyDomTheme(mode, accentColor);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem("fracto_accent_color", color);
    applyDomTheme(themeMode, color);
  };

  const applyTheme = (mode: ThemeMode, color: AccentColor) => {
    setThemeModeState(mode);
    setAccentColorState(color);
    localStorage.setItem("fracto_theme_mode", mode);
    localStorage.setItem("fracto_accent_color", color);
    applyDomTheme(mode, color);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        accentColor,
        setThemeMode,
        setAccentColor,
        applyTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
