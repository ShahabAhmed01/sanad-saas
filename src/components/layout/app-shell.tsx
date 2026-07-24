"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { SessionExpiryModal } from "@/components/auth/session-expiry-modal";
import { useSmartDefaults } from "@/hooks/use-smart-defaults";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useI18n();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useSmartDefaults();

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Command Palette */}
      <CommandPalette />
      <KeyboardShortcuts />
      <SessionExpiryModal />

      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-14 px-4 border-b border-slate-light bg-paper-raised">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-white font-display font-bold text-xs">
              S
            </div>
            <span className="font-display text-base font-semibold text-ink">
              Sanad
            </span>
          </div>

          {/* Search trigger */}
          <button
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
              );
            }}
            className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t("common.search")}</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-background rounded border border-border">
              ⌘K
            </kbd>
          </button>

          <div className="flex-1" />
          <LanguageToggle />
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
