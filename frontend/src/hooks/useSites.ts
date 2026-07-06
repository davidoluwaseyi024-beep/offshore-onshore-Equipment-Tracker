import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as sitesApi from "../api/sites";
import type { SiteWritePayload } from "../api/sites";

const KEY = "sites";

export function useSitesList(params: { search?: string; page?: number }) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => sitesApi.listSites(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SiteWritePayload) => sitesApi.createSite(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<SiteWritePayload> }) => sitesApi.updateSite(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sitesApi.deleteSite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
