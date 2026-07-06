export type Role = "admin" | "engineer" | "technician";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone_number: string;
  is_active?: boolean;
  date_joined?: string;
}
