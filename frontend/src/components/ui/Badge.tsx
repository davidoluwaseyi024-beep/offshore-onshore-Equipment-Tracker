import clsx from "clsx";
import type { EquipmentStatus } from "../../types/equipment";
import type { MaintenanceStatus } from "../../types/maintenance";
import { titleCase } from "../../utils/formatters";

// Status color mapping — reserved status roles (good/warning/serious/critical/
// neutral) from the validated dataviz palette, never reused as generic series
// colors. Each badge pairs the color with a visible label, never color alone.
const EQUIPMENT_STATUS_STYLE: Record<EquipmentStatus, string> = {
  active: "bg-status-good/10 text-status-good ring-status-good/30",
  in_repair: "bg-status-serious/10 text-status-serious ring-status-serious/30",
  maintenance_due: "bg-status-warning/15 text-amber-700 ring-status-warning/40",
  missing: "bg-status-critical/10 text-status-critical ring-status-critical/30",
  retired: "bg-status-neutral/10 text-status-neutral ring-status-neutral/30",
};

const MAINTENANCE_STATUS_STYLE: Record<MaintenanceStatus, string> = {
  scheduled: "bg-slate-100 text-slate-700 ring-slate-300",
  in_progress: "bg-status-warning/15 text-amber-700 ring-status-warning/40",
  completed: "bg-status-good/10 text-status-good ring-status-good/30",
  cancelled: "bg-status-neutral/10 text-status-neutral ring-status-neutral/30",
};

function BaseBadge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return <BaseBadge className={EQUIPMENT_STATUS_STYLE[status]}>{titleCase(status)}</BaseBadge>;
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  return <BaseBadge className={MAINTENANCE_STATUS_STYLE[status]}>{titleCase(status)}</BaseBadge>;
}

export function OverdueBadge() {
  return (
    <BaseBadge className="bg-status-critical/10 text-status-critical ring-status-critical/30">Overdue</BaseBadge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-brand-900/10 text-brand-900 ring-brand-900/30",
    engineer: "bg-brand-500/10 text-brand-700 ring-brand-500/30",
    technician: "bg-slate-100 text-slate-700 ring-slate-300",
  };
  return <BaseBadge className={styles[role] ?? styles.technician}>{titleCase(role)}</BaseBadge>;
}
