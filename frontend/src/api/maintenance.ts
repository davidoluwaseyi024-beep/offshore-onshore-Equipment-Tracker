import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/common";
import type { MaintenanceRecord } from "../types/maintenance";

export interface MaintenanceQuery {
  page?: number;
  equipment?: number;
  status?: string;
  maintenance_type?: string;
  search?: string;
  ordering?: string;
}

export async function listMaintenance(params: MaintenanceQuery = {}) {
  const { data } = await apiClient.get<PaginatedResponse<MaintenanceRecord>>("/maintenance/", { params });
  return data;
}

export async function listOverdueMaintenance(page = 1) {
  const { data } = await apiClient.get<PaginatedResponse<MaintenanceRecord>>("/maintenance/overdue/", {
    params: { page },
  });
  return data;
}

export async function createMaintenance(payload: Partial<MaintenanceRecord>) {
  const { data } = await apiClient.post<MaintenanceRecord>("/maintenance/", payload);
  return data;
}

export async function updateMaintenance(id: number, payload: Partial<MaintenanceRecord>) {
  const { data } = await apiClient.patch<MaintenanceRecord>(`/maintenance/${id}/`, payload);
  return data;
}

export async function completeMaintenance(id: number, notes?: string, cost?: string) {
  const { data } = await apiClient.post<MaintenanceRecord>(`/maintenance/${id}/complete/`, { notes, cost });
  return data;
}

export async function deleteMaintenance(id: number) {
  await apiClient.delete(`/maintenance/${id}/`);
}
