import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as equipmentApi from "../api/equipment";
import type { EquipmentQuery } from "../api/equipment";
import type { EquipmentStatus, EquipmentWritePayload } from "../types/equipment";

const KEY = "equipment";

export function useEquipmentList(query: EquipmentQuery) {
  return useQuery({
    queryKey: [KEY, "list", query],
    queryFn: () => equipmentApi.listEquipment(query),
    placeholderData: (prev) => prev,
  });
}

export function useEquipmentDetail(id: number | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => equipmentApi.getEquipment(id as number),
    enabled: !!id,
  });
}

export function useEquipmentAuditLog(id: number | undefined, page: number) {
  return useQuery({
    queryKey: [KEY, "audit-log", id, page],
    queryFn: () => equipmentApi.getEquipmentAuditLog(id as number, page),
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EquipmentWritePayload) => equipmentApi.createEquipment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateEquipment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EquipmentWritePayload>) => equipmentApi.updateEquipment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentApi.deleteEquipment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRestoreEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentApi.restoreEquipment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeEquipmentStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, note }: { status: EquipmentStatus; note?: string }) =>
      equipmentApi.changeEquipmentStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
