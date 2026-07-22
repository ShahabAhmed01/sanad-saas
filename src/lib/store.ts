import { create } from "zustand";
import { type ThemeName, type ModeName, applyTheme } from "./themes";

interface ThemeStore {
  theme: ThemeName;
  mode: ModeName;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ModeName) => void;
  toggleMode: () => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "noor-classic",
  mode: "light",

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("sanad-theme", theme);
    applyTheme(theme, get().mode);
  },

  setMode: (mode) => {
    set({ mode });
    localStorage.setItem("sanad-mode", mode);
    applyTheme(get().theme, mode);
  },

  toggleMode: () => {
    const next = get().mode === "dark" ? "light" : "dark";
    get().setMode(next);
  },

  hydrate: () => {
    try {
      const savedTheme = localStorage.getItem("sanad-theme") as ThemeName | null;
      const savedMode = localStorage.getItem("sanad-mode") as ModeName | null;

      const mode =
        savedMode ||
        (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      const theme = savedTheme || "noor-classic";

      set({ theme, mode });
      applyTheme(theme, mode);
    } catch {
      // localStorage unavailable (SSR, incognito, etc.)
      set({ theme: "noor-classic", mode: "light" });
    }
  },
}));
