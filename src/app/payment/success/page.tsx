"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("ref");

  return (
    <div className="text-center max-w-md">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink mb-2">
        Payment Successful
      </h1>
      <p className="text-slate mb-6">
        Your payment has been processed successfully. Your subscription is
        now active.
      </p>
      {referenceId && (
        <p className="text-sm text-slate mb-6">
          Reference: <span className="font-mono">{referenceId}</span>
        </p>
      )}
      <Link href="/dashboard">
        <Button className="bg-accent hover:bg-accent/90 text-white">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="h-8 w-32 bg-slate-light rounded animate-skeleton mx-auto" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
