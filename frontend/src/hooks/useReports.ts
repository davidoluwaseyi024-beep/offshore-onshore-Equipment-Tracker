import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as reportsApi from "../api/reports";
import type { ReportFormat, ReportPeriod, ReportType } from "../types/report";

export function useReportsList(page: number) {
  return useQuery({
    queryKey: ["reports", "list", page],
    queryFn: () => reportsApi.listReports(page),
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: reportsApi.fetchDashboardSummary,
    refetchInterval: 60_000,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      report_type: ReportType;
      format: ReportFormat;
      period: ReportPeriod;
      date_from?: string;
      date_to?: string;
    }) => reportsApi.generateReport(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });
}
