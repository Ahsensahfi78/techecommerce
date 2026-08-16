"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

import {
  Badge,
  EmptyState,
  ErrorState,
  Modal,
  Select,
  Skeleton,
  type BadgeTone,
} from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Enquiry, Supplier } from "@/lib/types";

const ENQUIRY_STATUSES = ["open", "answered", "closed"] as const;
const ENQUIRY_CATEGORIES = ["general", "order", "return", "supplier"] as const;

const STATUS_TONES: Record<string, BadgeTone> = {
  open: "warning",
  answered: "info",
  closed: "success",
};

const CATEGORY_TONES: Record<string, BadgeTone> = {
  general: "neutral",
  order: "primary",
  return: "error",
  supplier: "info",
};

export default function AdminEnquiriesPage() {
  const toast = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setEnquiries(null);
    setError(null);
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (category) q.set("category", category);
    const qs = q.toString();
    api<Enquiry[]>(`/api/enquiries${qs ? `?${qs}` : ""}`, { auth: true })
      .then(setEnquiries)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [status, category]);

  useEffect(() => {
    api<Supplier[]>("/api/suppliers", { auth: true })
      .then(setSuppliers)
      .catch(() => {});
  }, []);

  const update = async (enquiry: Enquiry, body: Record<string, string | number>) => {
    setUpdating(true);
    try {
      await api(`/api/enquiries/${enquiry.id}/status`, {
        method: "PATCH",
        body,
        auth: true,
      });
      toast.success("Enquiry updated");
      load();
      setSelected(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enquiries</h2>
          <p className="text-sm text-slate-500">
            {enquiries?.length ?? 0} enquiry{enquiries?.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-44">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {ENQUIRY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <ErrorState message={error} />
        </div>
      )}
      {!error && !enquiries && (
        <div className="mt-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}
      {!error && enquiries && enquiries.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No enquiries"
            subtitle="Customer and supplier enquiries will appear here."
            icon={<MessageSquare className="h-7 w-7" />}
          />
        </div>
      )}

      {enquiries && enquiries.length > 0 && (
        <div className="mt-5 space-y-3">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] transition-colors hover:border-indigo-200 hover:bg-slate-50"
              onClick={() => setSelected(enquiry)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {enquiry.subject}
                    </p>
                    <p className="text-xs text-slate-500">
                      {enquiry.user_name ?? "Unknown"} ·{" "}
                      {formatDateTime(enquiry.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge text={enquiry.category} tone={CATEGORY_TONES[enquiry.category] ?? "neutral"} />
                  <Badge text={enquiry.status} tone={STATUS_TONES[enquiry.status] ?? "neutral"} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.subject : ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge text={selected.category} tone={CATEGORY_TONES[selected.category] ?? "neutral"} />
                <Badge text={selected.status} tone={STATUS_TONES[selected.status] ?? "neutral"} />
              </div>
              <p className="text-xs text-slate-400">
                {selected.user_name ?? "Unknown"} · {formatDateTime(selected.created_at)}
              </p>
            </div>

            {selected.reference_type && (
              <p className="text-xs text-slate-500">
                Reference: {selected.reference_type}
                {selected.reference_id ? ` #${selected.reference_id}` : ""}
              </p>
            )}

            <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {selected.message}
            </div>

            <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <Select
                  value={selected.status}
                  disabled={updating}
                  onChange={(e) => update(selected, { status: e.target.value })}
                >
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assign supplier
                </label>
                <Select
                  value={selected.supplier_id ? String(selected.supplier_id) : ""}
                  disabled={updating}
                  onChange={(e) =>
                    update(selected, {
                      supplier_id: e.target.value ? Number(e.target.value) : 0,
                    })
                  }
                >
                  <option value="">None</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {selected.supplier && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-indigo-600">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-slate-500">Assigned supplier</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selected.supplier.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
