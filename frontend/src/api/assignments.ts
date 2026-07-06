import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/common";
import type { Assignment } from "../types/assignment";

export interface AssignmentQuery {
  page?: number;
  equipment?: number;
  assigned_to?: number;
  active?: boolean;
}

export async function listAssignments(params: AssignmentQuery = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Assignment>>("/assignments/", { params });
  return data;
}

export async function createAssignment(payload: {
  equipment: number;
  assigned_to: number;
  assigned_at: string;
  site?: number;
  expected_return_at?: string;
  notes?: string;
}) {
  const { data } = await apiClient.post<Assignment>("/assignments/", payload);
  return data;
}

export async function returnAssignment(id: number, notes?: string) {
  const { data } = await apiClient.post<Assignment>(`/assignments/${id}/return/`, { notes });
  return data;
}
