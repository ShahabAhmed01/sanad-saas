"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { applyTheme, type ThemeName } from "@/lib/themes";
import { useThemeStore } from "@/lib/store";
import { toast } from "sonner";
import { AlertCircle, Save } from "lucide-react";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";

interface SchoolSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  board_type: string;
  primary_color: string;
}

const themeOptions = [
  { name: "Noor Classic", color: "#B8862F", themeName: "noor-classic" as ThemeName },
  { name: "Emerald Dusk", color: "#1A7A5A", themeName: "emerald-dusk" as ThemeName },
  { name: "Warm Sand", color: "#A6612E", themeName: "warm-sand" as ThemeName },
  { name: "Midnight Royal", color: "#4A5FA5", themeName: "midnight-royal" as ThemeName },
];

const modules = [
  { key: "library", label: "Library", description: "Book catalog, issue/return tracking" },
  { key: "transport", label: "Transport", description: "Route management and vehicle tracking" },
  { key: "exams", label: "Exams", description: "Exam scheduling, marks entry, report cards" },
  { key: "parent_portal", label: "Parent Portal", description: "Parent access to attendance, marks, fees" },
  { key: "hr", label: "HR", description: "Staff leave, payroll, and HR management" },
  { key: "front_desk", label: "Front Desk", description: "Admissions and certificates" },
];

async function fetchSettings(schoolId: string) {
  const supabase = createClient();
  const { data: school } = await supabase.from("schools").select("*").eq("id", schoolId).single();
  if (!school) throw new Error("School not found");

  return {
    settings: {
      name: school.name || "",
      email: school.email || "",
      phone: school.phone || "",
      address: school.address || "",
      city: school.city || "",
      board_type: school.board_type || "",
      primary_color: school.primary_color || "#B8862F",
    },
    moduleSettings: {
      library: school.module_library ?? true,
      transport: school.module_transport ?? true,
      exams: school.module_exams ?? true,
      parent_portal: school.module_parent_portal ?? true,
      hr: school.module_hr ?? true,
      front_desk: school.module_front_desk ?? true,
    },
  };
}

