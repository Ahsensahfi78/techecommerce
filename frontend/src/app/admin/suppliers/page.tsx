"use client";

import { useEffect, useState } from "react";
import { Factory, Mail, MessageSquare, Pencil, Phone, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  Skeleton,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { api, ApiError } from "@/lib/api";
import type { Enquiry, Supplier } from "@/lib/types";

type SupplierForm = {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const EMPTY_FORM: SupplierForm = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function AdminSuppliersPage() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [enquirySupplier, setEnquirySupplier] = useState<Supplier | null>(null);
  const [enquiryForm, setEnquiryForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const load = () => {
    setSuppliers(null);
    setError(null);
    api<Supplier[]>("/api/suppliers", { auth: true })
      .then(setSuppliers)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name,
      contact_name: s.contact_name,
      email: s.email,
      phone: s.phone,
      address: s.address,
      notes: s.notes,
    });
    setFormOpen(true);
  };

  const openEnquiry = (s: Supplier) => {
    setEnquirySupplier(s);
    setEnquiryForm({
      subject: `Supplier enquiry — ${s.name}`,
      message: "",
    });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await api(`/api/suppliers/${editing.id}`, {
          method: "PUT",
          body: form,
          auth: true,
        });
        toast.success("Supplier updated");
      } else {
        await api("/api/suppliers", { method: "POST", body: form, auth: true });
        toast.success("Supplier added");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    try {
      await api(`/api/suppliers/${confirmId}`, { method: "DELETE", auth: true });
      setConfirmId(null);
      toast.success("Supplier deleted");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const sendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquirySupplier) return;
    setSending(true);
    try {
      const result = await api<Enquiry>("/api/enquiries", {
        method: "POST",
        body: {
          subject: enquiryForm.subject,
          message: enquiryForm.message,
          category: "supplier",
          supplier_id: enquirySupplier.id,
        },
        auth: true,
      });
      toast.success(`Enquiry #${result.id} sent to ${enquirySupplier.name}`);
      setEnquirySupplier(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send enquiry");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Suppliers</h2>
          <p className="text-sm text-slate-500">
            {suppliers?.length ?? 0} supplier{suppliers?.length === 1 ? "" : "s"} on file
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add supplier
        </Button>
      </div>

      {error && (
        <div className="mt-5">
          <ErrorState message={error} />
        </div>
      )}
      {!error && !suppliers && (
        <div className="mt-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}
      {!error && suppliers && suppliers.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No suppliers yet"
            subtitle="Add suppliers to manage procurement and returns."
            icon={<Factory className="h-7 w-7" />}
            action={
              <Button onClick={openCreate} className="mt-2">
                <Plus className="h-4 w-4" /> Add supplier
              </Button>
            }
          />
        </div>
      )}

      {suppliers && suppliers.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Added</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Factory className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{s.name}</p>
                          <p className="max-w-56 truncate text-xs text-slate-400">
                            {s.address || s.notes || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{s.contact_name || "—"}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" /> {s.email || "—"}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone className="h-3 w-3" /> {s.phone || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {s.product_count}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEnquiry(s)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          aria-label={`Send enquiry to ${s.name}`}
                          title="Send supplier enquiry"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(s.id)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete"
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

      {/* Create / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit supplier" : "Add supplier"}
        size="lg"
      >
        <form onSubmit={submitForm} className="space-y-4">
          <Field label="Supplier name" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Acme Electronics Pvt. Ltd."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact person">
              <Input
                value={form.contact_name}
                onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                placeholder="Ramesh Kumar"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 90000 00000"
              />
            </Field>
          </div>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="sales@acme.example"
            />
          </Field>
          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Warehouse address"
            />
          </Field>
          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Payment terms, lead times, etc."
            />
          </Field>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} loadingLabel="Saving…">
              {editing ? "Save changes" : "Add supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supplier enquiry modal */}
      <Modal
        open={enquirySupplier !== null}
        onClose={() => setEnquirySupplier(null)}
        title={enquirySupplier ? `Enquire: ${enquirySupplier.name}` : ""}
      >
        {enquirySupplier && (
          <form onSubmit={sendEnquiry} className="space-y-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
              This enquiry will be logged with category “supplier” and assigned
              to {enquirySupplier.name} for follow-up.
            </div>
            <Field label="Subject" required>
              <Input
                required
                value={enquiryForm.subject}
                onChange={(e) =>
                  setEnquiryForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </Field>
            <Field label="Message" required>
              <Textarea
                required
                rows={4}
                value={enquiryForm.message}
                onChange={(e) =>
                  setEnquiryForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Describe what you need from this supplier — stock, pricing, delivery, quality issues, etc."
              />
            </Field>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnquirySupplier(null)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={sending} loadingLabel="Sending…">
                <MessageSquare className="h-4 w-4" /> Send enquiry
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete supplier?"
        message="This supplier will be removed. Products assigned to it will be left unassigned."
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
