import { useState } from "react";

import { useCompleteMaintenance, useMaintenanceList } from "../../hooks/useMaintenance";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../components/ui/Table";
import { MaintenanceStatusBadge, OverdueBadge } from "../../components/ui/Badge";
import { formatDate, titleCase } from "../../utils/formatters";
import { useToast } from "../../components/ui/Toast";
import { MaintenanceForm } from "./MaintenanceForm";

export function MaintenanceListPage() {
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useMaintenanceList({ page, status: status || undefined, ordering: "-scheduled_date" });
  const completeMutation = useCompleteMaintenance();

  const handleComplete = async (id: number) => {
    try {
      await completeMutation.mutateAsync({ id });
      notify("Marked as completed.", "success");
    } catch {
      notify("Failed to complete record.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Maintenance</h1>
          <p className="text-sm text-slate-500">Scheduled and completed maintenance records.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Schedule Maintenance</Button>
      </div>

      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-xs">
        <option value="">All statuses</option>
        <option value="scheduled">Scheduled</option>
        <option value="in_progress">In progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Equipment</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Scheduled</TableHeaderCell>
            <TableHeaderCell>Next Due</TableHeaderCell>
            <TableHeaderCell>Performed By</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {isLoading && <EmptyState message="Loading…" colSpan={7} />}
          {!isLoading && data?.results.length === 0 && <EmptyState message="No maintenance records found." colSpan={7} />}
          {!isLoading &&
            data?.results.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium text-slate-900">{record.equipment_name}</TableCell>
                <TableCell>{titleCase(record.maintenance_type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MaintenanceStatusBadge status={record.status} />
                    {record.is_overdue && <OverdueBadge />}
                  </div>
                </TableCell>
                <TableCell>{formatDate(record.scheduled_date)}</TableCell>
                <TableCell>{formatDate(record.next_due_date)}</TableCell>
                <TableCell>{record.performed_by_name ?? "—"}</TableCell>
                <TableCell>
                  {record.status !== "completed" && record.status !== "cancelled" && (
                    <Button variant="ghost" size="sm" onClick={() => handleComplete(record.id)}>
                      Mark Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {data && (
        <Pagination page={page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onPageChange={setPage} />
      )}

      <MaintenanceForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
