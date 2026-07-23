"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle, Bus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useI18n } from "@/i18n/provider";

interface Route {
  id: string;
  name: string;
  fare_amount: number;
}

export default function TransportPage() {
  const router = useRouter();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const { data: routes = [], isLoading: loading, error } = useQuery<Route[], Error>({
    queryKey: ["transport-routes", schoolId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transport_routes")
        .select("*")
        .eq("school_id", schoolId)
        .order("name");

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-danger mb-3" />
        <p className="text-sm font-medium text-ink">{t("common.failedToLoad")}</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  const columns = [
    { key: "name", header: t("transport.routeName") },
    {
      key: "fare_amount",
      header: t("common.amount"),
      className: "text-right",
      render: (item: Route) => (
        <span className="tabular-nums font-medium">
          PKR {Number(item.fare_amount).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: t("transport.title") }]} />
      <div className="space-y-6">
      <PageHeader
        title={t("transport.title")}
        description={t("transport.manageRoutes")}
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t("transport.addRoute")}
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <EmptyState
          icon={Bus}
          title={t("transport.noRoutes")}
          description={t("transport.addFirstRoute")}
          action={{ label: t("transport.addRoute"), onClick: () => router.push("/transport/assign") }}
        />
      ) : (
        <DataTable
          data={routes}
          columns={columns}
          searchKeys={["name"]}
          searchPlaceholder={t("common.search")}
        />
      )}
    </div>
    </>
  );
}
