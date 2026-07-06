import { useNavigate } from "react-router-dom";

import type { ReportType } from "../../types/report";

export function ReportShortcuts({ shortcuts }: { shortcuts: { value: ReportType; label: string }[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.value}
          onClick={() => navigate("/reports", { state: { reportType: shortcut.value } })}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-accent-500 hover:bg-accent-50"
        >
          {shortcut.label}
          <span aria-hidden className="text-slate-400">→</span>
        </button>
      ))}
    </div>
  );
}
