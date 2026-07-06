import { useState } from "react";

import { useDeactivateUser, useUsersList } from "../../hooks/useUsers";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { RoleBadge } from "../../components/ui/Badge";
import { EmptyState, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { UserFormModal } from "./UserFormModal";

export function UsersListPage() {
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading } = useUsersList({ search });
  const deactivateMutation = useDeactivateUser();

  const handleDeactivate = async (id: number, email: string) => {
    if (!confirm(`Deactivate ${email}?`)) return;
    try {
      await deactivateMutation.mutateAsync(id);
      notify("User deactivated.", "success");
    } catch {
      notify("Failed to deactivate user.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Users &amp; Roles</h1>
          <p className="text-sm text-slate-500">Manage team access and permissions.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>+ Add User</Button>
      </div>

      <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {isLoading && <EmptyState message="Loading…" colSpan={5} />}
          {!isLoading && data?.results.length === 0 && <EmptyState message="No users found." colSpan={5} />}
          {!isLoading &&
            data?.results.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-slate-900">
                  {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : "—"}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <RoleBadge role={u.role} />
                </TableCell>
                <TableCell>{u.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  {u.is_active && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeactivate(u.id, u.email)}>
                      Deactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
