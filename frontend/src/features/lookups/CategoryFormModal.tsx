import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Input";
import { useAllCategories } from "../../hooks/useLookups";
import { useCreateCategory, useUpdateCategory } from "../../hooks/useCategories";
import { useToast } from "../../components/ui/Toast";
import type { Category } from "../../types/common";

const emptyForm = { name: "", parent: "" as number | "", description: "" };

export function CategoryFormModal({
  open,
  onClose,
  category,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Pass an existing category to edit it; omit/undefined to create a new one. */
  category?: Category | null;
  /** Called with the created/updated category — used by inline quick-create to auto-select it. */
  onSaved?: (category: Category) => void;
}) {
  const { notify } = useToast();
  const { data: categories } = useAllCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEdit = !!category;

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(
        category
          ? { name: category.name, parent: category.parent ?? "", description: category.description }
          : emptyForm,
      );
      setErrors({});
    }
  }, [open, category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const payload = { name: form.name, parent: form.parent === "" ? null : Number(form.parent), description: form.description };
    try {
      const saved = isEdit
        ? await updateMutation.mutateAsync({ id: category!.id, payload })
        : await createMutation.mutateAsync(payload);
      notify(isEdit ? "Category updated." : "Category created.", "success");
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
        notify(isEdit ? "Failed to update category." : "Failed to create category.", "error");
      }
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Category" : "Add Category"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Category Name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
          placeholder="Excavators"
        />
        <Select
          label="Parent Category"
          value={form.parent}
          onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value === "" ? "" : Number(e.target.value) }))}
        >
          <option value="">None (top-level)</option>
          {categories
            ?.filter((c) => c.id !== category?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
        <Textarea
          label="Description"
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
