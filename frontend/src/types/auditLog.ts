export interface AuditLogEntry {
  id: number;
  actor: number | null;
  actor_email: string | null;
  actor_name: string | null;
  action: string;
  action_display: string;
  content_type: string;
  object_id: string;
  object_repr: string;
  changes: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}
