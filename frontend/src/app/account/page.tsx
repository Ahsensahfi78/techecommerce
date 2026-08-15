"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { EmptyState, Spinner } from "@/components/ui";
import { api, clearSession, getToken, getUser } from "@/lib/api";
import { formatDateTime, formatPrice, initials, STATUS_STYLES } from "@/lib/format";
import type { Order, User } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser() as User | null;
    setUser(u);
    if (!getToken() || !u) {
      router.replace(`/login?redirect=${encodeURIComponent("/account")}`);
      return;
    }
    api<Order[]>("/api/orders/mine", { auth: true })
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [router]);

  if (!user) return <Spinner />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
            {initials(user.name)}
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            clearSession();
            router.push("/");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">My orders</h2>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {!error && !orders && <Spinner />}
      {!error && orders && orders.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title="No orders yet"
            subtitle="When you place an order, it will show up here."
            action={
              <Link
                href="/products"
                className="mt-2 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Start shopping
              </Link>
            }
          />
        </div>
      )}

      <div className="mt-5 space-y-4">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Order #{order.id}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                >
                  {order.status}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              {order.items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-[10px] text-slate-300">
                      img
                    </div>
                  )}
                  <div className="max-w-40">
                    <p className="truncate text-xs font-medium text-slate-700">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 4 && (
                <span className="self-center text-xs text-slate-400">
                  +{order.items.length - 4} more
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Ship to: {order.shipping_address}
                {order.city ? `, ${order.city}` : ""}
                {order.postal_code ? ` ${order.postal_code}` : ""}
              </p>
              <Link
                href={`/orders/${order.id}`}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Track order
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
