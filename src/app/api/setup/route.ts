import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SETUP_TOKEN = process.env.SETUP_TOKEN;

// Constant-time string comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: Request) {
  const admin = createAdminClient();

  const { action, email, password, fullName, token } = await request.json();

  // Require setup token for ALL actions — no unauthenticated probing allowed
  if (!SETUP_TOKEN || !token || !safeCompare(token, SETUP_TOKEN)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  switch (action) {
    case "create-admin": {
      // Check if platform admin already exists — disable after first use
      const { data: existingAdmins } = await admin
        .from("platform_admins")
        .select("id")
        .limit(1);

      if (existingAdmins && existingAdmins.length > 0) {
        return NextResponse.json(
          { error: "Platform admin already exists. This endpoint is disabled." },
          { status: 403 }
        );
      }

      // Create platform admin auth user
      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      // Insert into platform_admins
      const { error: insertError } = await admin.from("platform_admins").insert({
        id: authData.user.id,
        full_name: fullName,
      });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        userId: authData.user.id,
        message: "Platform admin created. You can now log in.",
      });
    }

    case "check-tables": {
      const { error } = await admin
        .from("schools")
        .select("id")
        .limit(1);

      if (error) {
        return NextResponse.json({
          tablesExist: false,
          error: error.message,
        });
      }

      return NextResponse.json({
        tablesExist: true,
        tables: ["schools"],
      });
    }

    case "check-plans": {
      const { data, error } = await admin.from("plans").select("*");

      if (error) {
        return NextResponse.json({ plansExist: false, error: error.message });
      }

      return NextResponse.json({
        plansExist: true,
        plans: data,
      });
    }

    default:
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
  }
}
