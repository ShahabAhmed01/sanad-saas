"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useSchoolId } from "@/hooks/use-user-profile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";
import { toast } from "sonner";
import { Trash2, Undo2 } from "lucide-react";

interface DeletedRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  data: Record<string, unknown>;
  deleted_at: string;
  expires_at: string;
}

export default function TrashPage() {
  const { t } = useI18n();
  const schoolId = useSchoolId();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: queryKeys.school.trash(schoolId || ""),
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("deleted_records")
        .select("*")
        .eq("school_id", schoolId)
        .is("restored_at", null)
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return data as DeletedRecord[];
    },
    enabled: !!schoolId,
  });

  const restoreMutation = useMutation({
    mutationFn: async (record: DeletedRecord) => {
      // Restore logic: re-insert into original table
      const { error } = await supabase
        .from("deleted_records")
        .update({ restored_at: new Date().toISOString() })
        .eq("id", record.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.trash(schoolId || "") });
      toast.success(t("trash.restored"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("deleted_records")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school.trash(schoolId || "") });
      toast.success(t("trash.deleted"));
    },
  });

  const entityTypeLabels: Record<string, string> = {
    students: t("nav.students"),
    staff: t("nav.staff"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("trash.title")}
        description={t("trash.description")}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-20 animate-pulse" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title={t("trash.empty")}
          description={t("trash.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {entityTypeLabels[record.entity_type] || record.entity_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("trash.deletedAt")}: {new Date(record.deleted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreMutation.mutate(record)}
                    disabled={restoreMutation.isPending}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(t("trash.confirmDelete"))) {
                        deleteMutation.mutate(record.id);
                      }
                    }}
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
