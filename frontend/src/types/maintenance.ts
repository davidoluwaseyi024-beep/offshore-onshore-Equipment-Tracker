export type MaintenanceType = "preventive" | "corrective" | "inspection";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface MaintenanceRecord {
  id: number;
  equipment: number;
  equipment_name: string;
  maintenance_type: MaintenanceType;
  status: MaintenanceStatus;
  scheduled_date: string;
  completed_date: string | null;
  performed_by: number | null;
  performed_by_name: string | null;
  cost: string | null;
  description: string;
  next_due_date: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}
