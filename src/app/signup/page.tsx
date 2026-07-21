"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchool, type SignupInput } from "@/lib/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(false);
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
        <div className="bg-paper-raised rounded-xl border border-slate-light p-8">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">
            Start your free trial
          </h1>
          <p className="text-sm text-slate mb-6">
            21 days free. No credit card required.
          </p>

          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="school-name" className="text-ink">
                School name
              </Label>
              <Input
                id="school-name"
                name="school-name"
                placeholder="Al-Noor Academy"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="admin-name" className="text-ink">
                Your full name
              </Label>
              <Input
                id="admin-name"
                name="admin-name"
                placeholder="Muhammad Ahmed"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-ink">
                Work email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@school.edu.pk"
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
            <div>
              <Label htmlFor="board-type" className="text-ink">
                Board / Curriculum
              </Label>
              <select
                id="board-type"
                name="board-type"
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                required
              >
                <option value="">Select your board</option>
                <option value="matric_fsc">Matric / FSc</option>
                <option value="cambridge_o_a_level">
                  Cambridge O / A Level
                </option>
                <option value="montessori">Montessori</option>
                <option value="mixed">Mixed / Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="city" className="text-ink">
                City
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="Lahore"
                className="mt-1.5"
                required
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-slate-light"
                required
              />
              <label htmlFor="terms" className="text-xs text-slate">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-accent hover:text-accent-ink"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-accent hover:text-accent-ink"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create my school account"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-ink font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
