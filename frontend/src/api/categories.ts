import { apiClient } from "./client";
import type { Category, PaginatedResponse } from "../types/common";

export async function listCategories(params: { search?: string; page?: number } = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Category>>("/categories/", { params });
  return data;
}

export async function listAllCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<PaginatedResponse<Category>>("/categories/", { params: { page_size: 200 } });
  return data.results;
}

export interface CategoryWritePayload {
  name: string;
  parent?: number | null;
  description?: string;
}

export async function createCategory(payload: CategoryWritePayload): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories/", payload);
  return data;
}

export async function updateCategory(id: number, payload: Partial<CategoryWritePayload>): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}/`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}/`);
}
