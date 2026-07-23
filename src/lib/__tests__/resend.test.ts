import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => {
  process.env.RESEND_API_KEY = "test-key";
  return { mockSend: vi.fn() };
});

vi.mock("resend", () => {
  return {
    Resend: class {
      emails = { send: mockSend };
      constructor(_apiKey: string) { void _apiKey; }
    },
  };
});

import { sendEmail, welcomeEmail, staffInvitationEmail, feeReminderEmail } from "../email/resend";

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
  });

  it("calls resend.emails.send with correct params", async () => {
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Welcome",
      html: "<p>Hello</p>",
    });

    expect(mockSend).toHaveBeenCalledWith({
      from: "Sanad <noreply@sanad.pk>",
      to: ["test@example.com"],
      subject: "Welcome",
      html: "<p>Hello</p>",
    });
    expect(result.success).toBe(true);
  });

  it("returns error when resend returns an error", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "Invalid email" } });

    const result = await sendEmail({ to: "bad", subject: "T", html: "x" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email");
  });

  it("returns error on thrown exception", async () => {
    mockSend.mockRejectedValue(new Error("Timeout"));

    const result = await sendEmail({ to: "a@b.com", subject: "T", html: "x" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Timeout");
  });
});

describe("email templates", () => {
  it("welcomeEmail contains school and admin name", () => {
    const html = welcomeEmail("Green School", "Ali");
    expect(html).toContain("Green School");
    expect(html).toContain("Ali");
    expect(html).toContain("21-day free trial");
  });

  it("staffInvitationEmail contains credentials", () => {
    const html = staffInvitationEmail("Green School", "Ahmed", "Teacher", "temp123");
    expect(html).toContain("Green School");
    expect(html).toContain("Ahmed");
    expect(html).toContain("Teacher");
    expect(html).toContain("temp123");
  });

  it("feeReminderEmail contains amount and due date", () => {
    const html = feeReminderEmail("Green School", "Student A", 15000, "2026-08-01");
    expect(html).toContain("15,000");
    expect(html).toContain("Student A");
    expect(html).toContain("2026-08-01");
  });
});
