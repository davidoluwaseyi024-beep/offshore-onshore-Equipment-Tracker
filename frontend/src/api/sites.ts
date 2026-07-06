import { apiClient } from "./client";
import type { PaginatedResponse, Site } from "../types/common";

export async function listSites(params: { search?: string; page?: number } = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Site>>("/sites/", { params });
  return data;
}

export async function listAllSites(): Promise<Site[]> {
  const { data } = await apiClient.get<PaginatedResponse<Site>>("/sites/", { params: { page_size: 200 } });
  return data.results;
}

export interface SiteWritePayload {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state_region?: string;
  country?: string;
  is_active?: boolean;
}

export async function createSite(payload: SiteWritePayload): Promise<Site> {
  const { data } = await apiClient.post<Site>("/sites/", payload);
  return data;
}

export async function updateSite(id: number, payload: Partial<SiteWritePayload>): Promise<Site> {
  const { data } = await apiClient.patch<Site>(`/sites/${id}/`, payload);
  return data;
}

export async function deleteSite(id: number): Promise<void> {
  await apiClient.delete(`/sites/${id}/`);
}
