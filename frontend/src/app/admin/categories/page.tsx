"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Category } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setCategories(null);
    setError(null);
    api<Category[]>("/api/categories")
      .then(setCategories)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api("/api/categories", {
        method: "POST",
        body: { name: newName, description: newDesc },
        auth: true,
      });
      setNewName("");
      setNewDesc("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description);
  };

  const saveEdit = async () => {
    if (editingId === null || !editName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/api/categories/${editingId}`, {
        method: "PUT",
        body: { name: editName, description: editDesc },
        auth: true,
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/api/categories/${confirmId}`, {
        method: "DELETE",
        auth: true,
      });
      setConfirmId(null);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete category"
      );
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">Categories</h2>
        <p className="text-sm text-slate-500">
          Organise products into browsable categories.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={create}
        className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <h3 className="text-sm font-bold text-slate-900">Add category</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name (e.g. Garden)"
            className={`${inputClass} sm:max-w-60`}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Short description (optional)"
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Adding…" : "Add"}
          </button>
        </div>
      </form>

      {!error && !categories && <Spinner />}

      {!error && categories && categories.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No categories yet"
            subtitle="Create a category above to start organising your products."
          />
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {categories.map((c) => (
              <li key={c.id} className="px-5 py-4">
                {editingId === c.id ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`${inputClass} sm:max-w-56`}
                      placeholder="Name"
                    />
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className={`${inputClass} flex-1`}
                      placeholder="Description"
                    />
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        aria-label="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50"
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {c.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {c.description || "No description"}
                        <span className="ml-2 text-slate-300">
                          · created {formatDate(c.created_at)}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => startEdit(c)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmId(c.id)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete category?"
        message="Categories that still contain products cannot be deleted."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
