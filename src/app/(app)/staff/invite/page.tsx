"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteStaff } from "@/lib/actions/auth";
import { CheckCircle, Copy, Eye, EyeOff, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

const roles = [
  { value: "teacher" },
  { value: "principal" },
  { value: "accountant" },
  { value: "front_desk" },
  { value: "hr_manager" },
  { value: "librarian" },
  { value: "transport_coordinator" },
  { value: "exam_controller" },
];

export default function InviteStaffPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const result = await inviteStaff({
        email,
        name,
        role,
        schoolId,
      });
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.staff(schoolId) });
      setTempPassword(result.temporaryPassword || "");
      toast.success(t("staff.toast_invited"), { description: `${name} invited as ${t(`staff.${role}`)}` });
      setSuccess(true);
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error(t("staff.toast_invite_failed"), { description: err.message });
    },
  });

  function handleInvite() {
    if (!name || !email || !role) return;
    setError("");
    inviteMutation.mutate();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.staff"), href: "/staff" }, { label: t("staff.invite_title") }]} />
      <div className="space-y-6">
      <PageHeader title={t("staff.invite_title")} description={t("staff.invite_description")} />

      {success ? (
        <Card className="border-success bg-success/5">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="font-display text-xl font-semibold text-ink">{t("staff.invitation_sent")}</h2>
            <p className="text-slate">
              {name} has been invited as {t(`staff.${role}`)}.
            </p>
            <div className="bg-paper rounded-lg p-3 inline-block">
              <p className="text-xs text-slate">{t("staff.temp_password")}:</p>
              <p className="font-mono text-sm text-ink font-bold">{showPassword ? tempPassword : "••••••••"}</p>
              <div className="flex justify-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 text-xs"
                >
                  {showPassword ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {showPassword ? t("staff.hide") : t("staff.show")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { navigator.clipboard.writeText(tempPassword); toast.success(t("staff.copied")); }}
                  className="h-8 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {t("staff.copy")}
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate">
              {t("staff.share_password")}
            </p>
            <Button onClick={() => { setSuccess(false); setName(""); setEmail(""); setTempPassword(""); }} variant="outline">
              {t("staff.invite_another")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-light max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("staff.new_invitation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg">{error}</div>
            )}
            <div>
              <Label htmlFor="full-name" className="text-ink">{t("staff.full_name")}</Label>
              <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("staff.invite.namePlaceholder")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email" className="text-ink">{t("staff.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("staff.invite.emailPlaceholder")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="role" className="text-ink">{t("staff.role")}</Label>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
                placeholder={t(`staff.${role}`)}
                options={roles.map(r => ({ value: r.value, label: t(`staff.${r.value}`) }))}
              />
            </div>
            <Button onClick={handleInvite} disabled={!name || !email} isLoading={inviteMutation.isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
              <Mail className="h-4 w-4 mr-2" />
              {t("staff.send_invitation")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
