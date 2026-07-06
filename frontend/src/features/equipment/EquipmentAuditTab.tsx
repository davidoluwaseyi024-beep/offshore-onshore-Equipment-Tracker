import { useState } from "react";

import { useEquipmentAuditLog } from "../../hooks/useEquipment";
import { Pagination } from "../../components/ui/Pagination";
import { formatDateTime } from "../../utils/formatters";

export function EquipmentAuditTab({ equipmentId }: { equipmentId: number }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEquipmentAuditLog(equipmentId, page);

  if (isLoading) return <p className="py-6 text-center text-sm text-slate-400">Loading history…</p>;
  if (!data || data.results.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No activity recorded for this item yet.</p>;
  }

  return (
    <div>
      <ol className="relative flex flex-col gap-0 border-l border-slate-200 pl-5">
        {data.results.map((entry) => (
          <li key={entry.id} className="relative pb-5">
            <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">{entry.action_display}</span>
              {" — by "}
              <span className="font-medium">{entry.actor_name ?? "System"}</span>
            </p>
            <p className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</p>
            {entry.changes && Object.keys(entry.changes).length > 0 && (
              <pre className="mt-1 max-w-full overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                {JSON.stringify(entry.changes, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ol>
      <Pagination
        page={page}
        totalPages={data.total_pages}
        count={data.count}
        pageSize={data.page_size}
        onPageChange={setPage}
      />
    </div>
  );
}
