import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { titleCase } from "../../utils/formatters";

// Fixed status → color mapping, matching Badge.tsx and the validated
// dataviz status palette. Order is stable (never re-derived from data)
// so a given status always reads as the same color across the app.
const STATUS_ORDER: { key: string; color: string }[] = [
  { key: "active", color: "#0ca30c" },
  { key: "maintenance_due", color: "#fab219" },
  { key: "in_repair", color: "#ec835a" },
  { key: "missing", color: "#d03b3b" },
  { key: "retired", color: "#7c8a9a" },
];

export function StatusChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((sum, n) => sum + n, 0);
  const chartData = STATUS_ORDER.map(({ key, color }) => ({
    name: titleCase(key),
    value: data[key] ?? 0,
    color,
  })).filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No equipment recorded yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="mx-auto h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              // paddingAngle inserts a gap at the single wraparound seam when
              // there's only one non-zero slice, which Recharts renders as a
              // broken arc instead of a full ring — only pad with 2+ slices.
              paddingAngle={chartData.length > 1 ? 2 : 0}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="#fcfcfb" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const num = typeof value === "number" ? value : Number(value ?? 0);
                return [`${num} (${((num / total) * 100).toFixed(0)}%)`, name];
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e1e0d9" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
              {entry.name}
            </span>
            <span className="font-medium text-slate-900">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
