"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardCheck,
  Banknote,
  FileText,
  Bell,
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageTransition } from "@/components/page-transition";
import { toast } from "sonner";

const parentNav = [
  { label: "Dashboard", href: "/parent", icon: LayoutDashboard, shortLabel: "Home" },
  { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck, shortLabel: "Attend" },
  { label: "Marks", href: "/parent/marks", icon: ClipboardCheck, shortLabel: "Marks" },
  { label: "Fees", href: "/parent/fees", icon: Banknote, shortLabel: "Fees" },
  { label: "Homework", href: "/parent/homework", icon: FileText, shortLabel: "HW" },
  { label: "Announcements", href: "/parent/announcements", icon: Bell, shortLabel: "News" },
];

interface Child {
  id: string;
  full_name: string;
}

function ParentLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [childSelectorOpen, setChildSelectorOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const { data: children_ = [], isLoading, error } = useQuery<Child[]>({
    queryKey: ["parent", "children"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: guardian } = await supabase
        .from("guardians")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!guardian) throw new Error("No guardian profile found");

      const { data: links } = await supabase
        .from("student_guardians")
        .select("student_id, students(id, full_name)")
        .eq("guardian_id", guardian.id);

      if (!links || links.length === 0) {
        throw new Error("No children are linked to your account. Please contact your school administrator.");
      }

      return links.map((l) => l.students as unknown as Child);
    },
  });

  // Compute initial child from URL params or default to first child
  const childIdFromUrl = searchParams.get("child");
  const initialChild = children_.length > 0
    ? (childIdFromUrl ? children_.find((c) => c.id === childIdFromUrl) || children_[0] : children_[0])
    : null;

  // Sync selected child when data loads (avoids useEffect setState lint error)
  if (initialChild && !selectedChild) {
    setSelectedChild(initialChild);
  }

  function handleLogout() {
    const supabase = createClient();
    supabase.auth.signOut();
    toast.success("Logged out successfully");
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white font-display font-bold text-sm">
              S
            </div>
            <span className="font-display text-base font-semibold text-foreground">
              Parent Portal
            </span>
          </div>

          {/* Child Selector */}
          <div className="relative">
            <button
              onClick={() => setChildSelectorOpen(!childSelectorOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Select child"
              aria-expanded={childSelectorOpen}
            >
              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">
                  {selectedChild ? selectedChild.full_name[0] : "?"}
                </span>
              </div>
              <span className="hidden sm:inline">
                {selectedChild ? selectedChild.full_name : "Select child"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {childSelectorOpen && children_.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-1">
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  Select Child
                </p>
                {children_.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setSelectedChild(child);
                      setChildSelectorOpen(false);
                      window.history.replaceState(null, "", `?child=${child.id}`);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left",
                      selectedChild?.id === child.id && "bg-accent/10"
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">
                        {child.full_name[0]}
                      </span>
                    </div>
                    {child.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Desktop Navigation tabs */}
      <div className="hidden sm:block border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {parentNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/parent" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm">Loading your children...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <span className="text-destructive text-lg font-bold">!</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
          </div>
        ) : (
          <PageTransition>{children}</PageTransition>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {parentNav.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/parent" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px]",
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center text-slate">Loading...</div>
      </div>
    }>
      <ParentLayoutInner>{children}</ParentLayoutInner>
    </Suspense>
  );
}
