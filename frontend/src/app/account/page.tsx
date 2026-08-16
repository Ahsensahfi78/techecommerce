"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, LayoutDashboard, LogOut, Package, Wallet } from "lucide-react";

import {
  Badge,
  Breadcrumb,
  Button,
  EmptyState,
  SkeletonProductGrid,
  StatCard,
  type BadgeTone,
} from "@/components/ui";
import { api, clearSession, getToken, getUser } from "@/lib/api";
import { formatDateTime, formatPrice, initials } from "@/lib/format";
import { useWishlist } from "@/lib/wishlist-context";
import type { Order, User } from "@/lib/types";

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "warning",
  paid: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { ids } = useWishlist();

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

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SkeletonProductGrid count={3} />
      </div>
    );
  }

  const totalSpent = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "My account" }]}
      />

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
            {initials(user.name)}
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {user.name}
            </h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.is_admin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              <LayoutDashboard className="h-4 w-4" /> Admin panel
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => {
              clearSession();
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total orders"
          value={String(orders?.length ?? 0)}
          icon={Package}
          tone="indigo"
        />
        <StatCard
          label="Total spent"
          value={formatPrice(totalSpent)}
          icon={Wallet}
          tone="emerald"
        />
        <StatCard
          label="Saved items"
          value={String(ids.size)}
          icon={Heart}
          tone="rose"
          href="/wishlist"
        />
      </div>

      {/* Orders */}
      <h2 className="mt-10 text-lg font-bold tracking-tight text-slate-900">
        My orders
      </h2>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {!error && !orders && (
        <div className="mt-6">
          <SkeletonProductGrid count={3} />
        </div>
      )}
      {!error && orders && orders.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title="No orders yet"
            subtitle="When you place an order, it will show up here."
            action={
              <Link href="/products">
                <Button className="mt-2">Start shopping</Button>
              </Link>
            }
          />
        </div>
      )}

      <div className="mt-5 space-y-4">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
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
                <Badge text={order.status} tone={STATUS_TONES[order.status] ?? "neutral"} />
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
                className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
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
