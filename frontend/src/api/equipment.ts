import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/common";
import type { EquipmentDetail, EquipmentListItem, EquipmentStatus, EquipmentWritePayload } from "../types/equipment";
import type { AuditLogEntry } from "../types/auditLog";

export interface EquipmentQuery {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  site?: number;
  category?: number;
  assigned_to?: number;
  ordering?: string;
}

export async function listEquipment(params: EquipmentQuery = {}) {
  const { data } = await apiClient.get<PaginatedResponse<EquipmentListItem>>("/equipment/", { params });
  return data;
}

export async function getEquipment(id: number) {
  const { data } = await apiClient.get<EquipmentDetail>(`/equipment/${id}/`);
  return data;
}

export async function createEquipment(payload: EquipmentWritePayload) {
  const { data } = await apiClient.post<EquipmentDetail>("/equipment/", payload);
  return data;
}

export async function updateEquipment(id: number, payload: Partial<EquipmentWritePayload>) {
  const { data } = await apiClient.patch<EquipmentDetail>(`/equipment/${id}/`, payload);
  return data;
}

export async function deleteEquipment(id: number) {
  await apiClient.delete(`/equipment/${id}/`);
}

export async function restoreEquipment(id: number) {
  const { data } = await apiClient.post<EquipmentDetail>(`/equipment/${id}/restore/`);
  return data;
}

export async function changeEquipmentStatus(id: number, status: EquipmentStatus, note?: string) {
  const { data } = await apiClient.post<EquipmentDetail>(`/equipment/${id}/status/`, { status, note });
  return data;
}

export async function getEquipmentAuditLog(id: number, page = 1) {
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(`/equipment/${id}/audit-log/`, {
    params: { page },
  });
  return data;
}
