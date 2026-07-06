import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as maintenanceApi from "../api/maintenance";
import type { MaintenanceQuery } from "../api/maintenance";
import type { MaintenanceRecord } from "../types/maintenance";

const KEY = "maintenance";

export function useMaintenanceList(query: MaintenanceQuery) {
  return useQuery({
    queryKey: [KEY, "list", query],
    queryFn: () => maintenanceApi.listMaintenance(query),
    placeholderData: (prev) => prev,
  });
}

export function useOverdueMaintenance(page: number) {
  return useQuery({
    queryKey: [KEY, "overdue", page],
    queryFn: () => maintenanceApi.listOverdueMaintenance(page),
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MaintenanceRecord>) => maintenanceApi.createMaintenance(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateMaintenance(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MaintenanceRecord>) => maintenanceApi.updateMaintenance(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes, cost }: { id: number; notes?: string; cost?: string }) =>
      maintenanceApi.completeMaintenance(id, notes, cost),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => maintenanceApi.deleteMaintenance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
