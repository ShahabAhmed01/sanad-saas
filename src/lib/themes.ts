/**
 * Sanad Theme System — 4 Premium Themes + Dark Mode
 * Each theme defines complete CSS variable overrides for the entire UI.
 */

export type ThemeName =
  | "noor-classic"
  | "emerald-dusk"
  | "warm-sand"
  | "midnight-royal";

export type ModeName = "light" | "dark";

export interface ThemeColors {
  // Brand
  ink: string;
  paper: string;
  paperRaised: string;
  accent: string;
  accentInk: string;
  success: string;
  danger: string;
  slate: string;
  slateLight: string;

  // Sidebar
  sidebarBg: string;
  sidebarFg: string;
  sidebarAccent: string;
  sidebarBorder: string;

  // Charts
  chart1: string;
  chart2: string;
  chart3: string;
}

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: ThemeDefinition[] = [
  {
    name: "noor-classic",
    label: "Noor Classic",
    description: "Clean, professional — the original Sanad look",
    light: {
      ink: "#12332F",
      paper: "#F7F6F1",
      paperRaised: "#FFFFFF",
      accent: "#A07426",
      accentInk: "#7A5A1F",
      success: "#1F7A5C",
      danger: "#BD4545",
      slate: "#6B6B62",
      slateLight: "#E4E2D8",
      sidebarBg: "#12332F",
      sidebarFg: "#FFFFFF",
      sidebarAccent: "rgba(160, 116, 38, 0.15)",
      sidebarBorder: "rgba(255, 255, 255, 0.1)",
      chart1: "#A07426",
      chart2: "#1F7A5C",
      chart3: "#BD4545",
    },
    dark: {
      ink: "#E8E6E1",
      paper: "#0B1E1B",
      paperRaised: "#132C28",
      accent: "#C9923A",
      accentInk: "#C9923A",
      success: "#2A9D7A",
      danger: "#E05555",
      slate: "#9A9A91",
      slateLight: "#1E3D38",
      sidebarBg: "#071512",
      sidebarFg: "#E8E6E1",
      sidebarAccent: "rgba(201, 146, 58, 0.2)",
      sidebarBorder: "rgba(255, 255, 255, 0.08)",
      chart1: "#C9923A",
      chart2: "#2A9D7A",
      chart3: "#E05555",
    },
  },
  {
    name: "emerald-dusk",
    label: "Emerald Dusk",
    description: "Rich, dark tones — premium and authoritative",
    light: {
      ink: "#0F2922",
      paper: "#F4F7F5",
      paperRaised: "#FFFFFF",
      accent: "#1A7A5A",
      accentInk: "#0E5C42",
      success: "#16A34A",
      danger: "#DC2626",
      slate: "#5E7A6E",
      slateLight: "#D4E4DA",
      sidebarBg: "#0F2922",
      sidebarFg: "#FFFFFF",
      sidebarAccent: "rgba(26, 122, 90, 0.15)",
      sidebarBorder: "rgba(255, 255, 255, 0.1)",
      chart1: "#1A7A5A",
      chart2: "#16A34A",
      chart3: "#DC2626",
    },
    dark: {
      ink: "#E4EDE8",
      paper: "#0A1A15",
      paperRaised: "#112A22",
      accent: "#34D399",
      accentInk: "#34D399",
      success: "#22C55E",
      danger: "#F87171",
      slate: "#8FAF9E",
      slateLight: "#1A3D32",
      sidebarBg: "#061510",
      sidebarFg: "#E4EDE8",
      sidebarAccent: "rgba(52, 211, 153, 0.2)",
      sidebarBorder: "rgba(255, 255, 255, 0.08)",
      chart1: "#34D399",
      chart2: "#22C55E",
      chart3: "#F87171",
    },
  },
  {
    name: "warm-sand",
    label: "Warm Sand",
    description: "Earthy, inviting — warm and approachable",
    light: {
      ink: "#2D2016",
      paper: "#FAF6F0",
      paperRaised: "#FFFFFF",
      accent: "#A6612E",
      accentInk: "#7A4A22",
      success: "#3D8B37",
      danger: "#C53030",
      slate: "#7A6B5C",
      slateLight: "#E8DDD0",
      sidebarBg: "#2D2016",
      sidebarFg: "#FFFFFF",
      sidebarAccent: "rgba(166, 97, 46, 0.15)",
      sidebarBorder: "rgba(255, 255, 255, 0.1)",
      chart1: "#A6612E",
      chart2: "#3D8B37",
      chart3: "#C53030",
    },
    dark: {
      ink: "#F0E8DE",
      paper: "#1A1410",
      paperRaised: "#261E16",
      accent: "#D4944A",
      accentInk: "#D4944A",
      success: "#4ADE80",
      danger: "#F87171",
      slate: "#A89888",
      slateLight: "#3A2E24",
      sidebarBg: "#110E0A",
      sidebarFg: "#F0E8DE",
      sidebarAccent: "rgba(212, 148, 74, 0.2)",
      sidebarBorder: "rgba(255, 255, 255, 0.08)",
      chart1: "#D4944A",
      chart2: "#4ADE80",
      chart3: "#F87171",
    },
  },
  {
    name: "midnight-royal",
    label: "Midnight Royal",
    description: "Deep blue — modern and sophisticated",
    light: {
      ink: "#1A1F36",
      paper: "#F5F6FA",
      paperRaised: "#FFFFFF",
      accent: "#4A5FA5",
      accentInk: "#374880",
      success: "#059669",
      danger: "#DC2626",
      slate: "#6B7280",
      slateLight: "#DDE1EA",
      sidebarBg: "#1A1F36",
      sidebarFg: "#FFFFFF",
      sidebarAccent: "rgba(74, 95, 165, 0.15)",
      sidebarBorder: "rgba(255, 255, 255, 0.1)",
      chart1: "#4A5FA5",
      chart2: "#059669",
      chart3: "#DC2626",
    },
    dark: {
      ink: "#E2E4ED",
      paper: "#0C0F1A",
      paperRaised: "#151929",
      accent: "#7B8FD4",
      accentInk: "#7B8FD4",
      success: "#34D399",
      danger: "#F87171",
      slate: "#9CA3AF",
      slateLight: "#1E2440",
      sidebarBg: "#080B14",
      sidebarFg: "#E2E4ED",
      sidebarAccent: "rgba(123, 143, 212, 0.2)",
      sidebarBorder: "rgba(255, 255, 255, 0.08)",
      chart1: "#7B8FD4",
      chart2: "#34D399",
      chart3: "#F87171",
    },
  },
];

