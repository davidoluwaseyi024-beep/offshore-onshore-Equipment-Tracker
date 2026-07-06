import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/common";
import type { Role, User } from "../types/user";

export async function listUsers(params: { search?: string; role?: string; page?: number } = {}) {
  const { data } = await apiClient.get<PaginatedResponse<User>>("/users/", { params });
  return data;
}

export async function listAllUsers(): Promise<User[]> {
  const { data } = await apiClient.get<PaginatedResponse<User>>("/users/", { params: { page_size: 200 } });
  return data.results;
}

export async function createUser(payload: {
  email: string;
  username: string;
  password: string;
  role: Role;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}) {
  const { data } = await apiClient.post<User>("/users/", payload);
  return data;
}

export async function updateUser(id: number, payload: Partial<User>) {
  const { data } = await apiClient.patch<User>(`/users/${id}/`, payload);
  return data;
}

export async function deactivateUser(id: number) {
  await apiClient.delete(`/users/${id}/`);
}

export async function listRoles() {
  const { data } = await apiClient.get<{ value: Role; label: string }[]>("/roles/");
  return data;
}
