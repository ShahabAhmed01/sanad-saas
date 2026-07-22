"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const registered = searchParams.get("registered") === "true";

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
      toast.error("Sign in failed", { description: authError.message });
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
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
        <div className="bg-paper-raised rounded-xl border border-slate-light p-8 shadow-sm">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-slate mb-6">
            Sign in to your school&apos;s dashboard
          </p>

          {registered && (
            <div className="bg-success/10 text-success text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Account created! Please sign in with your credentials.
            </div>
          )}

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
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-ink">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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
            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center gap-2 text-sm text-slate cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="rounded border-slate-light h-4 w-4 accent-accent"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-accent hover:text-accent-ink font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white h-11"
              isLoading={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                "Sign in"
              )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="flex items-center gap-2 text-slate">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
