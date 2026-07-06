import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as categoriesApi from "../api/categories";
import type { CategoryWritePayload } from "../api/categories";

const KEY = "categories";

export function useCategoriesList(params: { search?: string; page?: number }) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => categoriesApi.listCategories(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryWritePayload) => categoriesApi.createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoryWritePayload> }) =>
      categoriesApi.updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
