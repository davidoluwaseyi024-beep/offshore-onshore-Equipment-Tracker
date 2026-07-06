import { useState } from "react";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import { useSitesList, useDeleteSite } from "../../hooks/useSites";
import { useCategoriesList, useDeleteCategory } from "../../hooks/useCategories";
import { SiteFormModal } from "./SiteFormModal";
import { CategoryFormModal } from "./CategoryFormModal";
import type { Site, Category } from "../../types/common";

type Tab = "sites" | "categories";

export function SitesCategoriesPage() {
  const [tab, setTab] = useState<Tab>("sites");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Sites &amp; Categories</h1>
        <p className="text-sm text-slate-500">Manage the equipment sites/locations and categories used across the fleet.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(["sites", "categories"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "border-b-2 border-accent-600 text-accent-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "sites" ? "Sites & Locations" : "Categories"}
          </button>
        ))}
      </div>

      {tab === "sites" ? <SitesPanel /> : <CategoriesPanel />}
    </div>
  );
}

function SitesPanel() {
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const { data, isLoading } = useSitesList({ search });
  const deleteMutation = useDeleteSite();

  const handleDelete = async (site: Site) => {
    if (!confirm(`Remove site "${site.name}"? Existing equipment records will keep their history.`)) return;
    try {
      await deleteMutation.mutateAsync(site.id);
      notify("Site removed.", "success");
    } catch {
      notify("Failed to remove site — it may still have equipment assigned to it.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Search sites…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add Site
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Code</TableHeaderCell>
            <TableHeaderCell>City</TableHeaderCell>
            <TableHeaderCell>Country</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {isLoading && <EmptyState message="Loading…" colSpan={6} />}
          {!isLoading && data?.results.length === 0 && <EmptyState message="No sites yet." colSpan={6} />}
          {!isLoading &&
            data?.results.map((site) => (
              <TableRow key={site.id}>
                <TableCell className="font-medium text-slate-900">{site.name}</TableCell>
                <TableCell className="font-mono text-xs">{site.code}</TableCell>
                <TableCell>{site.city || "—"}</TableCell>
                <TableCell>{site.country || "—"}</TableCell>
                <TableCell>{site.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(site);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(site)}>
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <SiteFormModal open={formOpen} onClose={() => setFormOpen(false)} site={editing} />
    </div>
  );
}

function CategoriesPanel() {
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { data, isLoading } = useCategoriesList({ search });
  const deleteMutation = useDeleteCategory();

  const handleDelete = async (category: Category) => {
    if (!confirm(`Remove category "${category.name}"? Existing equipment records will keep their history.`)) return;
    try {
      await deleteMutation.mutateAsync(category.id);
      notify("Category removed.", "success");
    } catch {
      notify("Failed to remove category — it may still have equipment or sub-categories assigned to it.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add Category
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Parent</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {isLoading && <EmptyState message="Loading…" colSpan={4} />}
          {!isLoading && data?.results.length === 0 && <EmptyState message="No categories yet." colSpan={4} />}
          {!isLoading &&
            data?.results.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium text-slate-900">{category.name}</TableCell>
                <TableCell>{data.results.find((c) => c.id === category.parent)?.name ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate">{category.description || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(category);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(category)}>
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <CategoryFormModal open={formOpen} onClose={() => setFormOpen(false)} category={editing} />
    </div>
  );
}
