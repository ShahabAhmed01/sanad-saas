import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SETUP_TOKEN = process.env.SETUP_TOKEN;

export async function POST(request: Request) {
  const admin = createAdminClient();

  const { action, email, password, fullName, token } = await request.json();

  // Auth guard: require setup token for admin creation
  if (action === "create-admin") {
    if (!SETUP_TOKEN || token !== SETUP_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  switch (action) {
    case "create-admin": {
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
      // Check if tables exist by querying a known table
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
