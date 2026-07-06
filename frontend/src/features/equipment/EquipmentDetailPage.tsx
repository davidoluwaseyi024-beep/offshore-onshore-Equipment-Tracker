import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useDeleteEquipment, useEquipmentDetail } from "../../hooks/useEquipment";
import { useMaintenanceList } from "../../hooks/useMaintenance";
import { useAuth } from "../../context/AuthContext";
import { canDeleteEquipment, canWriteEquipment } from "../../utils/permissions";
import { Button } from "../../components/ui/Button";
import { EquipmentStatusBadge, MaintenanceStatusBadge } from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";
import { formatCurrency, formatDate, formatDateTime, titleCase } from "../../utils/formatters";
import { StatusChangeModal } from "./StatusChangeModal";
import { EquipmentAuditTab } from "./EquipmentAuditTab";
import { AssignmentPanel } from "./AssignmentPanel";

type Tab = "overview" | "maintenance" | "history";

export function EquipmentDetailPage() {
  const { id } = useParams();
  const equipmentId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();

  const { data: equipment, isLoading } = useEquipmentDetail(equipmentId);
  const { data: maintenance } = useMaintenanceList({ equipment: equipmentId });
  const deleteMutation = useDeleteEquipment();

  const [tab, setTab] = useState<Tab>("overview");
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  if (isLoading || !equipment) {
    return <p className="py-20 text-center text-slate-400">Loading equipment…</p>;
  }

  const handleDelete = async () => {
    if (!confirm(`Remove ${equipment.name} from the active fleet?`)) return;
    try {
      await deleteMutation.mutateAsync(equipmentId);
      notify("Equipment removed.", "success");
      navigate("/equipment");
    } catch {
      notify("Failed to remove equipment.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-brand-950">{equipment.name}</h1>
            <EquipmentStatusBadge status={equipment.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-slate-500">{equipment.serial_number}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setStatusModalOpen(true)}>
            Change Status
          </Button>
          {user && canWriteEquipment(user.role) && (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/equipment/${equipmentId}/edit`)}>
              Edit
            </Button>
          )}
          {user && canDeleteEquipment(user.role) && (
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Accountability panel — who created/updated/last touched this record */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
        <AccountabilityField label="Created by" name={equipment.created_by_name} time={equipment.created_at} />
        <AccountabilityField label="Last updated by" name={equipment.updated_by_name} time={equipment.updated_at} />
        <AccountabilityField
          label="Last action"
          name={equipment.last_action_by_name}
          time={equipment.last_action_at}
          extra={equipment.last_action_type ? titleCase(equipment.last_action_type) : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex gap-1 border-b border-slate-200">
            {(["overview", "maintenance", "history"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  tab === t ? "border-b-2 border-accent-600 text-accent-700" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
              <Field label="Category" value={equipment.category_name} />
              <Field label="Site" value={equipment.site_name} />
              <Field label="Manufacturer" value={equipment.manufacturer || "—"} />
              <Field label="Model Number" value={equipment.model_number || "—"} />
              <Field label="Condition" value={equipment.condition ? titleCase(equipment.condition) : "—"} />
              <Field label="QR Code" value={equipment.qr_code ?? "—"} />
              <Field label="Purchase Date" value={formatDate(equipment.purchase_date)} />
              <Field label="Purchase Cost" value={formatCurrency(equipment.purchase_cost)} />
              <Field label="Warranty Expiry" value={formatDate(equipment.warranty_expiry)} />
              {equipment.notes && (
                <div className="col-span-2">
                  <p className="text-xs font-medium uppercase text-slate-400">Notes</p>
                  <p className="mt-1 text-slate-700">{equipment.notes}</p>
                </div>
              )}
            </div>
          )}

          {tab === "maintenance" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {maintenance?.results.length ? (
                <ul className="flex flex-col divide-y divide-slate-100">
                  {maintenance.results.map((record) => (
                    <li key={record.id} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{titleCase(record.maintenance_type)}</p>
                        <p className="text-xs text-slate-400">Scheduled {formatDate(record.scheduled_date)}</p>
                      </div>
                      <MaintenanceStatusBadge status={record.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">No maintenance records yet.</p>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <EquipmentAuditTab equipmentId={equipmentId} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <AssignmentPanel equipmentId={equipmentId} />
        </div>
      </div>

      <StatusChangeModal
        equipmentId={equipmentId}
        currentStatus={equipment.status}
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-slate-700">{value}</p>
    </div>
  );
}

function AccountabilityField({
  label,
  name,
  time,
  extra,
}: {
  label: string;
  name: string | null | undefined;
  time: string | null | undefined;
  extra?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{name ?? "—"}</p>
      <p className="text-xs text-slate-400">
        {extra && <span className="mr-1">{extra} ·</span>}
        {formatDateTime(time)}
      </p>
    </div>
  );
}
