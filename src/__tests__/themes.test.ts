import { describe, it, expect } from "vitest";
import { themes, applyTheme } from "@/lib/themes";

describe("Themes", () => {
  describe("themes array", () => {
    it("has 4 themes", () => {
      expect(themes).toHaveLength(4);
    });

    it("has noor-classic theme", () => {
      const theme = themes.find((t) => t.name === "noor-classic");
      expect(theme).toBeDefined();
      expect(theme!.label).toBe("Noor Classic");
    });

    it("has emerald-dusk theme", () => {
      const theme = themes.find((t) => t.name === "emerald-dusk");
      expect(theme).toBeDefined();
      expect(theme!.label).toBe("Emerald Dusk");
    });

    it("has warm-sand theme", () => {
      const theme = themes.find((t) => t.name === "warm-sand");
      expect(theme).toBeDefined();
      expect(theme!.label).toBe("Warm Sand");
    });

    it("has midnight-royal theme", () => {
      const theme = themes.find((t) => t.name === "midnight-royal");
      expect(theme).toBeDefined();
      expect(theme!.label).toBe("Midnight Royal");
    });

    it("each theme has light and dark variants", () => {
      for (const theme of themes) {
        expect(theme.light, `${theme.name} missing light`).toBeDefined();
        expect(theme.dark, `${theme.name} missing dark`).toBeDefined();
        expect(theme.light.accent, `${theme.name} light missing accent`).toBeDefined();
        expect(theme.dark.accent, `${theme.name} dark missing accent`).toBeDefined();
      }
    });

    it("each variant has all required color properties", () => {
      const requiredProps = ["accent", "ink", "paper", "success", "danger", "slate"];
      for (const theme of themes) {
        for (const prop of requiredProps) {
          expect(theme.light[prop as keyof typeof theme.light], `${theme.name}.light.${prop}`).toBeDefined();
          expect(theme.dark[prop as keyof typeof theme.dark], `${theme.name}.dark.${prop}`).toBeDefined();
        }
      }
    });
  });

  describe("applyTheme", () => {
    it("does not throw when document is available", () => {
      expect(() => applyTheme("noor-classic", "light")).not.toThrow();
    });

    it("applies dark mode", () => {
      expect(() => applyTheme("noor-classic", "dark")).not.toThrow();
    });

    it("applies different themes", () => {
      for (const theme of themes) {
        expect(() => applyTheme(theme.name, "light")).not.toThrow();
      }
    });
  });
});
