"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { category: "Navigation", items: [
    { keys: ["Cmd", "K"], description: "Open command palette" },
    { keys: ["Cmd", "/"], description: "Show keyboard shortcuts" },
    { keys: ["Esc"], description: "Close modal/palette" },
  ]},
  { category: "Attendance", items: [
    { keys: ["Cmd", "A"], description: "Mark attendance" },
    { keys: ["Cmd", "Shift", "A"], description: "Mark all present" },
  ]},
  { category: "Students", items: [
    { keys: ["Cmd", "N"], description: "Add new student" },
    { keys: ["Cmd", "I"], description: "Import CSV" },
  ]},
  { category: "Fees", items: [
    { keys: ["Cmd", "P"], description: "Collect payment" },
    { keys: ["Cmd", "G"], description: "Generate invoices" },
  ]},
  { category: "General", items: [
    { keys: ["Cmd", "S"], description: "Save changes" },
    { keys: ["Cmd", "Shift", "D"], description: "Go to dashboard" },
    { keys: ["?"], description: "Show this dialog" },
  ]},
];

export function KeyboardShortcuts() {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
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
