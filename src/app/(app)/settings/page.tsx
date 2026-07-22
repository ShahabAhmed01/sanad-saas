"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface SchoolSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  board_type: string;
  primary_color: string;
}

const themes = [
  { name: "Noor Classic", color: "#B8862F", accent: "#B8862F" },
  { name: "Emerald Dusk", color: "#1F6B5C", accent: "#1F6B5C" },
  { name: "Warm Sand", color: "#A6612E", accent: "#A6612E" },
  { name: "Midnight Royal", color: "#4A5FA5", accent: "#4A5FA5" },
];

const modules = [
  { key: "library", label: "Library" },
  { key: "transport", label: "Transport" },
  { key: "exams", label: "Exams" },
  { key: "parent_portal", label: "Parent Portal" },
  { key: "hr", label: "HR" },
  { key: "front_desk", label: "Front Desk / Admissions" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staff } = await supabase
        .from("staff")
        .select("school_id")
        .eq("id", user.id)
        .single();

      if (!staff) return;

      const { data: school } = await supabase
        .from("schools")
        .select("*")
        .eq("id", staff.school_id)
        .single();

      if (school) {
        setSettings({
          name: school.name || "",
          email: school.email || "",
          phone: school.phone || "",
          address: school.address || "",
          city: school.city || "",
          board_type: school.board_type || "",
          primary_color: school.primary_color || "#B8862F",
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: staff } = await supabase
      .from("staff")
      .select("school_id")
      .eq("id", user.id)
      .single();

    if (!staff) return;

    await supabase
      .from("schools")
      .update({
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        board_type: settings.board_type,
        primary_color: settings.primary_color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", staff.school_id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      <PageHeader
        title="Settings"
        description="Manage your school's settings"
        action={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* School Profile */}
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
                  value={settings?.name || ""}
                  onChange={(e) => setSettings(s => s ? { ...s, name: e.target.value } : s)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="school-email" className="text-ink">Email</Label>
                <Input
                  id="school-email"
                  type="email"
                  value={settings?.email || ""}
                  onChange={(e) => setSettings(s => s ? { ...s, email: e.target.value } : s)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="school-phone" className="text-ink">Phone</Label>
                <Input
                  id="school-phone"
                  value={settings?.phone || ""}
                  onChange={(e) => setSettings(s => s ? { ...s, phone: e.target.value } : s)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="school-city" className="text-ink">City</Label>
                <Input
                  id="school-city"
                  value={settings?.city || ""}
                  onChange={(e) => setSettings(s => s ? { ...s, city: e.target.value } : s)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="school-address" className="text-ink">Address</Label>
              <Input
                id="school-address"
                value={settings?.address || ""}
                onChange={(e) => setSettings(s => s ? { ...s, address: e.target.value } : s)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="board-type" className="text-ink">Board / Curriculum</Label>
              <select
                id="board-type"
                value={settings?.board_type || ""}
                onChange={(e) => setSettings(s => s ? { ...s, board_type: e.target.value } : s)}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              >
                <option value="matric_fsc">Matric / FSc</option>
                <option value="cambridge_o_a_level">Cambridge O / A Level</option>
                <option value="montessori">Montessori</option>
                <option value="mixed">Mixed / Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
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
                  <span className="text-sm font-medium text-ink">{module.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-light peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="border-slate-light">
          <CardHeader>
            <CardTitle className="text-lg font-display">Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate mb-4">
              Choose a color theme for your school&apos;s portal.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setSettings(s => s ? { ...s, primary_color: theme.accent } : s)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                    settings?.primary_color === theme.accent
                      ? "border-accent bg-accent/5"
                      : "border-slate-light hover:border-slate"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full mb-2 shadow-sm"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-xs font-medium text-ink">{theme.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
