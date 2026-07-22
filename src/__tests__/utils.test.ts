import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    const result = cn("text-sm", "font-bold");
    expect(result).toBe("text-sm font-bold");
  });

  it("removes duplicate classes", () => {
    const result = cn("text-sm text-red-500", "text-blue-500");
    expect(result).toBe("text-sm text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", true && "active", false && "hidden");
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("hidden");
  });

  it("handles undefined and null", () => {
    const result = cn("base", undefined, null, "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
  });

  it("returns empty string for no args", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
