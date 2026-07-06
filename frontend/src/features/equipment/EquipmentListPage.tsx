import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useEquipmentList } from "../../hooks/useEquipment";
import { useAuth } from "../../context/AuthContext";
import { canWriteEquipment } from "../../utils/permissions";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import type { EquipmentQuery } from "../../api/equipment";
import { EquipmentFilters } from "./EquipmentFilters";
import { EquipmentTable } from "./EquipmentTable";

export function EquipmentListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState<EquipmentQuery>({ page: 1, page_size: 25, ordering: "-updated_at" });
  const { data, isLoading } = useEquipmentList(query);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">Equipment</h1>
          <p className="text-sm text-slate-500">Track and manage your fleet.</p>
        </div>
        {user && canWriteEquipment(user.role) && (
          <Button onClick={() => navigate("/equipment/new")}>+ Add Equipment</Button>
        )}
      </div>

      <EquipmentFilters query={query} onChange={setQuery} />

      <EquipmentTable items={data?.results ?? []} isLoading={isLoading} />

      {data && (
        <Pagination
          page={query.page ?? 1}
          totalPages={data.total_pages}
          count={data.count}
          pageSize={data.page_size}
          onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
        />
      )}
    </div>
  );
}
