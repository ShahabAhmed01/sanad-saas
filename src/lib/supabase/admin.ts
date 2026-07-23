import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses RLS — use ONLY for operations that
// require it (creating auth users, platform admin cross-tenant queries)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
