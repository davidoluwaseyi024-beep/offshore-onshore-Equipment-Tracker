import clsx from "clsx";

interface StatTileProps {
  label: string;
  value: string | number;
  tone?: "default" | "critical" | "good";
  icon?: string;
}

export function StatTile({ label, value, tone = "default", icon }: StatTileProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && <span className="text-xl" aria-hidden>{icon}</span>}
      </div>
      <p
        className={clsx(
          "mt-2 text-3xl font-semibold tabular-nums",
          tone === "critical" && "text-status-critical",
          tone === "good" && "text-status-good",
          tone === "default" && "text-brand-950",
        )}
      >
        {value}
      </p>
    </div>
  );
}
