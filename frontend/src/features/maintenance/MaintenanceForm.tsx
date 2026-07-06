import { useState, type FormEvent } from "react";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { useCreateMaintenance } from "../../hooks/useMaintenance";
import { useEquipmentList } from "../../hooks/useEquipment";
import { useToast } from "../../components/ui/Toast";

export function MaintenanceForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = useToast();
  const createMutation = useCreateMaintenance();
  const { data: equipmentPage } = useEquipmentList({ page_size: 200 });

  const [form, setForm] = useState({
    equipment: "",
    maintenance_type: "preventive",
    scheduled_date: "",
    next_due_date: "",
    description: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        equipment: Number(form.equipment),
        maintenance_type: form.maintenance_type as "preventive" | "corrective" | "inspection",
        scheduled_date: form.scheduled_date,
        next_due_date: form.next_due_date || null,
        description: form.description,
      });
      notify("Maintenance scheduled.", "success");
      onClose();
      setForm({ equipment: "", maintenance_type: "preventive", scheduled_date: "", next_due_date: "", description: "" });
    } catch {
      notify("Failed to schedule maintenance.", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule Maintenance">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Equipment"
          required
          value={form.equipment}
          onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
        >
          <option value="">Select equipment…</option>
          {equipmentPage?.results.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} ({eq.serial_number})
            </option>
          ))}
        </Select>
        <Select
          label="Type"
          value={form.maintenance_type}
          onChange={(e) => setForm((f) => ({ ...f, maintenance_type: e.target.value }))}
        >
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
          <option value="inspection">Inspection</option>
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Scheduled Date"
            type="date"
            required
            value={form.scheduled_date}
            onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
          />
          <Input
            label="Next Due Date"
            type="date"
            value={form.next_due_date}
            onChange={(e) => setForm((f) => ({ ...f, next_due_date: e.target.value }))}
          />
        </div>
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving…" : "Schedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
