import { describe, it, expect, beforeEach, vi } from "vitest";
import { useThemeStore } from "@/lib/store";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(globalThis, "window", {
  value: {
    matchMedia: vi.fn().mockReturnValue({ matches: false }),
  },
});

describe("Theme Store (Zustand)", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset store state between tests
    useThemeStore.setState({
      theme: "noor-classic",
      mode: "light",
    });
  });

  it("has default state", () => {
    const state = useThemeStore.getState();
    expect(state.theme).toBe("noor-classic");
    expect(state.mode).toBe("light");
  });

  it("setTheme updates theme", () => {
    useThemeStore.getState().setTheme("emerald-dusk");
    expect(useThemeStore.getState().theme).toBe("emerald-dusk");
  });

  it("setTheme persists to localStorage", () => {
    useThemeStore.getState().setTheme("emerald-dusk");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sanad-theme", "emerald-dusk");
  });

  it("setMode updates mode", () => {
    useThemeStore.getState().setMode("dark");
    expect(useThemeStore.getState().mode).toBe("dark");
  });

  it("setMode persists to localStorage", () => {
    useThemeStore.getState().setMode("dark");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("sanad-mode", "dark");
  });

  it("toggleMode switches between light and dark", () => {
    useThemeStore.getState().setMode("light");
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("dark");
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("light");
  });

  it("hydrate reads from localStorage", () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "sanad-theme") return "midnight-royal";
      if (key === "sanad-mode") return "dark";
      return null;
    });

    useThemeStore.getState().hydrate();
    const state = useThemeStore.getState();
    expect(state.theme).toBe("midnight-royal");
    expect(state.mode).toBe("dark");
  });

  it("hydrate defaults to noor-classic when no localStorage", () => {
    localStorageMock.getItem.mockReturnValue(null);

    useThemeStore.getState().hydrate();
    const state = useThemeStore.getState();
    expect(state.theme).toBe("noor-classic");
  });
});
