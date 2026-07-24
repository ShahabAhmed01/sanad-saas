import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <ShieldOff className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-xl text-muted-foreground">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
