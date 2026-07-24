"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { Receipt } from "lucide-react";

interface PaymentRecord {
  id: string;
  paid_at: string;
  amount_paid: number;
  payment_method: string;
  receipt_number: string;
  students: { full_name: string; admission_number: string };
  staff: { full_name: string } | null;
}

export default function FeeHistoryPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const supabase = createClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: queryKeys.school.paymentHistory(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data } = await supabase
        .from("fee_payments")
        .select(`
          *,
          students!inner(full_name, admission_number),
          staff!inner(full_name)
        `)
        .eq("school_id", schoolId)
        .order("paid_at", { ascending: false });
      return data || [];
    },
    enabled: !!schoolId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("feeHistory.title")}
        description={t("feeHistory.description")}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Card key={i} className="h-16 animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={Receipt} title={t("feeHistory.noPayments")} description={t("common.noData")} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3">{t("common.date")}</th>
                    <th className="text-left p-3">{t("students.studentName")}</th>
                    <th className="text-right p-3">{t("common.amount")}</th>
                    <th className="text-left p-3">{t("feeHistory.paymentMethod")}</th>
                    <th className="text-left p-3">{t("feeHistory.receiptNumber")}</th>
                    <th className="text-left p-3">{t("feeHistory.receivedBy")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: PaymentRecord) => (
                    <tr key={p.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{new Date(p.paid_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <p className="font-medium">{p.students.full_name}</p>
                        <p className="text-xs text-muted-foreground">{p.students.admission_number}</p>
                      </td>
                      <td className="p-3 text-right">PKR {p.amount_paid?.toLocaleString()}</td>
                      <td className="p-3">{p.payment_method}</td>
                      <td className="p-3 font-mono text-xs">{p.receipt_number}</td>
                      <td className="p-3">{p.staff?.full_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
