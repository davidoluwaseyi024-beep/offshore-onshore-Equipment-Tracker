export type EquipmentStatus = "active" | "in_repair" | "maintenance_due" | "missing" | "retired";
export type EquipmentCondition = "excellent" | "good" | "fair" | "poor" | "";

export interface EquipmentListItem {
  id: number;
  name: string;
  serial_number: string;
  qr_code: string | null;
  category: number;
  category_name: string;
  site: number;
  site_name: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  assigned_to: number | null;
  assigned_to_name: string | null;
  last_action_type: string;
  last_action_at: string | null;
  updated_at: string;
}

export interface EquipmentDetail extends EquipmentListItem {
  manufacturer: string;
  model_number: string;
  purchase_date: string | null;
  purchase_cost: string | null;
  warranty_expiry: string | null;
  photo: string | null;
  notes: string;
  created_by: number | null;
  created_by_name: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
  last_action_by: number | null;
  last_action_by_name: string | null;
  created_at: string;
}

export interface EquipmentWritePayload {
  name: string;
  serial_number: string;
  qr_code?: string | null;
  category: number;
  site: number;
  condition?: EquipmentCondition;
  manufacturer?: string;
  model_number?: string;
  purchase_date?: string | null;
  purchase_cost?: string | null;
  warranty_expiry?: string | null;
  notes?: string;
}
