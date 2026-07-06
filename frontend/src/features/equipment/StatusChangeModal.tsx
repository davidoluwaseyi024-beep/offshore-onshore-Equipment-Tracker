import { useState, type FormEvent } from "react";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Select, Textarea } from "../../components/ui/Input";
import { useChangeEquipmentStatus } from "../../hooks/useEquipment";
import { useToast } from "../../components/ui/Toast";
import type { EquipmentStatus } from "../../types/equipment";

const STATUS_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "in_repair", label: "In repair" },
  { value: "maintenance_due", label: "Maintenance due" },
  { value: "missing", label: "Missing" },
  { value: "retired", label: "Retired" },
];

export function StatusChangeModal({
  equipmentId,
  currentStatus,
  open,
  onClose,
}: {
  equipmentId: number;
  currentStatus: EquipmentStatus;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<EquipmentStatus>(currentStatus);
  const [note, setNote] = useState("");
  const mutation = useChangeEquipmentStatus(equipmentId);
  const { notify } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ status, note });
      notify("Status updated.", "success");
      onClose();
    } catch {
      notify("Failed to update status.", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Equipment Status">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="New Status" value={status} onChange={(e) => setStatus(e.target.value as EquipmentStatus)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Textarea
          label="Note (optional)"
          rows={3}
          placeholder={status === "missing" ? "e.g. Not found during shift audit" : "Reason for this change"}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Update Status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
