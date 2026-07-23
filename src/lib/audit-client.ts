/**
 * Client-side audit logging helper
 * Logs critical actions to the audit endpoint without blocking the UI
 */

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "fee_payment"
  | "fee_waiver"
  | "attendance_mark"
  | "exam_create"
  | "marks_entry"
  | "report_card_generate"
  | "data_export"
  | "settings_change"
  | "staff_invite"
  | "expense_add";

export async function logAuditEvent(
  action: AuditAction,
  options: {
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        entity_type: options.entityType,
        entity_id: options.entityId,
        metadata: options.metadata,
      }),
    });
  } catch {
    // Audit logging should never block the UI
  }
}
