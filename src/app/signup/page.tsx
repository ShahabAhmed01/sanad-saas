"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { signupSchool, type SignupInput } from "@/lib/actions/auth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const input: SignupInput = {
      schoolName: formData.get("school-name") as string,
      adminName: formData.get("admin-name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      boardType: formData.get("board-type") as SignupInput["boardType"],
      city: formData.get("city") as string,
    };

    const result = await signupSchool(input);

    if (result.error) {
      setError(result.error);
      toast.error(t("auth.signupFailed"), { description: result.error });
      setLoading(false);
      return;
    }

    toast.success(t("auth.accountCreatedToast"), {
      description: t("auth.signupSuccessDesc"),
    });

    if ("needsLogin" in result && result.needsLogin) {
      router.push("/login?registered=true");
      router.refresh();
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white font-display font-bold text-lg">
            S
          </div>
          <span className="font-display text-2xl font-semibold text-ink">
            Sanad
          </span>
        </div>

        {/* Card */}
        <div className="bg-paper-raised rounded-xl border border-slate-light p-8 shadow-sm">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">
            {t("auth.startFreeTrial")}
          </h1>
          <p className="text-sm text-slate mb-6">
            {t("auth.signupDesc")}
          </p>

          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="school-name" className="text-ink">
                {t("auth.schoolName")}
              </Label>
              <Input
                id="school-name"
                name="school-name"
                placeholder={t("auth.schoolNamePlaceholder")}
                className="mt-1.5"
                required
                autoComplete="organization"
              />
            </div>
            <div>
              <Label htmlFor="admin-name" className="text-ink">
                {t("auth.adminName")}
              </Label>
              <Input
                id="admin-name"
                name="admin-name"
                placeholder={t("auth.adminNamePlaceholder")}
                className="mt-1.5"
                required
                autoComplete="name"
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
                placeholder={t("auth.emailPlaceholder")}
                className="mt-1.5"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-ink">
                {t("auth.password")}
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordMinPlaceholder")}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="board-type" className="text-ink">
                {t("auth.boardType")}
              </Label>
              <Select
                id="board-type"
                name="board-type"
                className="mt-1.5"
                placeholder={t("auth.selectBoard")}
                required
                options={[
                  { value: "matric_fsc", label: t("signup.boards.matric") },
                  { value: "cambridge_o_a_level", label: t("signup.boards.cambridge") },
                  { value: "montessori", label: t("signup.boards.montessori") },
                  { value: "mixed", label: t("signup.boards.mixed") },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-ink">
                {t("auth.city")}
              </Label>
              <Input
                id="city"
                name="city"
                placeholder={t("auth.cityPlaceholder")}
                className="mt-1.5"
                required
                autoComplete="address-level2"
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-slate-light h-4 w-4 accent-accent"
                required
              />
              <label htmlFor="terms" className="text-xs text-slate leading-relaxed">
                {t("auth.agreeToTerms")}{" "}
                <Link
                  href="/terms"
                  className="text-accent hover:text-accent-ink"
                >
                  {t("auth.termsOfService")}
                </Link>{" "}
                {t("auth.and")}{" "}
                <Link
                  href="/privacy"
                  className="text-accent hover:text-accent-ink"
                >
                  {t("auth.privacyPolicy")}
                </Link>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white h-11"
              isLoading={loading}
            >
              {loading ? (
                t("auth.creatingAccount")
              ) : (
                t("auth.createSchoolAccount")
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate mt-6">
          {t("auth.alreadyHaveAnAccount")}{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-ink font-medium"
          >
            {t("auth.signinLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
