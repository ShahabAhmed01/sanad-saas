"use client";

import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store";
import { themes, type ThemeName } from "@/lib/themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, theme, toggleMode, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="flex items-center gap-1">
        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mode === "dark" ? (
            <Sun className="h-4 w-4 text-accent" />
          ) : (
            <Moon className="h-4 w-4 text-slate" />
          )}
        </button>

        {/* Theme picker */}
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          title="Change theme"
        >
          <Palette className="h-4 w-4 text-slate" />
        </button>
      </div>

      {/* Theme dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Theme
          </p>
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                setTheme(t.name as ThemeName);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                theme === t.name
                  ? "bg-accent/10 text-accent"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: t.light.accent }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: t.dark.accent }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t.description}
                </p>
              </div>
              {theme === t.name && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
