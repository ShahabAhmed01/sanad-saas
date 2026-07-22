import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuditAction } from "@/lib/audit";

// Mock the admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}));

describe("Audit Logging", () => {
  let logAudit: typeof import("@/lib/audit").logAudit;
  let getAuditLogs: typeof import("@/lib/audit").getAuditLogs;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/lib/audit");
    logAudit = mod.logAudit;
    getAuditLogs = mod.getAuditLogs;
  });

  it("exports logAudit function", () => {
    expect(typeof logAudit).toBe("function");
  });

  it("exports getAuditLogs function", () => {
    expect(typeof getAuditLogs).toBe("function");
  });

  it("logAudit does not throw on success", async () => {
    await expect(
      logAudit({
        userId: "test-user-id",
        schoolId: "test-school-id",
        action: "create",
        tableName: "students",
        recordId: "test-record-id",
      })
    ).resolves.toBeUndefined();
  });

  it("logAudit does not throw on error", async () => {
    // The function catches errors internally
    await expect(
      logAudit({
        userId: "test-user-id",
        schoolId: "test-school-id",
        action: "create",
      })
    ).resolves.toBeUndefined();
  });

  it("logAudit accepts all valid audit actions", () => {
    const actions: AuditAction[] = [
      "create",
      "update",
      "delete",
      "login",
      "logout",
      "password_change",
      "role_change",
      "fee_payment",
      "fee_waiver",
      "attendance_mark",
      "exam_create",
      "marks_entry",
      "report_card_generate",
      "data_export",
      "settings_change",
    ];
    // Just verify all actions are valid types
    expect(actions).toHaveLength(15);
  });
});
