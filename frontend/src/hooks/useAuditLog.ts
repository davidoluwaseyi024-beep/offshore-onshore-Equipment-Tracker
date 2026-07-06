import { useQuery } from "@tanstack/react-query";

import * as auditApi from "../api/audit";
import type { AuditLogQuery } from "../api/audit";

export function useAuditLog(query: AuditLogQuery) {
  return useQuery({
    queryKey: ["audit-log", query],
    queryFn: () => auditApi.listAuditLog(query),
    placeholderData: (prev) => prev,
  });
}