export function getTheme(name: ThemeName): ThemeDefinition {
  return themes.find((t) => t.name === name) || themes[0];
}

/**
 * Convert a ThemeColors object to CSS custom properties.
 */
export function themeToCSS(c: ThemeColors): Record<string, string> {
  return {
    "--paper": c.paper,
    "--paper-raised": c.paperRaised,
    "--ink": c.ink,
    "--accent": c.accent,
    "--accent-ink": c.accentInk,
    "--success": c.success,
    "--danger": c.danger,
    "--slate": c.slate,
    "--slate-light": c.slateLight,
    "--color-background": c.paper,
    "--color-foreground": c.ink,
    "--color-card": c.paperRaised,
    "--color-card-foreground": c.ink,
    "--color-popover": c.paperRaised,
    "--color-popover-foreground": c.ink,
    "--color-primary": c.accent,
    "--color-primary-foreground": c.paperRaised,
    "--color-secondary": c.slateLight,
    "--color-secondary-foreground": c.ink,
    "--color-muted": c.slateLight,
    "--color-muted-foreground": c.slate,
    "--color-accent": c.accent,
    "--color-accent-foreground": c.accentInk,
    "--color-destructive": c.danger,
    "--color-border": c.slateLight,
    "--color-input": c.slateLight,
    "--color-ring": c.accent,
    "--color-success": c.success,
    "--color-chart-1": c.chart1,
    "--color-chart-2": c.chart2,
    "--color-chart-3": c.chart3,
    "--color-sidebar": c.sidebarBg,
    "--color-sidebar-foreground": c.sidebarFg,
    "--color-sidebar-primary": c.accent,
    "--color-sidebar-primary-foreground": c.paperRaised,
    "--color-sidebar-accent": c.sidebarAccent,
    "--color-sidebar-accent-foreground": c.paperRaised,
    "--color-sidebar-border": c.sidebarBorder,
    "--color-sidebar-ring": c.accent,
  };
}

/**
 * Apply a theme to the document root.
 */
export function applyTheme(themeName: ThemeName, mode: ModeName) {
  const theme = getTheme(themeName);
  const colors = mode === "dark" ? theme.dark : theme.light;
  const css = themeToCSS(colors);

  const root = document.documentElement;

  // Apply theme name as data attribute
  root.setAttribute("data-theme", themeName);

  // Apply dark class
  root.classList.toggle("dark", mode === "dark");

  // Set CSS variables
  for (const [key, value] of Object.entries(css)) {
    root.style.setProperty(key, value);
  }
}
