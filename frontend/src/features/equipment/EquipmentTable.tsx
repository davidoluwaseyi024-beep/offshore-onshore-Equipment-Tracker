import { useNavigate } from "react-router-dom";

import { EmptyState, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../components/ui/Table";
import { EquipmentStatusBadge } from "../../components/ui/Badge";
import { formatDateTime, titleCase } from "../../utils/formatters";
import type { EquipmentListItem } from "../../types/equipment";

export function EquipmentTable({ items, isLoading }: { items: EquipmentListItem[]; isLoading: boolean }) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Serial No.</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Site</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Assigned To</TableHeaderCell>
          <TableHeaderCell>Last Action</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {isLoading && <EmptyState message="Loading equipment…" colSpan={7} />}
        {!isLoading && items.length === 0 && <EmptyState message="No equipment matches these filters." colSpan={7} />}
        {!isLoading &&
          items.map((item) => (
            <TableRow key={item.id} onClick={() => navigate(`/equipment/${item.id}`)}>
              <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
              <TableCell className="font-mono text-xs">{item.serial_number}</TableCell>
              <TableCell>
                <EquipmentStatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.site_name}</TableCell>
              <TableCell>{item.category_name}</TableCell>
              <TableCell>{item.assigned_to_name ?? "—"}</TableCell>
              <TableCell>
                <div className="text-xs text-slate-500">
                  {item.last_action_type ? titleCase(item.last_action_type) : "—"}
                  <br />
                  {formatDateTime(item.last_action_at)}
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
