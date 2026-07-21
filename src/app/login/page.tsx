"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
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
            Welcome back
          </h1>
          <p className="text-sm text-slate mb-6">
            Sign in to your school&apos;s dashboard
          </p>

          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-ink">
                Email
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
                placeholder="Enter your password"
                className="mt-1.5"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate">
                <input type="checkbox" className="rounded border-slate-light" />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-accent hover:text-accent-ink"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-accent hover:text-accent-ink font-medium"
          >
            Start your free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
