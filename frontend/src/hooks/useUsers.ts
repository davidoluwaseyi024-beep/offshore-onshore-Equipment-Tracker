import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as usersApi from "../api/users";
import type { Role, User } from "../types/user";

const KEY = "users";

export function useUsersList(params: { search?: string; role?: string; page?: number }) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => usersApi.listUsers(params),
    placeholderData: (prev) => prev,
  });
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: usersApi.listRoles, staleTime: Infinity });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      email: string;
      username: string;
      password: string;
      role: Role;
      first_name?: string;
      last_name?: string;
    }) => usersApi.createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<User> }) => usersApi.updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
}
