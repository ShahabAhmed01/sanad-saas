"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle } from "lucide-react";
import { Banknote, Plus, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function FeesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, collected: 0, pending: 0 });

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const { data: staff, error: staffErr } = await supabase
        .from("staff")
        .select("school_id")
        .eq("id", user.id)
        .single();
      if (staffErr || !staff) { setError("Failed to load school info"); setLoading(false); return; }

      const { data, error: queryErr } = await supabase
        .from("fee_invoices")
        .select("*")
        .eq("school_id", staff.school_id)
        .order("created_at", { ascending: false });

      if (queryErr) { setError("Failed to load invoices"); setLoading(false); return; }

      setInvoices(data || []);
      const total = (data || []).reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const collected = (data || [])
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

      setStats({ total, collected, pending: total - collected });
      setLoading(false);
    }
    loadData();
  }, []);

  const columns = [
    { key: "period_label", header: "Period" },
    {
      key: "total_amount",
      header: "Amount",
      className: "text-right",
      render: (item: FeeInvoice) => (
        <span className="tabular-nums font-medium">
          PKR {Number(item.total_amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item: FeeInvoice) =>
        new Date(item.due_date).toLocaleDateString("en-PK"),
    },
    {
      key: "status",
      header: "Status",
      render: (item: FeeInvoice) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[item.status] || "bg-slate/10 text-slate"
          }`}
        >
          {item.status.replace("_", " ")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees & Finance"
        description="Manage fee structures, collections, and payments"
        action={
          <div className="flex gap-2">
            <Button variant="outline">Fee Structure</Button>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoices
            </Button>
          </div>
        }
      />

      {error && (
        <Card className="border-danger bg-danger/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <p className="text-danger font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {!error && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-ink tabular-nums">
              PKR {stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success tabular-nums">
              PKR {stats.collected.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate">Pending</CardTitle>
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
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No invoices yet"
          description="Set up your fee structure and generate invoices for your students."
          action={{ label: "Set up fees", onClick: () => router.push("/fees/structure") }}
        />
      ) : (
        <DataTable
          data={invoices}
          columns={columns}
          searchKeys={["period_label", "status"]}
          searchPlaceholder="Search by period or status..."
        />
      )}
    </div>
  );
}
