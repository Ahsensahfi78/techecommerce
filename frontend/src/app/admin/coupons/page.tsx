"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState, Spinner } from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Coupon } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

const EMPTY_FORM = {
  code: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  min_order: "0",
  expires_at: "",
  active: true,
};

export default function AdminCouponsPage() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setCoupons(null);
    setError(null);
    api<Coupon[]>("/api/coupons", { auth: true })
      .then(setCoupons)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || form.discount_value === "") return;
    setCreating(true);
    setError(null);
    try {
      await api("/api/coupons", {
        method: "POST",
        auth: true,
        body: {
          code: form.code.trim().toUpperCase(),
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          min_order: Number(form.min_order || 0),
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
          active: form.active,
        },
      });
      setForm({ ...EMPTY_FORM });
      load();
      toast.success("Coupon created");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c.id);
    setEditForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order: String(c.min_order),
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
      active: c.active,
    });
  };

  const saveEdit = async () => {
    if (editingId === null || !editForm.code.trim() || editForm.discount_value === "") return;
    setSaving(true);
    setError(null);
    try {
      await api(`/api/coupons/${editingId}`, {
        method: "PUT",
        auth: true,
        body: {
          code: editForm.code.trim().toUpperCase(),
          discount_type: editForm.discount_type,
          discount_value: Number(editForm.discount_value),
          min_order: Number(editForm.min_order || 0),
          expires_at: editForm.expires_at
            ? new Date(editForm.expires_at).toISOString()
            : null,
          active: editForm.active,
        },
      });
      setEditingId(null);
      load();
      toast.success("Coupon updated");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/api/coupons/${confirmId}`, { method: "DELETE", auth: true });
      setConfirmId(null);
      load();
      toast.success("Coupon deleted");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete coupon");
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  const couponFields = (
    <>
      <input
        required
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
        placeholder="Code (e.g. SAVE10)"
        className={`${inputClass} uppercase sm:max-w-44`}
      />
      <select
        value={form.discount_type}
        onChange={(e) =>
          setForm({
            ...form,
            discount_type: e.target.value as "percent" | "fixed",
          })
        }
        className={`${inputClass} sm:max-w-40`}
      >
        <option value="percent">% off</option>
        <option value="fixed">$ off</option>
      </select>
      <input
        required
        type="number"
        min="0"
        step="0.01"
        value={form.discount_value}
        onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
        placeholder="Value"
        className={`${inputClass} sm:max-w-28`}
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={form.min_order}
        onChange={(e) => setForm({ ...form, min_order: e.target.value })}
        placeholder="Min. order"
        className={`${inputClass} sm:max-w-32`}
      />
      <input
        type="datetime-local"
        value={form.expires_at}
        onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
        className={`${inputClass} sm:max-w-52`}
      />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="h-4 w-4 accent-indigo-600"
        />
        Active
      </label>
    </>
  );

  return (
    <div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">Coupons</h2>
        <p className="text-sm text-slate-500">
          Create discount codes customers can apply at checkout.
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
        <h3 className="text-sm font-bold text-slate-900">Add coupon</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {couponFields}
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

      {!error && !coupons && <Spinner />}

      {!error && coupons && coupons.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No coupons yet"
            subtitle="Create a coupon above to start offering discounts."
          />
        </div>
      )}

      {coupons && coupons.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {coupons.map((c) => (
              <li key={c.id} className="px-5 py-4">
                {editingId === c.id ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      className={`${inputClass} uppercase sm:max-w-44`}
                    />
                    <select
                      value={editForm.discount_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          discount_type: e.target.value as "percent" | "fixed",
                        })
                      }
                      className={`${inputClass} sm:max-w-40`}
                    >
                      <option value="percent">% off</option>
                      <option value="fixed">$ off</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.discount_value}
                      onChange={(e) =>
                        setEditForm({ ...editForm, discount_value: e.target.value })
                      }
                      className={`${inputClass} sm:max-w-28`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.min_order}
                      onChange={(e) =>
                        setEditForm({ ...editForm, min_order: e.target.value })
                      }
                      className={`${inputClass} sm:max-w-32`}
                    />
                    <input
                      type="datetime-local"
                      value={editForm.expires_at}
                      onChange={(e) =>
                        setEditForm({ ...editForm, expires_at: e.target.value })
                      }
                      className={`${inputClass} sm:max-w-52`}
                    />
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editForm.active}
                        onChange={(e) =>
                          setEditForm({ ...editForm, active: e.target.checked })
                        }
                        className="h-4 w-4 accent-indigo-600"
                      />
                      Active
                    </label>
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold tracking-wide text-indigo-700">
                        {c.code}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {c.discount_type === "percent"
                            ? `${c.discount_value}% off`
                            : `Rs ${c.discount_value.toFixed(2)} off`}
                          {c.min_order > 0 && (
                            <span className="ml-1.5 font-normal text-slate-500">
                              min Rs {c.min_order.toFixed(2)}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {c.expires_at
                            ? `expires ${formatDate(c.expires_at)}`
                            : "no expiry"}
                          <span className="ml-2 text-slate-300">
                            · created {formatDate(c.created_at)}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          c.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </span>
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
        title="Delete coupon?"
        message="Customers will no longer be able to use this code. This cannot be undone."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
