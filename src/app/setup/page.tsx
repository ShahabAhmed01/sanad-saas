"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/provider";

export default function SetupPage() {
  const { t } = useI18n();
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
        setStatus(`${t("setup.tablesVerified")}! Found ${data.tables?.length || 0} tables.`);
        toast.success(t("setup.tablesVerified"), { description: `Found ${data.tables?.length || 0} tables.` });
        setStep(2);
      } else {
        setError(
          `${t("setup.tablesNotFound")}. ${t("setup.tablesNotFoundDesc")}`
        );
        toast.error(t("setup.tablesNotFound"), { description: t("setup.tablesNotFoundDesc") });
      }
    } catch {
      setError(`${t("setup.failedCheckTables")}. ${t("setup.failedCheckTablesDesc")}`);
      toast.error(t("setup.failedCheckTables"), { description: t("setup.failedCheckTablesDesc") });
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
        setStatus(`${t("setup.plansVerified")}! ${data.plans.length} plans found.`);
        toast.success(t("setup.plansVerified"), { description: `${data.plans.length} plans found.` });
        setStep(3);
      } else {
        setError(`${t("setup.plansNotFound")}. ${t("setup.plansNotFoundDesc")}`);
        toast.error(t("setup.plansNotFound"), { description: t("setup.plansNotFoundDesc") });
      }
    } catch {
      setError(t("setup.failedCheckPlans"));
      toast.error(t("setup.failedCheckPlans"));
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
        setStatus(`${t("setup.adminCreated")}! ${t("setup.adminCreatedDesc")}`);
        toast.success(t("setup.adminCreated"), { description: t("setup.adminCreatedDesc") });
        setStep(4);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(data.error || t("setup.failedCreateAdmin"));
        toast.error(t("setup.failedCreateAdmin"), { description: data.error || t("setup.failedCreateAdminDesc") });
      }
    } catch {
      setError(t("setup.failedCreateAdmin"));
      toast.error(t("setup.failedCreateAdmin"), { description: t("setup.failedCreateAdminGenericDesc") });
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
            {t("setup.title")}
          </span>
        </div>

        <div className="bg-paper-raised rounded-xl border border-slate-light p-8">
          <h1 className="font-display text-xl font-semibold text-ink mb-2">
            {t("setup.initialSetup")}
          </h1>
          <p className="text-sm text-slate mb-6">
            {t("setup.description")}
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
                  {t("setup.step1Title")}
                </h3>
                <p className="text-sm text-slate mb-3">
                  {t("setup.step1Desc")}
                </p>
                <a
                  href="https://supabase.com/dashboard/project/_/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-ink mb-3"
                >
                  {t("setup.openSqlEditor")} <ExternalLink className="h-3 w-3" />
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
                  {t("setup.step1Hint")}
                </p>
              </div>

              <Button
                onClick={checkTables}
                isLoading={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {t("setup.checkMigrations")}
              </Button>
            </div>
          )}

          {/* Step 2: Verify Plans */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate">
                {t("setup.verifyingPlans")}
              </p>
              <Button
                onClick={checkPlans}
                isLoading={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {t("setup.verifyPlans")}
              </Button>
            </div>
          )}

          {/* Step 3: Create Platform Admin */}
          {step === 3 && (
            <form onSubmit={createAdmin} className="space-y-4">
              <p className="text-sm text-slate">
                {t("setup.createAdminDesc")}
              </p>
              <div>
                <Label htmlFor="fullName" className="text-ink">
                  {t("setup.fullName")}
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder={t("setup.fullNamePlaceholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-ink">
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("setup.emailPlaceholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-ink">
                  {t("auth.password")}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("auth.passwordMinPlaceholder")}
                  className="mt-1.5"
                  required
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white"
              >
                {t("setup.createAdmin")}
              </Button>
            </form>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h2 className="font-display text-xl font-semibold text-ink">
                {t("setup.complete")}
              </h2>
              <p className="text-sm text-slate">
                {t("setup.completeDesc")}
              </p>
              <a href="/login">
                <Button className="bg-accent hover:bg-accent/90 text-white">
                  {t("setup.goToLogin")}
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
