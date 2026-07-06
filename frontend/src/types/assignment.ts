export interface Assignment {
  id: number;
  equipment: number;
  equipment_name: string;
  assigned_to: number;
  assigned_to_name: string;
  assigned_by: number | null;
  site: number | null;
  site_name: string | null;
  assigned_at: string;
  expected_return_at: string | null;
  returned_at: string | null;
  is_active: boolean;
  notes: string;
  created_at: string;
}
