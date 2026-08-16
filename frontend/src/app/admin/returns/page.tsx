"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

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
import { formatDateTime, formatPrice } from "@/lib/format";
import type { SalesReturn } from "@/lib/types";

const RETURN_STATUSES = ["requested", "approved", "rejected", "refunded", "completed"] as const;

const STATUS_TONES: Record<string, BadgeTone> = {
  requested: "warning",
  approved: "info",
  rejected: "error",
  refunded: "success",
  completed: "primary",
};

export default function AdminReturnsPage() {
  const toast = useToast();
  const [returns, setReturns] = useState<SalesReturn[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<SalesReturn | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setReturns(null);
    setError(null);
    const q = filter ? `?status=${filter}` : "";
    api<SalesReturn[]>(`/api/returns${q}`, { auth: true })
      .then(setReturns)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [filter]);

  const changeStatus = async (r: SalesReturn, status: string) => {
    setUpdating(true);
    try {
      await api(`/api/returns/${r.id}/status`, {
        method: "PATCH",
        body: { status },
        auth: true,
      });
      toast.success(`Return ${r.return_number} marked ${status}`);
      if (selected?.id === r.id) {
        setSelected({ ...selected, status: status as SalesReturn["status"] });
      }
      load();
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
          <h2 className="text-lg font-bold text-slate-900">Sales returns</h2>
          <p className="text-sm text-slate-500">
            {returns?.length ?? 0} return{returns?.length === 1 ? "" : "s"}
            {filter ? ` · ${filter}` : ""}
          </p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {["", ...RETURN_STATUSES].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                filter === s
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-600"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-5">
          <ErrorState message={error} />
        </div>
      )}
      {!error && !returns && (
        <div className="mt-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}
      {!error && returns && returns.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No returns yet"
            subtitle="Customer return requests will appear here."
            icon={<RotateCcw className="h-7 w-7" />}
          />
        </div>
      )}

      {returns && returns.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Return</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Refund</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelected(r)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{r.return_number}</p>
                      <p className="text-xs text-slate-500">Order #{r.order_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{r.user_name ?? "Guest"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.items.length} item{r.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatPrice(r.refund_amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.supplier?.name ?? (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={r.status} tone={STATUS_TONES[r.status] ?? "neutral"} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Return ${selected.return_number}` : ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">
                  Order <span className="font-semibold text-slate-900">#{selected.order_id}</span> ·
                  {selected.user_name ? ` ${selected.user_name}` : " Guest"}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(selected.created_at)}
                </p>
              </div>
              <Badge text={selected.status} tone={STATUS_TONES[selected.status] ?? "neutral"} />
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reason
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selected.reason || "No reason provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Items
              </p>
              <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {selected.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate-700">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatPrice(item.price)}
                    </span>
                  </li>
                ))}
                {selected.items.length === 0 && (
                  <li className="px-4 py-2.5 text-sm text-slate-400">
                    Whole order return
                  </li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Refund amount
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatPrice(selected.refund_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Supplier
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {selected.supplier?.name ?? "Unassigned"}
                </p>
              </div>
            </div>

            {selected.notes && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                  Notes
                </p>
                <p className="mt-1">{selected.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="w-full max-w-xs">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Update status
                </label>
                <Select
                  value={selected.status}
                  disabled={updating}
                  onChange={(e) => changeStatus(selected, e.target.value)}
                >
                  {RETURN_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
