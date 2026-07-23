import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAuditEvent } from "../audit-client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("logAuditEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it("posts to /api/audit with correct payload", async () => {
    await logAuditEvent("create", {
      entityType: "student",
      entityId: "123",
      metadata: { name: "Test" },
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        entity_type: "student",
        entity_id: "123",
        metadata: { name: "Test" },
      }),
    });
  });

  it("sends minimal payload when no options provided", async () => {
    await logAuditEvent("login");

    expect(mockFetch).toHaveBeenCalledWith("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        entity_type: undefined,
        entity_id: undefined,
        metadata: undefined,
      }),
    });
  });

  it("does not throw when fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    await expect(logAuditEvent("logout")).resolves.toBeUndefined();
  });

  it("does not throw when response is not ok", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(logAuditEvent("fee_payment")).resolves.toBeUndefined();
  });

  it("returns void on success", async () => {
    const result = await logAuditEvent("data_export");
    expect(result).toBeUndefined();
  });
});
