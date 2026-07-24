"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SessionExpiryModal() {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

      if (remaining <= 300 && remaining > 0) {
        setOpen(true);
        setTimeLeft(remaining);
      } else if (remaining <= 0) {
        await supabase.auth.signOut();
        router.push("/login");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [supabase, router]);

  async function handleRefresh() {
    await supabase.auth.refreshSession();
    setOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your session will expire in {minutes}:{String(seconds).padStart(2, "0")}.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleLogout}>Log out</Button>
            <Button onClick={handleRefresh}>Stay logged in</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
