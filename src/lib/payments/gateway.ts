/**
 * Payment Gateway Abstraction Layer
 *
 * Supports multiple payment gateways with a unified interface.
 * Currently implements:
 * - Manual (bank transfer/JazzCash/Easypaisa with proof upload)
 * - Rapid Gateway (automated checkout)
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
    // Manual verification is done by Platform Admin
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

// Rapid Gateway (placeholder for actual integration)
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
    // TODO: Implement actual Rapid Gateway API call
    // Example implementation:
    //
    // const response = await fetch(`${this.baseUrl}/checkout/session`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${this.apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     amount: params.amount * 100, // Convert to paisa
    //     currency: params.currency,
    //     description: params.description,
    //     reference_id: params.referenceId,
    //     email: params.email,
    //     phone: params.phone,
    //     metadata: params.metadata,
    //     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    //     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    //   }),
    // });
    //
    // const data = await response.json();
    //
    // return {
    //   id: data.session_id,
    //   amount: params.amount,
    //   currency: params.currency,
    //   description: params.description,
    //   referenceId: params.referenceId,
    //   status: "pending",
    //   checkoutUrl: data.checkout_url,
    //   gatewayReference: data.gateway_reference,
    //   createdAt: new Date().toISOString(),
    // };

    // Placeholder response
    return {
      id: `rapid_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      referenceId: params.referenceId,
      status: "pending",
      checkoutUrl: `${this.baseUrl}/checkout/${params.referenceId}`,
      createdAt: new Date().toISOString(),
    };
  }

  async verifyPayment(referenceId: string): Promise<PaymentVerification> {
    // TODO: Implement actual verification
    // const response = await fetch(`${this.baseUrl}/payment/${referenceId}/verify`, {
    //   headers: { "Authorization": `Bearer ${this.apiKey}` },
    // });
    // const data = await response.json();
    // return {
    //   verified: data.status === "completed",
    //   referenceId,
    //   amount: data.amount / 100,
    //   status: data.status,
    //   gatewayReference: data.gateway_reference,
    // };

    return {
      verified: false,
      referenceId,
      amount: 0,
      status: "pending",
    };
  }

  async handleWebhook(
    payload: any,
    signature?: string
  ): Promise<{
    event: string;
    referenceId: string;
    status: string;
    amount?: number;
  }> {
    // TODO: Implement webhook signature verification
    // const expectedSignature = crypto
    //   .createHmac("sha256", this.apiKey)
    //   .update(JSON.stringify(payload))
    //   .digest("hex");
    //
    // if (signature !== expectedSignature) {
    //   throw new Error("Invalid webhook signature");
    // }

    return {
      event: payload.event || "payment.completed",
      referenceId: payload.reference_id || "",
      status: payload.status || "completed",
      amount: payload.amount ? payload.amount / 100 : undefined,
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
