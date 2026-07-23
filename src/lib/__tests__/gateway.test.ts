import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ManualPaymentGateway,
  RapidGateway,
  getPaymentGateway,
} from "../payments/gateway";

describe("getPaymentGateway", () => {
  it("returns ManualPaymentGateway by default", () => {
    expect(getPaymentGateway()).toBeInstanceOf(ManualPaymentGateway);
  });

  it("returns ManualPaymentGateway for 'manual'", () => {
    expect(getPaymentGateway("manual")).toBeInstanceOf(ManualPaymentGateway);
  });

  it("returns RapidGateway for 'rapid'", () => {
    expect(getPaymentGateway("rapid")).toBeInstanceOf(RapidGateway);
  });
});

describe("ManualPaymentGateway", () => {
  const gw = new ManualPaymentGateway();

  it("creates a pending session", async () => {
    const session = await gw.createSession({
      amount: 5000,
      currency: "PKR",
      description: "Fee payment",
      referenceId: "ref-1",
    });

    expect(session.status).toBe("pending");
    expect(session.amount).toBe(5000);
    expect(session.currency).toBe("PKR");
    expect(session.referenceId).toBe("ref-1");
    expect(session.id).toMatch(/^manual_/);
  });

  it("verifyPayment returns pending_manual_review", async () => {
    const result = await gw.verifyPayment("ref-1");
    expect(result.verified).toBe(false);
    expect(result.status).toBe("pending_manual_review");
  });

  it("handleWebhook returns manual event", async () => {
    const result = await gw.handleWebhook();
    expect(result.event).toBe("manual");
    expect(result.status).toBe("pending");
  });
});

describe("RapidGateway", () => {
  const mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAPID_GATEWAY_API_KEY = "test-key";
    process.env.RAPID_GATEWAY_URL = "https://api.test.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.test.com";
  });

  it("createSession posts to gateway API and returns session", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "gw-123", checkout_url: "https://checkout.test" }),
    });

    const gw = new RapidGateway();
    const session = await gw.createSession({
      amount: 1000,
      currency: "PKR",
      description: "Test",
      referenceId: "ref-2",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test.com/payments/create",
      expect.objectContaining({ method: "POST" })
    );
    expect(session.status).toBe("pending");
    expect(session.checkoutUrl).toBe("https://checkout.test");
  });

  it("createSession returns pending session on error", async () => {
    mockFetch.mockRejectedValue(new Error("Network fail"));

    const gw = new RapidGateway();
    const session = await gw.createSession({
      amount: 500,
      currency: "PKR",
      description: "Fail test",
      referenceId: "ref-3",
    });

    expect(session.status).toBe("pending");
    expect(session.id).toMatch(/^rapid_/);
  });

  it("handleWebhook rejects if no API key", async () => {
    process.env.RAPID_GATEWAY_API_KEY = "";
    const gw = new RapidGateway();

    await expect(
      gw.handleWebhook({ status: "completed" }, "sig")
    ).rejects.toThrow("API key missing");
  });

  it("handleWebhook rejects if no signature", async () => {
    const gw = new RapidGateway();
    await expect(
      gw.handleWebhook({ status: "completed" })
    ).rejects.toThrow("Missing webhook signature");
  });
});
