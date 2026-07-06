import { apiClient } from "./client";
import type { PaginatedResponse } from "../types/common";
import type { DashboardSummary, ReportExport, ReportFormat, ReportPeriod, ReportType } from "../types/report";

export async function listReports(page = 1) {
  const { data } = await apiClient.get<PaginatedResponse<ReportExport>>("/reports/", { params: { page } });
  return data;
}

export async function generateReport(payload: {
  report_type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  date_from?: string;
  date_to?: string;
  filters?: Record<string, unknown>;
}) {
  const { data } = await apiClient.post<ReportExport>("/reports/generate/", payload);
  return data;
}

export async function downloadReport(id: number, suggestedFilename: string) {
  // Authenticated download: the endpoint requires a Bearer token, so a plain
  // <a href> can't be used directly — fetch as a blob and trigger the
  // browser's save dialog via an object URL.
  const response = await apiClient.get(`/reports/${id}/download/`, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = suggestedFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function fetchDashboardSummary() {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary/");
  return data;
}
