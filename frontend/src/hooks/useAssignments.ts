import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as assignmentsApi from "../api/assignments";
import type { AssignmentQuery } from "../api/assignments";

const KEY = "assignments";

export function useAssignmentList(query: AssignmentQuery) {
  return useQuery({
    queryKey: [KEY, "list", query],
    queryFn: () => assignmentsApi.listAssignments(query),
    placeholderData: (prev) => prev,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentsApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useReturnAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => assignmentsApi.returnAssignment(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}
