export type ReportType = "equipment_summary" | "maintenance_history" | "assignment_history" | "full_history";
export type ReportPeriod = "weekly" | "monthly" | "full_history" | "custom";
export type ReportFormat = "pdf" | "csv";
export type ReportStatus = "pending" | "processing" | "completed" | "failed";

export interface ReportExport {
  id: number;
  report_type: ReportType;
  period: ReportPeriod;
  date_from: string | null;
  date_to: string | null;
  format: ReportFormat;
  status: ReportStatus;
  filters: Record<string, unknown>;
  file_url: string | null;
  error_message: string;
  requested_by_name: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_equipment: number;
  equipment_by_status: Record<string, number>;
  overdue_maintenance_count: number;
  report_shortcuts: { value: ReportType; label: string }[];
  recent_activity: import("./auditLog").AuditLogEntry[];
}
