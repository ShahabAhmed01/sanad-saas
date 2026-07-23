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
import { useI18n } from "@/i18n/provider";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  href: string;
  category: string;
}

interface CommandItemKey {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  icon: React.ElementType;
  href: string;
  categoryKey: string;
}

const commandKeys: CommandItemKey[] = [
  { id: "dashboard", labelKey: "commandPalette.dashboard", icon: LayoutDashboard, href: "/dashboard", categoryKey: "commandPalette.navigate" },
  { id: "staff", labelKey: "commandPalette.staffManagement", icon: Users, href: "/staff", categoryKey: "commandPalette.navigate" },
  { id: "students", labelKey: "commandPalette.studentManagement", icon: GraduationCap, href: "/students", categoryKey: "commandPalette.navigate" },
  { id: "attendance", labelKey: "commandPalette.attendance", icon: CalendarCheck, href: "/attendance", categoryKey: "commandPalette.navigate" },
  { id: "fees", labelKey: "commandPalette.feeManagement", icon: Banknote, href: "/fees", categoryKey: "commandPalette.navigate" },
  { id: "exams", labelKey: "commandPalette.exams", icon: ClipboardList, href: "/exams", categoryKey: "commandPalette.navigate" },
  { id: "library", labelKey: "commandPalette.library", icon: BookOpen, href: "/library", categoryKey: "commandPalette.navigate" },
  { id: "transport", labelKey: "commandPalette.transport", icon: Bus, href: "/transport", categoryKey: "commandPalette.navigate" },
  { id: "notifications", labelKey: "commandPalette.notifications", icon: Bell, href: "/notifications", categoryKey: "commandPalette.navigate" },
  { id: "settings", labelKey: "commandPalette.settings", icon: Settings, href: "/settings", categoryKey: "commandPalette.navigate" },
  { id: "audit", labelKey: "commandPalette.auditLog", icon: FileText, href: "/audit", categoryKey: "commandPalette.navigate" },

  { id: "mark-attendance", labelKey: "commandPalette.markAttendance", descriptionKey: "commandPalette.markAttendanceDesc", icon: CalendarCheck, href: "/attendance/mark", categoryKey: "commandPalette.quickActions" },
  { id: "add-student", labelKey: "commandPalette.addStudent", descriptionKey: "commandPalette.addStudentDesc", icon: GraduationCap, href: "/students", categoryKey: "commandPalette.quickActions" },
  { id: "invite-staff", labelKey: "commandPalette.inviteStaffMember", descriptionKey: "commandPalette.inviteStaffMemberDesc", icon: Users, href: "/staff/invite", categoryKey: "commandPalette.quickActions" },
  { id: "create-exam", labelKey: "commandPalette.createExam", descriptionKey: "commandPalette.createExamDesc", icon: ClipboardList, href: "/exams/create", categoryKey: "commandPalette.quickActions" },
  { id: "generate-invoice", labelKey: "commandPalette.generateFeeInvoice", descriptionKey: "commandPalette.generateFeeInvoiceDesc", icon: Banknote, href: "/fees/generate", categoryKey: "commandPalette.quickActions" },
  { id: "collect-payment", labelKey: "commandPalette.collectPayment", descriptionKey: "commandPalette.collectPaymentDesc", icon: Banknote, href: "/fees/collect", categoryKey: "commandPalette.quickActions" },
  { id: "create-homework", labelKey: "commandPalette.createHomework", icon: FileText, href: "/homework/create", categoryKey: "commandPalette.quickActions" },
  { id: "create-announcement", labelKey: "commandPalette.createAnnouncement", icon: Bell, href: "/announcements/create", categoryKey: "commandPalette.quickActions" },
  { id: "issue-book", labelKey: "commandPalette.issueReturnBook", icon: BookOpen, href: "/library/issue", categoryKey: "commandPalette.quickActions" },
  { id: "assign-transport", labelKey: "commandPalette.assignTransportRoute", icon: Bus, href: "/transport/assign", categoryKey: "commandPalette.quickActions" },
  { id: "gradebook", labelKey: "commandPalette.enterMarks", icon: ClipboardCheck, href: "/gradebook/entry", categoryKey: "commandPalette.quickActions" },
  { id: "report-cards", labelKey: "commandPalette.viewReportCards", icon: FileText, href: "/exams/report-cards", categoryKey: "commandPalette.quickActions" },
];

export function CommandPalette() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = commandKeys.map((cmd) => ({
    id: cmd.id,
    label: t(cmd.labelKey),
    description: cmd.descriptionKey ? t(cmd.descriptionKey) : undefined,
    icon: cmd.icon,
    href: cmd.href,
    category: t(cmd.categoryKey),
  }));

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
              placeholder={t("commandPalette.searchPlaceholder")}
              className="flex-1 h-12 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              aria-label={t("commandPalette.searchPlaceholder")}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded-md border border-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {flatFiltered.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t("commandPalette.noResults", { query })}
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
              {t("commandPalette.navigate")}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">↵</kbd>
              {t("commandPalette.select")}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">esc</kbd>
              {t("commandPalette.close")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
