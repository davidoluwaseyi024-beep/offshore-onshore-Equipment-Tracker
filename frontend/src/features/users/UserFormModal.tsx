import { useState, type FormEvent } from "react";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { useCreateUser } from "../../hooks/useUsers";
import { useToast } from "../../components/ui/Toast";
import type { Role } from "../../types/user";

export function UserFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notify } = useToast();
  const createMutation = useCreateUser();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "technician" as Role,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      notify("User created.", "success");
      onClose();
      setForm({ email: "", username: "", password: "", first_name: "", last_name: "", role: "technician" });
    } catch {
      notify("Failed to create user.", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add User">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          />
          <Input
            label="Last Name"
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <Input
          label="Username"
          required
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        />
        <Input
          label="Temporary Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <Select label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
          <option value="admin">Admin</option>
          <option value="engineer">Engineer</option>
          <option value="technician">Technician</option>
        </Select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
