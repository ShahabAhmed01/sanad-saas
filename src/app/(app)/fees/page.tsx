"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle, Banknote, Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/provider";

interface FeeInvoice {
  id: string;
  student_id: string;
  period_label: string;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  unpaid: "bg-danger/10 text-danger",
  partially_paid: "bg-accent/10 text-accent",
  paid: "bg-success/10 text-success",
  overdue: "bg-danger/10 text-danger",
  waived: "bg-slate/10 text-slate",
};

async function fetchFeeData(): Promise<{
  invoices: FeeInvoice[];
  stats: { total: number; collected: number; pending: number };
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: staff } = await supabase
    .from("staff")
    .select("school_id")
    .eq("id", user.id)
    .single();
  if (!staff) throw new Error("Staff not found");

  const { data, error } = await supabase
    .from("fee_invoices")
    .select("*")
    .eq("school_id", staff.school_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load invoices");

  const invoices = data || [];
  const total = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const collected = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  return { invoices, stats: { total, collected, pending: total - collected } };
}

export default function FeesPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["fees"],
    queryFn: fetchFeeData,
  });

  const invoices = data?.invoices || [];
  const stats = data?.stats || { total: 0, collected: 0, pending: 0 };

  const columns = [
    { key: "period_label", header: t("fees.period") },
    {
      key: "total_amount",
      header: t("fees.amount"),
      className: "text-right",
      render: (item: FeeInvoice) => (
        <span className="tabular-nums font-medium">
          PKR {Number(item.total_amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "due_date",
      header: t("fees.due_date"),
      render: (item: FeeInvoice) =>
        new Date(item.due_date).toLocaleDateString("en-PK"),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (item: FeeInvoice) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[item.status] || "bg-slate/10 text-slate"
          }`}
        >
          {t(`fees.${item.status}`)}
        </span>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.fees") }]} />
      <div className="space-y-6">
        <PageHeader
          title={t("fees.title")}
          description={t("fees.description")}
          action={
            <div className="flex gap-2">
              <Link href="/fees/structure">
                <Button variant="outline">{t("fees.fee_structure")}</Button>
              </Link>
              <Link href="/fees/generate">
                <Button className="bg-accent hover:bg-accent/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("fees.generate_invoices")}
                </Button>
              </Link>
            </div>
          }
        />

        {error && (
          <Card className="border-danger bg-danger/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <p className="text-danger font-medium">
                {error instanceof Error ? error.message : t("fees.failed_to_load")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">
                  {t("fees.total_due")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ink tabular-nums">
                  PKR {stats.total.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">
                  {t("fees.collected")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success tabular-nums">
                  PKR {stats.collected.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-light">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">
                  {t("fees.pending")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-danger tabular-nums">
                  PKR {stats.pending.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invoices Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-paper-raised rounded-lg animate-skeleton"
              />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title={t("fees.no_invoices")}
            description={t("fees.no_invoices_description")}
            action={{
              label: t("fees.setup_fees"),
              onClick: () => router.push("/fees/structure"),
            }}
          />
        ) : (
          <DataTable
            data={invoices}
            columns={columns}
            searchKeys={["period_label", "status"]}
            searchPlaceholder={t("fees.search_placeholder")}
          />
        )}
      </div>
    </>
  );
}
