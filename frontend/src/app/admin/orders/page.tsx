"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { ErrorState, Spinner, EmptyState } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDateTime, formatPrice, ORDER_STATUSES, STATUS_STYLES } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setOrders(null);
    setError(null);
    const q = status ? `?status=${status}` : "";
    api<Order[]>(`/api/orders${q}`, { auth: true })
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500">
            {orders?.length ?? 0} order{orders?.length === 1 ? "" : "s"}
            {status ? ` · ${status}` : ""}
          </p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatus("")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              status === ""
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-600"
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                status === s
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mt-5"><ErrorState message={error} /></div>}
      {!error && !orders && <Spinner />}
      {!error && orders && orders.length === 0 && (
        <div className="mt-5">
          <EmptyState title="No orders found" subtitle="Orders will appear here once customers check out." />
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      #{o.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{o.customer_name}</p>
                      <p className="text-xs text-slate-500">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${STATUS_STYLES[o.status] ?? STATUS_STYLES.pending}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
