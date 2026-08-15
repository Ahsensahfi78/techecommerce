"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import {
  formatDateTime,
  formatPrice,
  ORDER_STATUSES,
  STATUS_STYLES,
} from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    if (!id) return;
    setError(null);
    api<Order>(`/api/orders/${id}`, { auth: true })
      .then(setOrder)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    setError(null);
    try {
      await api(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: { status },
        auth: true,
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/api/orders/${id}`, { method: "DELETE", auth: true });
      router.push("/admin/orders");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete order");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!order) return <Spinner />;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Order #{order.id}</h2>
          <p className="text-sm text-slate-500">
            Placed {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ring-1 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
          >
            {order.status}
          </span>
          <select
            value={order.status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 disabled:opacity-50"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">
              Items ({order.items.length})
            </h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-xs text-slate-300">
                    img
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4">
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Customer</h3>
            <div className="mt-3 space-y-1.5 text-sm">
              <p className="font-medium text-slate-900">{order.customer_name}</p>
              <p className="text-slate-500">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-slate-500">{order.customer_phone}</p>
              )}
              {order.user_id ? (
                <p className="text-xs text-indigo-600">
                  Registered user #{order.user_id}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Guest checkout</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin className="h-4 w-4 text-slate-400" /> Shipping address
            </h3>
            <p className="mt-3 text-sm text-slate-600">{order.shipping_address}</p>
            <p className="text-sm text-slate-600">
              {order.city}
              {order.postal_code ? `, ${order.postal_code}` : ""}
            </p>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" /> Delete order
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this order?"
        message={`Order #${order.id} for ${order.customer_name} will be permanently removed.`}
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
