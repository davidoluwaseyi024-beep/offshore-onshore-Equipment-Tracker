import { motion } from "framer-motion";

import { useDashboardSummary } from "../../hooks/useReports";
import { useAuth } from "../../context/AuthContext";
import { canViewGlobalAuditLog } from "../../utils/permissions";
import { StatTile } from "./StatTile";
import { StatusChart } from "./StatusChart";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { ReportShortcuts } from "./ReportShortcuts";

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardSummary();

  if (isLoading || !data) {
    return <div className="py-20 text-center text-slate-400">Loading dashboard…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Dashboard</h1>
        <p className="text-sm text-slate-500">Fleet overview and recent activity.</p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <motion.div variants={cardVariants}>
          <StatTile label="Total Equipment" value={data.total_equipment} icon="🛠️" />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatTile
            label="Overdue Maintenance"
            value={data.overdue_maintenance_count}
            tone={data.overdue_maintenance_count > 0 ? "critical" : "good"}
            icon="⏰"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <StatTile label="Active (In Service)" value={data.equipment_by_status.active ?? 0} tone="good" icon="✅" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Equipment by Status</h2>
          <StatusChart data={data.equipment_by_status} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Report Shortcuts</h2>
          <ReportShortcuts shortcuts={data.report_shortcuts} />
        </div>
      </div>

      {user && canViewGlobalAuditLog(user.role) && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Recent Activity</h2>
          <RecentActivityFeed entries={data.recent_activity} />
        </div>
      )}
    </div>
  );
}
