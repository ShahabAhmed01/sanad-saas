"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-8 w-8 text-danger" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Payment Cancelled
        </h1>
        <p className="text-slate mb-6">
          Your payment was cancelled. You can try again whenever you&apos;re
          ready.
        </p>
        <Link href="/settings">
          <Button variant="outline">Back to Settings</Button>
        </Link>
      </div>
    </div>
  );
}
