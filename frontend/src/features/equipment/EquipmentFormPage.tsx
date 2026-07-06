import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";

import { useAllCategories, useAllSites } from "../../hooks/useLookups";
import { useCreateEquipment, useEquipmentDetail, useUpdateEquipment } from "../../hooks/useEquipment";
import { useAuth } from "../../context/AuthContext";
import { canManageSitesAndCategories } from "../../utils/permissions";
import { useToast } from "../../components/ui/Toast";
import { Button } from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { SiteFormModal } from "../lookups/SiteFormModal";
import { CategoryFormModal } from "../lookups/CategoryFormModal";
import type { EquipmentWritePayload } from "../../types/equipment";

const emptyForm: EquipmentWritePayload = {
  name: "",
  serial_number: "",
  qr_code: "",
  category: 0,
  site: 0,
  condition: "",
  manufacturer: "",
  model_number: "",
  purchase_date: "",
  purchase_cost: "",
  warranty_expiry: "",
  notes: "",
};

export function EquipmentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { notify } = useToast();
  const { user } = useAuth();

  const { data: sites } = useAllSites();
  const { data: categories } = useAllCategories();
  const { data: existing } = useEquipmentDetail(isEdit ? Number(id) : undefined);

  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment(Number(id));

  const [form, setForm] = useState<EquipmentWritePayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const canQuickCreate = user ? canManageSitesAndCategories(user.role) : false;

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        serial_number: existing.serial_number,
        qr_code: existing.qr_code ?? "",
        category: existing.category,
        site: existing.site,
        condition: existing.condition,
        manufacturer: existing.manufacturer,
        model_number: existing.model_number,
        purchase_date: existing.purchase_date ?? "",
        purchase_cost: existing.purchase_cost ?? "",
        warranty_expiry: existing.warranty_expiry ?? "",
        notes: existing.notes,
      });
    }
  }, [existing]);

  const field = (key: keyof EquipmentWritePayload) => ({
    value: (form[key] as string | number) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const payload: EquipmentWritePayload = {
      ...form,
      category: Number(form.category),
      site: Number(form.site),
      qr_code: form.qr_code || null,
      purchase_date: form.purchase_date || null,
      warranty_expiry: form.warranty_expiry || null,
      purchase_cost: form.purchase_cost || null,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        notify("Equipment updated.", "success");
      } else {
        const created = await createMutation.mutateAsync(payload);
        notify("Equipment created.", "success");
        navigate(`/equipment/${created.id}`);
        return;
      }
      navigate(`/equipment/${id}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        const details = err.response.data?.error?.details ?? {};
        const fieldErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(details)) {
          fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value);
        }
        setErrors(fieldErrors);
        notify("Please fix the errors below.", "error");
      } else {
        notify("Something went wrong. Please try again.", "error");
      }
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-brand-950">{isEdit ? "Edit Equipment" : "Add Equipment"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Name" required {...field("name")} />
          <Input label="Serial Number" required {...field("serial_number")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Select label="Category" required {...field("category")}>
              <option value="">Select category…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {canQuickCreate && (
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="mt-1 text-xs font-medium text-accent-700 hover:underline"
              >
                + Add new category
              </button>
            )}
          </div>
          <div>
            <Select label="Site" required {...field("site")}>
              <option value="">Select site…</option>
              {sites?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            {canQuickCreate && (
              <button
                type="button"
                onClick={() => setSiteModalOpen(true)}
                className="mt-1 text-xs font-medium text-accent-700 hover:underline"
              >
                + Add new site / location
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="QR Code" {...field("qr_code")} />
          <Select label="Condition" {...field("condition")}>
            <option value="">—</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Manufacturer" {...field("manufacturer")} />
          <Input label="Model Number" {...field("model_number")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Purchase Date" type="date" {...field("purchase_date")} />
          <Input label="Purchase Cost" type="number" step="0.01" {...field("purchase_cost")} />
          <Input label="Warranty Expiry" type="date" {...field("warranty_expiry")} />
        </div>

        <Textarea label="Notes" rows={3} {...field("notes")} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Equipment"}
          </Button>
        </div>
      </form>

      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSaved={(created) => setForm((f) => ({ ...f, category: created.id }))}
      />
      <SiteFormModal
        open={siteModalOpen}
        onClose={() => setSiteModalOpen(false)}
        onSaved={(created) => setForm((f) => ({ ...f, site: created.id }))}
      />
    </div>
  );
}
