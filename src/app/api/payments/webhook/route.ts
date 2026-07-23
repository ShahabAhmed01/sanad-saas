import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentGateway } from "@/lib/payments/gateway";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-signature") || undefined;

    // Determine gateway from payload or default to manual
    const gatewayName = body.gateway || "manual";
    const gateway = getPaymentGateway(gatewayName);

    // Handle webhook — this now REJECTS if signature is missing or invalid
    let event;
    try {
      event = await gateway.handleWebhook(body, signature);
    } catch (err) {
      // Signature verification failed or gateway not configured — reject
      return NextResponse.json(
        { error: "Webhook rejected — " + (err instanceof Error ? err.message : "verification failed") },
        { status: 401 }
      );
    }

    if (!event.referenceId) {
      return NextResponse.json({ error: "Missing reference ID" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Update subscription status
    if (event.status === "completed") {
      const { error } = await admin
        .from("subscriptions")
        .update({
          status: "active",
          gateway_reference: event.referenceId,
          verified_at: new Date().toISOString(),
        })
        .eq("id", event.referenceId);

      if (error) {
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
      }

      // Update school status
      const { data: subscription } = await admin
        .from("subscriptions")
        .select("school_id")
        .eq("id", event.referenceId)
        .single();

      if (subscription) {
        await admin
          .from("schools")
          .update({ status: "active" })
          .eq("id", subscription.school_id);

        // Audit log the payment activation
        await logAudit({
          userId: "system",
          schoolId: subscription.school_id,
          action: "fee_payment",
          tableName: "subscriptions",
          recordId: event.referenceId,
          newValue: { status: "active", amount: event.amount },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
