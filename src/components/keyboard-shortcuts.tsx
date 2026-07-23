"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { useI18n } from "@/i18n/provider";

const shortcutKeys = [
  { categoryKey: "keyboardShortcuts.navigation", items: [
    { keys: ["Cmd", "K"], descriptionKey: "keyboardShortcuts.openCommandPalette" },
    { keys: ["Cmd", "/"], descriptionKey: "keyboardShortcuts.showKeyboardShortcuts" },
    { keys: ["Esc"], descriptionKey: "keyboardShortcuts.closeModal" },
  ]},
  { categoryKey: "keyboardShortcuts.attendance", items: [
    { keys: ["Cmd", "A"], descriptionKey: "keyboardShortcuts.markAttendance" },
    { keys: ["Cmd", "Shift", "A"], descriptionKey: "keyboardShortcuts.markAllPresent" },
  ]},
  { categoryKey: "keyboardShortcuts.students", items: [
    { keys: ["Cmd", "N"], descriptionKey: "keyboardShortcuts.addNewStudent" },
    { keys: ["Cmd", "I"], descriptionKey: "keyboardShortcuts.importCSV" },
  ]},
  { categoryKey: "keyboardShortcuts.fees", items: [
    { keys: ["Cmd", "P"], descriptionKey: "keyboardShortcuts.collectPayment" },
    { keys: ["Cmd", "G"], descriptionKey: "keyboardShortcuts.generateInvoices" },
  ]},
  { categoryKey: "keyboardShortcuts.general", items: [
    { keys: ["Cmd", "S"], descriptionKey: "keyboardShortcuts.saveChanges" },
    { keys: ["Cmd", "Shift", "D"], descriptionKey: "keyboardShortcuts.goToDashboard" },
    { keys: ["?"], descriptionKey: "keyboardShortcuts.showThisDialog" },
  ]},
];

export function KeyboardShortcuts() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const shortcuts = shortcutKeys.map((group) => ({
    category: t(group.categoryKey),
    items: group.items.map((item) => ({
      keys: item.keys,
      description: t(item.descriptionKey),
    })),
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t("keyboardShortcuts.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm text-foreground">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded-md text-muted-foreground">
                            {key}
                          </kbd>
                          {j < item.keys.length - 1 && (
                            <span className="text-muted-foreground mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
