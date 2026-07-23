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
import { useI18n } from "@/i18n/provider";

interface WizardData {
  schoolName: string;
  city: string;
  boardType: string;
  primaryColor: string;
  totalStudents: string;
  totalStaff: string;
}

const stepKeys = [
  { id: 1, titleKey: "onboarding.schoolInfo", icon: Building2 },
  { id: 2, titleKey: "onboarding.size", icon: Users },
  { id: 3, titleKey: "onboarding.theme", icon: Palette },
  { id: 4, titleKey: "onboarding.ready", icon: Sparkles },
];

const themeKeys = [
  { nameKey: "onboarding.themeNoorClassic", color: "#B8862F", descriptionKey: "onboarding.themeNoorClassicDesc" },
  { nameKey: "onboarding.themeEmeraldDusk", color: "#1A7A5A", descriptionKey: "onboarding.themeEmeraldDuskDesc" },
  { nameKey: "onboarding.themeWarmSand", color: "#A6612E", descriptionKey: "onboarding.themeWarmSandDesc" },
  { nameKey: "onboarding.themeMidnightRoyal", color: "#4A5FA5", descriptionKey: "onboarding.themeMidnightRoyalDesc" },
];

export function OnboardingWizard() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    schoolName: "",
    city: "",
    boardType: "matric_fsc",
    primaryColor: "#B8862F",
    totalStudents: "",
    totalStaff: "",
  });

  const steps = stepKeys.map((s) => ({ ...s, title: t(s.titleKey) }));
  const themes = themeKeys.map((th) => ({
    ...th,
    name: t(th.nameKey),
    description: t(th.descriptionKey),
  }));

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
            {t("onboarding.stepOf", { step: String(step), total: String(steps.length) })}: {steps[step - 1].title}
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
                  {t("onboarding.tellUsAboutSchool")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("onboarding.setupInMinutes")}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="schoolName">{t("onboarding.schoolAcademyName")}</Label>
                  <Input
                    id="schoolName"
                    placeholder={t("onboarding.schoolNamePlaceholder")}
                    value={data.schoolName}
                    onChange={(e) => updateData({ schoolName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t("onboarding.city")}</Label>
                    <Input
                      id="city"
                      placeholder={t("onboarding.cityPlaceholder")}
                      value={data.city}
                      onChange={(e) => updateData({ city: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="board">{t("onboarding.boardCurriculum")}</Label>
                    <select
                      id="board"
                      value={data.boardType}
                      onChange={(e) => updateData({ boardType: e.target.value })}
                      className="mt-1.5 flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                    >
                      <option value="matric_fsc">{t("onboarding.boardMatric")}</option>
                      <option value="cambridge_o_a_level">{t("onboarding.boardCambridge")}</option>
                      <option value="montessori">{t("onboarding.boardMontessori")}</option>
                      <option value="mixed">{t("onboarding.boardMixed")}</option>
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
                  {t("onboarding.howBigIsSchool")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("onboarding.recommendPlan")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="students">{t("onboarding.approxStudents")}</Label>
                  <Input
                    id="students"
                    type="number"
                    placeholder={t("onboarding.studentsPlaceholder")}
                    value={data.totalStudents}
                    onChange={(e) => updateData({ totalStudents: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="staff">{t("onboarding.staffMembers")}</Label>
                  <Input
                    id="staff"
                    type="number"
                    placeholder={t("onboarding.staffPlaceholder")}
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
                  {t("onboarding.chooseYourTheme")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("onboarding.changeLater")}
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
                {t("onboarding.allSet")}
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {data.schoolName
                  ? t("onboarding.schoolReadyNamed", { name: data.schoolName })
                  : t("onboarding.schoolReady")}
                {" "}{t("onboarding.startByAdding")}
              </p>
              <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm font-medium text-foreground">{t("onboarding.quickStartChecklist")}</p>
                {[
                  "onboarding.checklistAddStaff",
                  "onboarding.checklistSetupClasses",
                  "onboarding.checklistImportStudents",
                  "onboarding.checklistConfigureFees",
                  "onboarding.checklistMarkAttendance",
                ].map((itemKey, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    {t(itemKey)}
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
                {t("onboarding.back")}
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
                {t("onboarding.continue")}
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
                {t("onboarding.goToDashboard")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
