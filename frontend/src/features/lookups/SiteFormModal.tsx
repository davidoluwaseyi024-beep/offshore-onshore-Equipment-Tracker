import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useCreateSite, useUpdateSite } from "../../hooks/useSites";
import { useToast } from "../../components/ui/Toast";
import type { Site } from "../../types/common";

const emptyForm = { name: "", code: "", address: "", city: "", state_region: "", country: "" };

export function SiteFormModal({
  open,
  onClose,
  site,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass an existing site to edit it; omit/undefined to create a new one. */
  site?: Site | null;
  /** Called with the created/updated site — used by inline quick-create to auto-select it. */
  onSaved?: (site: Site) => void;
}) {
  const { notify } = useToast();
  const createMutation = useCreateSite();
  const updateMutation = useUpdateSite();
  const isEdit = !!site;

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(
        site
          ? {
              name: site.name,
              code: site.code,
              address: site.address,
              city: site.city,
              state_region: site.state_region,
              country: site.country,
            }
          : emptyForm,
      );
      setErrors({});
    }
  }, [open, site]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync({ id: site!.id, payload: form })
        : await createMutation.mutateAsync(form);
      notify(isEdit ? "Site updated." : "Site created.", "success");
      onSaved?.(saved);
      onClose();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        const details = err.response.data?.error?.details ?? {};
        const fieldErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(details)) {
          fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value);
        }
        setErrors(fieldErrors);
      } else {
        notify(isEdit ? "Failed to update site." : "Failed to create site.", "error");
      }
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Site" : "Add Site / Location"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Site Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            placeholder="Rig 14"
          />
          <Input
            label="Site Code"
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            error={errors.code}
            placeholder="RIG-014"
          />
        </div>
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <Input
            label="State / Region"
            value={form.state_region}
            onChange={(e) => setForm((f) => ({ ...f, state_region: e.target.value }))}
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Site"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
