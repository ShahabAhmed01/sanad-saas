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

interface Route {
  id: string;
  name: string;
  fare_amount: number;
}

export default function TransportPage() {
  const router = useRouter();
  const schoolId = useSchoolId();

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
        <p className="text-sm font-medium text-ink">Failed to load data</p>
        <p className="text-xs text-slate mt-1">{error.message}</p>
      </div>
    );
  }

  const columns = [
    { key: "name", header: "Route Name" },
    {
      key: "fare_amount",
      header: "Monthly Fare",
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
      <Breadcrumbs items={[{ label: "Transport" }]} />
      <div className="space-y-6">
      <PageHeader
        title="Transport"
        description="Manage routes, vehicles, and student assignments"
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Route
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
          title="No transport routes"
          description="Set up routes and assign vehicles to manage your school's transport system."
          action={{ label: "Add Route", onClick: () => router.push("/transport/assign") }}
        />
      ) : (
        <DataTable
          data={routes}
          columns={columns}
          searchKeys={["name"]}
          searchPlaceholder="Search routes..."
        />
      )}
    </div>
    </>
  );
}
