import { useQuery } from "@tanstack/react-query";

import { listAllCategories } from "../api/categories";
import { listAllSites } from "../api/sites";
import { listAllUsers } from "../api/users";

export function useAllSites() {
  return useQuery({ queryKey: ["sites", "all"], queryFn: listAllSites, staleTime: 60_000 });
}

export function useAllCategories() {
  return useQuery({ queryKey: ["categories", "all"], queryFn: listAllCategories, staleTime: 60_000 });
}

export function useAllUsers() {
  return useQuery({ queryKey: ["users", "all"], queryFn: listAllUsers, staleTime: 60_000 });
}
