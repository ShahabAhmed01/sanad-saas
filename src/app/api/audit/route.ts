import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, entity_type, entity_id, metadata } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    // Get the user's school_id
    const { data: staff } = await supabase
      .from("staff")
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Staff profile not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      actor_user_id: user.id,
      school_id: staff.school_id,
      action,
      entity_type: entity_type || null,
      entity_id: entity_id || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to log audit" }, { status: 500 });
    }

    return NextResponse.json({ logged: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
