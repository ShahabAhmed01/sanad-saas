import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentGateway } from "@/lib/payments/gateway";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-signature") || undefined;

    // Determine gateway from payload or default to manual
    const gatewayName = body.gateway || "manual";
    const gateway = getPaymentGateway(gatewayName);

    // Handle webhook
    const event = await gateway.handleWebhook(body, signature);

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
        console.error("Failed to update subscription:", error);
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
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
