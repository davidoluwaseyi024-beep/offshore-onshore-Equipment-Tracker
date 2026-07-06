import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/common";
import type { AuditLogEntry } from "../types/auditLog";

export interface AuditLogQuery {
  page?: number;
  actor?: number;
  action?: string;
  content_type?: string;
  created_after?: string;
  created_before?: string;
  search?: string;
}

export async function listAuditLog(params: AuditLogQuery = {}) {
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>("/audit-log/", { params });
  return data;
}
