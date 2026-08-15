"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Spinner, EmptyState } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import type { User } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", is_admin: false });
  const [saving, setSaving] = useState(false);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setUsers(null);
    setError(null);
    api<User[]>("/api/users", { auth: true })
      .then(setUsers)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", is_admin: u.is_admin });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        is_admin: form.is_admin,
      };
      if (form.password.trim()) body.password = form.password;
      await api(`/api/users/${editing.id}`, {
        method: "PUT",
        body,
        auth: true,
      });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/api/users/${confirmId}`, { method: "DELETE", auth: true });
      setConfirmId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete user");
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">Users</h2>
        <p className="text-sm text-slate-500">
          {users?.length ?? 0} registered account{users?.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!error && !users && <Spinner />}
      {!error && users && users.length === 0 && (
        <div className="mt-5">
          <EmptyState title="No users yet" subtitle="Registered customers will appear here." />
        </div>
      )}

      {users && users.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                          {initials(u.name)}
                        </span>
                        <span className="font-semibold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          Admin
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          aria-label="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(u.id)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form
            onSubmit={save}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Edit user #{editing.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  New password (optional)
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className={inputClass}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.is_admin}
                  onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  Give admin access
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete user?"
        message="The user account and their access will be removed."
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
