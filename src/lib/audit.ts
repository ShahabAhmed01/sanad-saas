/**
 * Audit Logging Utility
 * Logs all critical actions for institutional accountability
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "password_change"
  | "role_change"
  | "fee_payment"
  | "fee_waiver"
  | "attendance_mark"
  | "exam_create"
  | "marks_entry"
  | "report_card_generate"
  | "data_export"
  | "settings_change";

interface AuditLogEntry {
  userId: string;
  schoolId: string;
  action: AuditAction;
  tableName?: string;
  recordId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createAdminClient();

    await supabase.from("audit_logs").insert({
      actor_user_id: entry.userId,
      school_id: entry.schoolId,
      action: entry.action,
      entity_type: entry.tableName || null,
      entity_id: entry.recordId || null,
      metadata: entry.oldValue || entry.newValue
        ? JSON.stringify({ old: entry.oldValue, new: entry.newValue })
        : null,
    });
  } catch (error) {
    // Audit logging should never crash the app
    console.error("Audit log failed:", error);
  }
}

/**
 * Get audit logs for a school
 */
export async function getAuditLogs(
  schoolId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    tableName?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  const supabase = createAdminClient();

  let query = supabase
    .from("audit_logs")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (options.action) {
    query = query.eq("action", options.action);
  }
  if (options.tableName) {
    query = query.eq("entity_type", options.tableName);
  }
  if (options.userId) {
    query = query.eq("actor_user_id", options.userId);
  }
  if (options.startDate) {
    query = query.gte("created_at", options.startDate);
  }
  if (options.endDate) {
    query = query.lte("created_at", options.endDate);
  }

  const { data, error } = await query
    .range(
      options.offset || 0,
      (options.offset || 0) + (options.limit || 50) - 1
    );

  if (error) throw error;
  return data;
}
