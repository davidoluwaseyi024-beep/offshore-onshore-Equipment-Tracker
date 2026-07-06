import { useState, type FormEvent } from "react";

import { useAssignmentList, useCreateAssignment, useReturnAssignment } from "../../hooks/useAssignments";
import { useAllUsers } from "../../hooks/useLookups";
import { useAuth } from "../../context/AuthContext";
import { canManageAssignments } from "../../utils/permissions";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { formatDateTime } from "../../utils/formatters";

export function AssignmentPanel({ equipmentId }: { equipmentId: number }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const { data: activeAssignments } = useAssignmentList({ equipment: equipmentId, active: true });
  const { data: users } = useAllUsers();
  const createAssignment = useCreateAssignment();
  const returnAssignment = useReturnAssignment();

  const active = activeAssignments?.results[0];
  const canManage = user && canManageAssignments(user.role);

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await createAssignment.mutateAsync({
        equipment: equipmentId,
        assigned_to: Number(selectedUser),
        assigned_at: new Date().toISOString(),
      });
      notify("Equipment assigned.", "success");
      setAssignOpen(false);
      setSelectedUser("");
    } catch {
      notify("Could not assign — equipment may already be assigned.", "error");
    }
  };

  const handleReturn = async () => {
    if (!active) return;
    try {
      await returnAssignment.mutateAsync({ id: active.id });
      notify("Equipment returned.", "success");
    } catch {
      notify("Could not process return.", "error");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Assignment</h2>
      {active ? (
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium text-slate-900">{active.assigned_to_name}</p>
            <p className="text-xs text-slate-400">Since {formatDateTime(active.assigned_at)}</p>
          </div>
          {canManage && (
            <Button variant="ghost" size="sm" onClick={handleReturn} disabled={returnAssignment.isPending}>
              Return
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Not currently assigned.</p>
          {canManage && (
            <Button variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
              Assign
            </Button>
          )}
        </div>
      )}

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Equipment">
        <form onSubmit={handleAssign} className="flex flex-col gap-4">
          <Select label="Assign To" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
            <option value="">Select user…</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name ? `${u.first_name} ${u.last_name}` : u.email} ({u.role})
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAssignment.isPending}>
              {createAssignment.isPending ? "Assigning…" : "Assign"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