export default function SettingsPage() {
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const { setTheme, mode } = useThemeStore();

  const { data, isLoading: loading, error } = useQuery({
    queryKey: queryKeys.school.settings(schoolId),
    queryFn: () => fetchSettings(schoolId),
    enabled: !!schoolId,
  });

  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [moduleSettings, setModuleSettings] = useState<Record<string, boolean>>({});

  // Sync query data into local state
  const currentSettings = settings ?? data?.settings ?? null;
  const currentModuleSettings = Object.keys(moduleSettings).length > 0 ? moduleSettings : data?.moduleSettings ?? {};

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentSettings) throw new Error("No settings to save");
      const supabase = createClient();

      const { error } = await supabase
        .from("schools")
        .update({
          name: currentSettings.name,
          email: currentSettings.email,
          phone: currentSettings.phone,
          address: currentSettings.address,
          city: currentSettings.city,
          board_type: currentSettings.board_type,
          primary_color: currentSettings.primary_color,
          ...Object.fromEntries(
            Object.entries(currentModuleSettings).map(([key, val]) => [`module_${key}`, val])
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", schoolId);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.school.settings(schoolId) });

      const previous = queryClient.getQueryData(queryKeys.school.settings(schoolId));

      if (currentSettings) {
        queryClient.setQueryData(queryKeys.school.settings(schoolId), (old: Awaited<ReturnType<typeof fetchSettings>> | undefined) => ({
          ...old,
          settings: currentSettings,
          moduleSettings: currentModuleSettings,
        }));

        const matchedTheme = themeOptions.find(t => t.color === currentSettings.primary_color);
        if (matchedTheme) {
          setTheme(matchedTheme.themeName);
          applyTheme(matchedTheme.themeName, mode);
        }
      }

      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      queryClient.setQueryData(queryKeys.school.settings(schoolId), context?.previous);
      toast.error("Failed to save settings", {
        description: err.message || "An error occurred",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.settings(schoolId) });
    },
    onSuccess: () => {
      if (currentSettings) {
        const matchedTheme = themeOptions.find(t => t.color === currentSettings.primary_color);
        if (matchedTheme) {
          setTheme(matchedTheme.themeName);
          applyTheme(matchedTheme.themeName, mode);
        }
      }

      toast.success("Settings saved", {
        description: "Your school settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.school.settings(schoolId) });
    },
  });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your school's settings" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-danger mb-3" />
          <p className="text-sm font-medium text-ink">Failed to load settings</p>
          <p className="text-xs text-slate mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your school's settings" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-paper-raised rounded-xl animate-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings" }]} />

      <PageHeader
        title="Settings"
        description="Manage your school's settings"
        action={
          <Button
            onClick={() => saveMutation.mutate()}
            isLoading={saveMutation.isPending}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-slate-light">
            <CardHeader>
              <CardTitle className="text-lg font-display">School Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school-name" className="text-ink">School Name</Label>
                  <Input
                    id="school-name"
                    value={currentSettings?.name || ""}
                    onChange={(e) => setSettings(s => s ? { ...s, name: e.target.value } : s)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="school-email" className="text-ink">Email</Label>
                  <Input
                    id="school-email"
                    type="email"
                    value={currentSettings?.email || ""}
                    onChange={(e) => setSettings(s => s ? { ...s, email: e.target.value } : s)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="school-phone" className="text-ink">Phone</Label>
                  <Input
                    id="school-phone"
                    value={currentSettings?.phone || ""}
                    onChange={(e) => setSettings(s => s ? { ...s, phone: e.target.value } : s)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="school-city" className="text-ink">City</Label>
                  <Input
                    id="school-city"
                    value={currentSettings?.city || ""}
                    onChange={(e) => setSettings(s => s ? { ...s, city: e.target.value } : s)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="school-address" className="text-ink">Address</Label>
                <Input
                  id="school-address"
                  value={currentSettings?.address || ""}
                  onChange={(e) => setSettings(s => s ? { ...s, address: e.target.value } : s)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="board-type" className="text-ink">Board / Curriculum</Label>
                <Select
                  id="board-type"
                  value={currentSettings?.board_type || ""}
                  onChange={(e) => setSettings(s => s ? { ...s, board_type: e.target.value } : s)}
                  className="mt-1.5"
                  options={[
                    { value: "matric_fsc", label: "Matric / FSc" },
                    { value: "cambridge_o_a_level", label: "Cambridge O / A Level" },
                    { value: "montessori", label: "Montessori" },
                    { value: "mixed", label: "Mixed / Other" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card className="border-slate-light">
            <CardHeader>
              <CardTitle className="text-lg font-display">Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate mb-4">
                Turn modules on or off. Disabled modules won&apos;t appear in any role&apos;s navigation.
              </p>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div
                    key={module.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-light"
                  >
                    <div>
                      <span className="text-sm font-medium text-ink">{module.label}</span>
                      <p className="text-xs text-slate mt-0.5">{module.description}</p>
                    </div>
                    <Switch
                      id={`module-${module.key}`}
                      checked={currentModuleSettings[module.key as keyof typeof currentModuleSettings] ?? true}
                      onCheckedChange={(checked) =>
                        setModuleSettings(prev => ({ ...prev, [module.key]: checked } as Record<string, boolean>))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="border-slate-light">
            <CardHeader>
              <CardTitle className="text-lg font-display">Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate mb-4">
                Choose a color theme for your school&apos;s portal.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themeOptions.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSettings(s => s ? { ...s, primary_color: t.color } : s);
                      setTheme(t.themeName);
                      applyTheme(t.themeName, mode);
                    }}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      currentSettings?.primary_color === t.color
                        ? "border-accent bg-accent/5 shadow-md"
                        : "border-slate-light hover:border-slate"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full mb-2 shadow-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs font-medium text-ink">{t.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
