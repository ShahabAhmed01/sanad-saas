"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";

const SHORTCUTS = [
  { keys: "Ctrl + K", action: "Open command palette" },
  { keys: "Ctrl + D", action: "Go to dashboard" },
  { keys: "Ctrl + Shift + A", action: "Mark attendance" },
  { keys: "Ctrl + Shift + S", action: "Go to students" },
  { keys: "Ctrl + Shift + F", action: "Go to fees" },
  { keys: "Escape", action: "Close modal/palette" },
];

const MODULES = [
  { name: "Dashboard", desc: "Overview of school statistics and quick actions" },
  { name: "Students", desc: "Manage student records, import CSV, promote students" },
  { name: "Staff", desc: "Staff directory, invitations, role management" },
  { name: "Attendance", desc: "Daily attendance tracking for students and staff" },
  { name: "Fees", desc: "Fee structure, invoice generation, payment collection" },
  { name: "Exams", desc: "Exam scheduling, marks entry, report cards" },
  { name: "Performance", desc: "Analytics and charts for student/class performance" },
  { name: "Calendar", desc: "Academic calendar with events and holidays" },
  { name: "Library", desc: "Book catalog and issue/return tracking" },
  { name: "Transport", desc: "Route management and student assignments" },
  { name: "Payroll", desc: "Staff salary processing and history" },
  { name: "Certificates", desc: "Generate bonafide, character, transfer certificates" },
  { name: "Settings", desc: "School profile, modules, themes, academic years" },
];

export default function HelpPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("help.title")}
        description={t("help.description")}
      />

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>{t("help.keyboardShortcuts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.keys} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{shortcut.keys}</kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Guide */}
      <Card>
        <CardHeader>
          <CardTitle>{t("help.moduleGuide")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULES.map((mod) => (
              <div key={mod.name} className="p-3 border rounded-lg">
                <h4 className="font-medium">{mod.name}</h4>
                <p className="text-sm text-muted-foreground">{mod.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>{t("help.contactSupport")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For support, contact us at{" "}
            <a href="mailto:support@sanad.pk" className="text-accent underline">
              support@sanad.pk
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
