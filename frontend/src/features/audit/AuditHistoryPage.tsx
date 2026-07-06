import { useState } from "react";

import { useAuditLog } from "../../hooks/useAuditLog";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../components/ui/Table";
import { formatDateTime } from "../../utils/formatters";

export function AuditHistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAuditLog({ page, search: search || undefined });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Activity Log</h1>
        <p className="text-sm text-slate-500">Full, immutable audit trail across the system.</p>
      </div>

      <Input
        placeholder="Search by resource…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-xs"
      />

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Timestamp</TableHeaderCell>
            <TableHeaderCell>Actor</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>Resource</TableHeaderCell>
            <TableHeaderCell>Details</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {isLoading && <EmptyState message="Loading…" colSpan={5} />}
          {!isLoading && data?.results.length === 0 && <EmptyState message="No activity recorded." colSpan={5} />}
          {!isLoading &&
            data?.results.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                <TableCell className="font-medium text-slate-900">{entry.actor_name ?? "System"}</TableCell>
                <TableCell>{entry.action_display}</TableCell>
                <TableCell>
                  {entry.content_type}: {entry.object_repr}
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-slate-500">
                  {Object.keys(entry.changes).length > 0 ? JSON.stringify(entry.changes) : "—"}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {data && (
        <Pagination page={page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onPageChange={setPage} />
      )}
    </div>
  );
}
