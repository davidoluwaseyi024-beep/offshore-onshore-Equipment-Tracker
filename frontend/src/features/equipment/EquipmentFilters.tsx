import { useAllCategories, useAllSites } from "../../hooks/useLookups";
import { Input, Select } from "../../components/ui/Input";
import type { EquipmentQuery } from "../../api/equipment";

interface EquipmentFiltersProps {
  query: EquipmentQuery;
  onChange: (query: EquipmentQuery) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "in_repair", label: "In repair" },
  { value: "maintenance_due", label: "Maintenance due" },
  { value: "missing", label: "Missing" },
  { value: "retired", label: "Retired" },
];

export function EquipmentFilters({ query, onChange }: EquipmentFiltersProps) {
  const { data: sites } = useAllSites();
  const { data: categories } = useAllCategories();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Input
        placeholder="Search name, serial, QR…"
        value={query.search ?? ""}
        onChange={(e) => onChange({ ...query, search: e.target.value, page: 1 })}
      />
      <Select
        value={query.status ?? ""}
        onChange={(e) => onChange({ ...query, status: e.target.value || undefined, page: 1 })}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      <Select
        value={query.site ?? ""}
        onChange={(e) => onChange({ ...query, site: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
      >
        <option value="">All sites</option>
        {sites?.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </Select>
      <Select
        value={query.category ?? ""}
        onChange={(e) =>
          onChange({ ...query, category: e.target.value ? Number(e.target.value) : undefined, page: 1 })
        }
      >
        <option value="">All categories</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
