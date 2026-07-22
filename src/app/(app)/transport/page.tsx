"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Bus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Route {
  id: string;
  name: string;
  fare_amount: number;
}

export default function TransportPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutes() {
      const supabase = createClient();
      const { data } = await supabase
        .from("transport_routes")
        .select("*")
        .order("name");

      setRoutes(data || []);
      setLoading(false);
    }
    loadRoutes();
  }, []);

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
  );
}
