import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      app: "ok",
      database: "unknown" as string,
    },
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("plans").select("id").limit(1);
    health.services.database = error ? "error" : "ok";
  } catch {
    health.services.database = "error";
  }

  const isHealthy = health.services.database === "ok";

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
