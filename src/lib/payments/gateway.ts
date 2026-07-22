/**
 * Payment Gateway Abstraction Layer
 *
 * Supports multiple payment gateways with a unified interface.
 * Currently implements:
 * - Manual (bank transfer/JazzCash/Easypaisa with proof upload)
 * - Rapid Gateway (automated checkout via rapidgateway.pk)
 */

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  status: "pending" | "processing" | "completed" | "failed";
  gatewayReference?: string;
  checkoutUrl?: string;
  createdAt: string;
}

export interface PaymentVerification {
  verified: boolean;
  referenceId: string;
  amount: number;
  status: string;
  gatewayReference?: string;
  verifiedAt?: string;
}

export interface PaymentGateway {
  name: string;
  createSession(params: {
    amount: number;
    currency: string;
    description: string;
    referenceId: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentSession>;

  verifyPayment(referenceId: string): Promise<PaymentVerification>;

  handleWebhook(payload: unknown, signature?: string): Promise<{
    event: string;
    referenceId: string;
    status: string;
    amount?: number;
  }>;
}

// Manual Payment Gateway (bank transfer/JazzCash/Easypaisa)
export class ManualPaymentGateway implements PaymentGateway {
  name = "manual";

  async createSession(params: {
    amount: number;
    currency: string;
    description: string;
    referenceId: string;
  }): Promise<PaymentSession> {
    return {
      id: `manual_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      referenceId: params.referenceId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  async verifyPayment(referenceId: string): Promise<PaymentVerification> {
    return {
      verified: false,
      referenceId,
      amount: 0,
      status: "pending_manual_review",
    };
  }

  async handleWebhook() {
    return { event: "manual", referenceId: "", status: "pending" };
  }
}

// Rapid Gateway (https://rapidgateway.pk)
export class RapidGateway implements PaymentGateway {
  name = "rapid";
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAPID_GATEWAY_API_KEY || "";
    this.baseUrl = process.env.RAPID_GATEWAY_URL || "https://api.rapidgateway.pk";
  }

  async createSession(params: {
    amount: number;
    currency: string;
    description: string;
    referenceId: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentSession> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: params.amount * 100, // Convert to paisa
          currency: params.currency,
          methods: ["card", "raast", "wallet", "bank_transfer"],
          customer: {
            email: params.email,
            phone: params.phone,
          },
          metadata: {
            reference_id: params.referenceId,
            description: params.description,
            ...params.metadata,
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?ref=${params.referenceId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment session creation failed");
      }

      return {
        id: data.id || data.session_id || `rapid_${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        referenceId: params.referenceId,
        status: "pending",
        checkoutUrl: data.checkout_url,
        gatewayReference: data.gateway_reference || data.id,
        createdAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error("Rapid Gateway error:", error);
      // Return a pending session so the user can retry
      return {
        id: `rapid_${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        referenceId: params.referenceId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    }
  }

  async verifyPayment(referenceId: string): Promise<PaymentVerification> {
    try {
      const response = await fetch(
        `${this.baseUrl}/payments/verify/${referenceId}`,
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        }
      );

      const data = await response.json();

      return {
        verified: data.status === "completed" || data.status === "successful",
        referenceId,
        amount: data.amount ? data.amount / 100 : 0,
        status: data.status,
        gatewayReference: data.gateway_reference || data.id,
      };
    } catch (error) {
      return {
        verified: false,
        referenceId,
        amount: 0,
        status: "verification_failed",
      };
    }
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    signature?: string
  ): Promise<{
    event: string;
    referenceId: string;
    status: string;
    amount?: number;
  }> {
    // Verify HMAC signature if provided
    if (signature && this.apiKey) {
      const crypto = await import("crypto");
      const body = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac("sha256", this.apiKey)
        .update(body)
        .digest("hex");

      if (!crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex")
      )) {
        throw new Error("Invalid webhook signature");
      }
    }

    return {
      event: (payload.event as string) || (payload.status as string) || "payment.completed",
      referenceId: (payload.metadata as Record<string, string>)?.reference_id || (payload.reference_id as string) || "",
      status: (payload.status as string) || "completed",
      amount: typeof payload.amount === "number" ? payload.amount / 100 : undefined,
    };
  }
}

// Factory function to get the appropriate gateway
export function getPaymentGateway(gateway: string = "manual"): PaymentGateway {
  switch (gateway) {
    case "rapid":
      return new RapidGateway();
    case "manual":
    default:
      return new ManualPaymentGateway();
  }
}
