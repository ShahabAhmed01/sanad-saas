"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

const PLANS = [
  { name: "Trial", price: 0, students: 100, staff: 20 },
  { name: "Starter", price: 2999, students: 100, staff: 30 },
  { name: "Growth", price: 7999, students: 500, staff: 100 },
  { name: "Institution", price: 15999, students: 1500, staff: 300 },
  { name: "Enterprise", price: 0, students: Infinity, staff: Infinity },
];

export default function BillingPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const supabase = createClient();

  const { data: school, isLoading } = useQuery({
    queryKey: queryKeys.school.subscription(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return null;
      const { data } = await supabase
        .from("schools")
        .select("*, plans!inner(name, price_pkr_monthly)")
        .eq("id", schoolId)
        .single();
      return data;
    },
    enabled: !!schoolId,
  });

  const { data: counts } = useQuery({
    queryKey: ["subscription-counts", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      const [students, staff] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "active"),
        supabase.from("staff").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "active"),
      ]);
      return { students: students.count || 0, staff: staff.count || 0 };
    },
    enabled: !!schoolId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const currentPlan = PLANS.find((p) => p.name.toLowerCase() === (school?.plans as { name?: string } | null)?.name?.toLowerCase()) || PLANS[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billing.title")}
        description={t("billing.description")}
      />

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.currentPlan")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
            <Badge variant={school?.status === "active" ? "default" : "secondary"}>
              {school?.status}
            </Badge>
          </div>
          {currentPlan.price > 0 && (
            <p className="text-muted-foreground">
              PKR {currentPlan.price.toLocaleString()} {t("landing.perMonth")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billing.usageLimits")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("billing.studentsUsed")}</span>
              <span>{counts?.students || 0} / {currentPlan.students === Infinity ? t("billing.unlimited") : currentPlan.students}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{
                  width: `${currentPlan.students === Infinity ? 10 : Math.min(((counts?.students || 0) / currentPlan.students) * 100, 100)}%`
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("billing.staffUsed")}</span>
              <span>{counts?.staff || 0} / {currentPlan.staff === Infinity ? t("billing.unlimited") : currentPlan.staff}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{
                  width: `${currentPlan.staff === Infinity ? 10 : Math.min(((counts?.staff || 0) / currentPlan.staff) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.filter((p) => p.name !== "Trial" && p.name !== "Enterprise").map((plan) => (
          <Card key={plan.name} className={currentPlan.name === plan.name ? "border-accent" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-bold">PKR {plan.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">{t("landing.perMonth")}</span></p>
              <p className="text-sm text-muted-foreground">{t("landing.studentsUpTo", { count: String(plan.students) })}</p>
              <p className="text-sm text-muted-foreground">{plan.staff} {t("billing.staffUsed")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
