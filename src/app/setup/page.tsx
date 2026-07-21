"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function checkTables() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-tables" }),
      });
      const data = await res.json();
      if (data.tablesExist) {
        setStatus(`Tables verified! Found ${data.tables?.length || 0} tables.`);
        setStep(2);
      } else {
        setError(
          "Tables not found. Please run the SQL migrations first."
        );
      }
    } catch (e) {
      setError("Failed to check tables. Is the app running?");
    }
    setLoading(false);
  }

  async function checkPlans() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-plans" }),
      });
      const data = await res.json();
      if (data.plansExist && data.plans?.length > 0) {
        setStatus(`Plans verified! ${data.plans.length} plans found.`);
        setStep(3);
      } else {
        setError("Plans not found. Please run 003_seed_plans.sql");
      }
    } catch (e) {
      setError("Failed to check plans");
    }
    setLoading(false);
  }

  async function createAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-admin",
          email: formData.get("email"),
          password: formData.get("password"),
          fullName: formData.get("fullName"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Platform admin created! Redirecting to login...");
        setStep(4);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(data.error || "Failed to create admin");
      }
    } catch (e) {
      setError("Failed to create admin");
    }
    setLoading(false);
  }

  const sqlFiles = [
    {
      name: "001_initial_schema.sql",
      desc: "Creates all 37 database tables with indexes",
    },
    {
      name: "002_rls_policies.sql",
      desc: "Sets up Row-Level Security for tenant isolation",
    },
    {
      name: "003_seed_plans.sql",
      desc: "Inserts the 5 subscription plans",
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white font-display font-bold text-lg">
            S
          </div>
          <span className="font-display text-2xl font-semibold text-ink">
            Sanad Setup
          </span>
        </div>

        <div className="bg-paper-raised rounded-xl border border-slate-light p-8">
          <h1 className="font-display text-xl font-semibold text-ink mb-2">
            Initial Setup
          </h1>
          <p className="text-sm text-slate mb-6">
            Follow these steps to get Sanad running.
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-accent" : "bg-slate-light"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {status && (
            <div className="bg-success/10 text-success text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {status}
            </div>
          )}

          {/* Step 1: SQL Migrations */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-paper rounded-lg p-4 border border-slate-light">
                <h3 className="font-medium text-ink mb-2">
                  Step 1: Run SQL Migrations
                </h3>
                <p className="text-sm text-slate mb-3">
                  Open your Supabase SQL Editor and run these 3 files:
                </p>
                <a
                  href="https://supabase.com/dashboard/project/frxfrehusnvpggxrtwom/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-ink mb-3"
                >
                  Open SQL Editor <ExternalLink className="h-3 w-3" />
                </a>

                <div className="space-y-2">
                  {sqlFiles.map((file, i) => (
                    <div
                      key={file.name}
                      className="flex items-start gap-3 p-2 rounded bg-paper-raised"
                    >
                      <span className="text-xs font-bold text-accent mt-0.5">
                        {i + 1}.
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink font-mono">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate">{file.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate mt-3">
                  For each file: click into the editor, paste the SQL, click
                  &quot;Run&quot;.
                </p>
              </div>

              <Button
                onClick={checkTables}
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {loading ? "Checking..." : "I've run the migrations — check"}
              </Button>
            </div>
          )}

          {/* Step 2: Verify Plans */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate">
                Verifying that subscription plans were seeded correctly...
              </p>
              <Button
                onClick={checkPlans}
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {loading ? "Verifying..." : "Verify plans exist"}
              </Button>
            </div>
          )}

          {/* Step 3: Create Platform Admin */}
          {step === 3 && (
            <form onSubmit={createAdmin} className="space-y-4">
              <p className="text-sm text-slate">
                Create your Platform Super Admin account:
              </p>
              <div>
                <Label htmlFor="fullName" className="text-ink">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Shahab Ahmed"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-ink">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@sanad.pk"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-ink">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  className="mt-1.5"
                  required
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {loading ? "Creating..." : "Create platform admin"}
              </Button>
            </form>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h2 className="font-display text-xl font-semibold text-ink">
                Setup Complete!
              </h2>
              <p className="text-sm text-slate">
                You can now log in and start managing your school.
              </p>
              <a href="/login">
                <Button className="bg-accent hover:bg-accent/90 text-white">
                  Go to Login
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
