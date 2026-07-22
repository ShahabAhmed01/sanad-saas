"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteStaff } from "@/lib/actions/auth";
import { CheckCircle, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

const roles = [
  { value: "teacher", label: "Teacher" },
  { value: "principal", label: "Principal" },
  { value: "accountant", label: "Accountant" },
  { value: "front_desk", label: "Front Desk / Admissions" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "librarian", label: "Librarian" },
  { value: "transport_coordinator", label: "Transport Coordinator" },
  { value: "exam_controller", label: "Exam Controller" },
];

export default function InviteStaffPage() {
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
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
      toast.success("Invitation sent", { description: `${name} invited as ${roles.find(r => r.value === role)?.label}` });
      setSuccess(true);
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error("Invitation failed", { description: err.message });
    },
  });

  function handleInvite() {
    if (!name || !email || !role) return;
    setError("");
    inviteMutation.mutate();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Staff", href: "/staff" }, { label: "Invite Staff" }]} />
      <div className="space-y-6">
      <PageHeader title="Invite Staff" description="Send an invitation to a new staff member" />

      {success ? (
        <Card className="border-success bg-success/5">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="font-display text-xl font-semibold text-ink">Invitation Sent!</h2>
            <p className="text-slate">
              {name} has been invited as {roles.find(r => r.value === role)?.label}.
            </p>
            <div className="bg-paper rounded-lg p-3 inline-block">
              <p className="text-xs text-slate">Temporary password:</p>
              <p className="font-mono text-sm text-ink font-bold">{tempPassword}</p>
            </div>
            <p className="text-xs text-slate">
              Share this password with the staff member. They should change it on first login.
            </p>
            <Button onClick={() => { setSuccess(false); setName(""); setEmail(""); setTempPassword(""); }} variant="outline">
              Invite another
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-light max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">New Staff Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-danger/10 text-danger text-sm p-3 rounded-lg">{error}</div>
            )}
            <div>
              <Label htmlFor="full-name" className="text-ink">Full Name</Label>
              <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Muhammad Ali" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email" className="text-ink">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu.pk" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="role" className="text-ink">Role</Label>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
                placeholder={roles.find((r) => r.value === role)?.label || "Select role..."}
                options={roles}
              />
            </div>
            <Button onClick={handleInvite} disabled={!name || !email} isLoading={inviteMutation.isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
