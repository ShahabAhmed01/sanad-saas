"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  GraduationCap,
  CalendarCheck,
  Banknote,
  ClipboardList,
  BookOpen,
  Bus,
  Settings,
  FileText,
  Bell,
  LayoutDashboard,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href: string;
  category: string;
}

const commands: CommandItem[] = [
  // Navigation
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", category: "Navigate" },
  { id: "staff", label: "Staff Management", icon: Users, href: "/staff", category: "Navigate" },
  { id: "students", label: "Student Management", icon: GraduationCap, href: "/students", category: "Navigate" },
  { id: "attendance", label: "Attendance", icon: CalendarCheck, href: "/attendance", category: "Navigate" },
  { id: "fees", label: "Fee Management", icon: Banknote, href: "/fees", category: "Navigate" },
  { id: "exams", label: "Exams", icon: ClipboardList, href: "/exams", category: "Navigate" },
  { id: "library", label: "Library", icon: BookOpen, href: "/library", category: "Navigate" },
  { id: "transport", label: "Transport", icon: Bus, href: "/transport", category: "Navigate" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/notifications", category: "Navigate" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings", category: "Navigate" },
  { id: "audit", label: "Audit Log", icon: FileText, href: "/audit", category: "Navigate" },

  // Quick Actions
  { id: "mark-attendance", label: "Mark Attendance", description: "Take today's attendance", icon: CalendarCheck, href: "/attendance/mark", category: "Quick Actions" },
  { id: "add-student", label: "Add Student", description: "Enroll a new student", icon: GraduationCap, href: "/students", category: "Quick Actions" },
  { id: "invite-staff", label: "Invite Staff Member", description: "Send an invitation email", icon: Users, href: "/staff/invite", category: "Quick Actions" },
  { id: "create-exam", label: "Create Exam", description: "Schedule a new exam", icon: ClipboardList, href: "/exams/create", category: "Quick Actions" },
  { id: "generate-invoice", label: "Generate Fee Invoice", description: "Bulk generate invoices", icon: Banknote, href: "/fees/generate", category: "Quick Actions" },
  { id: "collect-payment", label: "Collect Payment", description: "Record a fee payment", icon: Banknote, href: "/fees/collect", category: "Quick Actions" },
  { id: "create-homework", label: "Create Homework", icon: FileText, href: "/homework/create", category: "Quick Actions" },
  { id: "create-announcement", label: "Create Announcement", icon: Bell, href: "/announcements/create", category: "Quick Actions" },
  { id: "issue-book", label: "Issue / Return Book", icon: BookOpen, href: "/library/issue", category: "Quick Actions" },
  { id: "assign-transport", label: "Assign Transport Route", icon: Bus, href: "/transport/assign", category: "Quick Actions" },
  { id: "gradebook", label: "Enter Marks", icon: ClipboardCheck, href: "/gradebook/entry", category: "Quick Actions" },
  { id: "report-cards", label: "View Report Cards", icon: FileText, href: "/exams/report-cards", category: "Quick Actions" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  const flatFiltered = Object.values(grouped).flat();

  const runCommand = useCallback(
    (cmd: CommandItem) => {
      setOpen(false);
      setQuery("");
      router.push(cmd.href);
    },
    [router]
  );

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setSelectedIndex(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    function handleNav(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatFiltered[selectedIndex]) {
        e.preventDefault();
        runCommand(flatFiltered[selectedIndex]);
      }
    }
    document.addEventListener("keydown", handleNav);
    return () => document.removeEventListener("keydown", handleNav);
  }, [open, flatFiltered, selectedIndex, runCommand]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  let globalIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
        onClick={() => {
          setOpen(false);
          setQuery("");
        }}
      />

      {/* Palette */}
      <div className="fixed inset-x-0 top-[15vh] z-50 mx-auto w-full max-w-lg">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search commands, pages, actions..."
              className="flex-1 h-12 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded-md border border-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {flatFiltered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {category}
                  </p>
                  {items.map((cmd) => {
                    const idx = globalIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        data-index={idx}
                        onClick={() => runCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          isSelected
                            ? "bg-accent/10 text-accent"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <cmd.icon className="h-4 w-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
