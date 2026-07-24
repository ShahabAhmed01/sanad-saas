"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/use-user-profile";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";

export default function ProfilePage() {
  const { t } = useI18n();
  const { data: profile } = useUserProfile();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("auth.confirmPassword"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("auth.passwordMinPlaceholder"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("profile.passwordChanged"));
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("profile.title")}
        description={t("profile.description")}
      />

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">{t("profile.personalInfo")}</TabsTrigger>
          <TabsTrigger value="password">{t("profile.changePassword")}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.personalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.name")}</Label>
                  <Input value={profile?.fullName || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.email")}</Label>
                  <Input value={profile?.role || ""} disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to update profile information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.changePassword")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("profile.confirmNewPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? t("common.loading") : t("common.save")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
