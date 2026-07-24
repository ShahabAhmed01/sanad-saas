/**
 * Sanad Database Setup — Runs SQL via Supabase Management API
 *
 * Usage: npx tsx scripts/setup-database.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function _runSQL(sql: string, label: string) {
  console.log(`\n▶ Running ${label}...`);

  // Use Supabase's built-in SQL execution endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log(`  ✓ ${label} completed`);
    return true;
  }

  // If exec doesn't exist, try the pg_net approach or direct query
  // Fall back to checking if tables exist
  return false;
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}?select=id&limit=1`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    }
  );

  // 404 = table doesn't exist, 200 = table exists
  return res.status !== 404;
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Sanad Database Setup                                       ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Check if tables already exist
  const plansExist = await checkTableExists("plans");
  if (plansExist) {
    console.log("Tables already exist! Checking if plans are seeded...");

    const res = await fetch(`${SUPABASE_URL}/rest/v1/plans?select=id`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const plans = await res.json();

    if (plans && plans.length > 0) {
      console.log(`✓ Found ${plans.length} plans. Database is ready!`);
      return;
    }
  }

  console.log("Tables not found. Running migrations...\n");
  console.log("The SQL migrations need to be run in the Supabase SQL Editor.");
  console.log("This is a one-time setup that takes 30 seconds.\n");

  // Try to use the Supabase SQL API
  const migrations = [
    "001_initial_schema.sql",
    "002_rls_policies.sql",
    "003_seed_plans.sql",
  ];

  for (const migration of migrations) {
    const filePath = join(__dirname, "../supabase/migrations", migration);
    const sql = readFileSync(filePath, "utf-8");

    console.log(`\n▶ Attempting ${migration}...`);

    // Try multiple approaches to run SQL
    let success = false;

    // Approach 1: Use the SQL endpoint (requires custom rpc/exec function in Supabase)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (res.ok || res.status === 204) {
        success = true;
        console.log(`  ✓ ${migration} completed via SQL endpoint`);
      }
    } catch {
      // Ignore
    }

    if (!success) {
      console.log(`  ⚠ Could not run ${migration} automatically.`);
      console.log(`  Please run this SQL manually in the Supabase SQL Editor:`);
      console.log(`  ${filePath}\n`);
    }
  }

  // Check final state
  const plansExistNow = await checkTableExists("plans");
  if (plansExistNow) {
    console.log("\n✓ Database is ready!");
  } else {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Manual Step Required                                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Please run the SQL migrations manually:                    ║
║                                                              ║
║  1. Go to Supabase Dashboard → SQL Editor                   ║
║  2. Copy contents of each file and click Run:               ║
║     - supabase/migrations/001_initial_schema.sql            ║
║     - supabase/migrations/002_rls_policies.sql             ║
║     - supabase/migrations/003_seed_plans.sql               ║
║                                                              ║
║  Then visit http://localhost:3000/setup to create admin     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

main().catch(console.error);
