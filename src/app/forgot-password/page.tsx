"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-ink mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="bg-paper-raised rounded-xl border border-slate-light p-8">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">
            Reset your password
          </h1>
          <p className="text-sm text-slate mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {sent ? (
            <div className="bg-success/10 text-success text-sm p-3 rounded-lg mb-4">
              Check your email for a password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-ink">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu.pk"
                  className="mt-1.5"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white"
                isLoading={loading}
              >
                Send reset link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
