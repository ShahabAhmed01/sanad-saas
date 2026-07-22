"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Building2,
  Users,
  Palette,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardData {
  schoolName: string;
  city: string;
  boardType: string;
  primaryColor: string;
  totalStudents: string;
  totalStaff: string;
}

const steps = [
  { id: 1, title: "School Info", icon: Building2 },
  { id: 2, title: "Size", icon: Users },
  { id: 3, title: "Theme", icon: Palette },
  { id: 4, title: "Ready", icon: Sparkles },
];

const themes = [
  { name: "Noor Classic", color: "#B8862F", description: "Clean & professional" },
  { name: "Emerald Dusk", color: "#1A7A5A", description: "Rich & premium" },
  { name: "Warm Sand", color: "#A6612E", description: "Earthy & inviting" },
  { name: "Midnight Royal", color: "#4A5FA5", description: "Modern & sophisticated" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    schoolName: "",
    city: "",
    boardType: "matric_fsc",
    primaryColor: "#B8862F",
    totalStudents: "",
    totalStaff: "",
  });

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step >= s.id
                      ? "bg-accent text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    s.id
                  )}
                </div>
                {s.id < steps.length && (
                  <div
                    className={cn(
                      "w-12 sm:w-20 h-0.5 mx-1",
                      step > s.id ? "bg-accent" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Step {step} of {steps.length}: {steps[step - 1].title}
          </p>
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Tell us about your school
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We&apos;ll set everything up in under 5 minutes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="schoolName">School / Academy Name</Label>
                  <Input
                    id="schoolName"
                    placeholder="e.g., Al-Noor Science Academy"
                    value={data.schoolName}
                    onChange={(e) => updateData({ schoolName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Lahore"
                      value={data.city}
                      onChange={(e) => updateData({ city: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="board">Board / Curriculum</Label>
                    <select
                      id="board"
                      value={data.boardType}
                      onChange={(e) => updateData({ boardType: e.target.value })}
                      className="mt-1.5 flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                    >
                      <option value="matric_fsc">Matric / FSc</option>
                      <option value="cambridge_o_a_level">Cambridge O/A Level</option>
                      <option value="montessori">Montessori</option>
                      <option value="mixed">Mixed / Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  How big is your school?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This helps us recommend the right plan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="students">Approximate Students</Label>
                  <Input
                    id="students"
                    type="number"
                    placeholder="e.g., 500"
                    value={data.totalStudents}
                    onChange={(e) => updateData({ totalStudents: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="staff">Staff Members</Label>
                  <Input
                    id="staff"
                    type="number"
                    placeholder="e.g., 30"
                    value={data.totalStaff}
                    onChange={(e) => updateData({ totalStaff: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-7 w-7 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Choose your theme
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  You can change this later in Settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => updateData({ primaryColor: theme.color })}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                      data.primaryColor === theme.color
                        ? "border-accent bg-accent/5 shadow-md"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                    aria-pressed={data.primaryColor === theme.color}
                  >
                    <div
                      className="w-12 h-12 rounded-full mb-2 shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    />
                    <p className="text-sm font-medium text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                You&apos;re all set!
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {data.schoolName ? `${data.schoolName} is` : "Your school is"} ready to go.
                Start by adding your staff and students.
              </p>
              <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm font-medium text-foreground">Quick start checklist:</p>
                {[
                  "Add your staff members",
                  "Set up classes and sections",
                  "Import or add students",
                  "Configure fee structure",
                  "Mark first attendance",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < steps.length ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-accent hover:bg-accent/90 text-white"
                disabled={step === 1 && !data.schoolName}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    const { createClient } = await import("@/lib/supabase/client");
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                      const { data: staff } = await supabase
                        .from("staff")
                        .select("school_id")
                        .eq("id", user.id)
                        .single();
                      if (staff) {
                        await supabase
                          .from("schools")
                          .update({ name: data.schoolName, city: data.city, board_type: data.boardType })
                          .eq("id", staff.school_id);
                      }
                    }
                    window.location.href = "/dashboard";
                  } catch {
                    window.location.href = "/dashboard";
                  }
                }}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
