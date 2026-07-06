import { Link } from "react-router-dom";

import type { AuditLogEntry } from "../../types/auditLog";
import { formatDateTime } from "../../utils/formatters";

export function RecentActivityFeed({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No recent activity.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-3 py-3 text-sm">
          <div>
            <p className="text-slate-700">
              <span className="font-medium text-slate-900">{entry.actor_name ?? "System"}</span>{" "}
              {entry.action_display.toLowerCase()} <span className="text-slate-500">{entry.object_repr}</span>
            </p>
            <p className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</p>
          </div>
        </li>
      ))}
      <li className="pt-3 text-right">
        <Link to="/audit" className="text-xs font-medium text-brand-700 hover:underline">
          View full activity log →
        </Link>
      </li>
    </ul>
  );
}
