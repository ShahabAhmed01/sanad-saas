"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { inviteStaff } from "@/lib/actions/auth";
import { CheckCircle, Mail } from "lucide-react";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");

  async function handleInvite() {
    if (!name || !email || !role) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data: staff } = await supabase
        .from("staff")
        .select("school_id")
        .eq("id", user.id)
        .single();

      if (!staff) {
        setError("Staff record not found");
        setLoading(false);
        return;
      }

      const result = await inviteStaff({
        email,
        name,
        role,
        schoolId: staff.school_id,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setTempPassword(result.temporaryPassword || "");
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    }

    setLoading(false);
  }

  return (
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
              <Label className="text-ink">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Muhammad Ali" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-ink">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu.pk" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-ink">Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleInvite} disabled={loading || !name || !email} className="w-full bg-accent hover:bg-accent/90 text-white">
              <Mail className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
