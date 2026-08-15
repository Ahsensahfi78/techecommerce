"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Clock,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Spinner, ErrorState, Badge } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDateTime, formatPrice, STATUS_STYLES } from "@/lib/format";
import type { DashboardStats, SalesPoint } from "@/lib/types";

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<DashboardStats>("/api/dashboard/stats", { auth: true })
      .then(setStats)
      .catch((e) => setError(e.message));
    api<SalesPoint[]>("/api/orders/stats/sales-over-time?days=14", {
      auth: true,
    })
      .then(setSales)
      .catch(() => {});
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!stats) return <Spinner />;

  const maxRevenue = Math.max(...sales.map((s) => s.revenue), 1);
  const totalCategory = stats.category_counts.reduce(
    (sum, c) => sum + c.count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Total revenue"
          value={formatPrice(stats.total_revenue)}
          icon={Banknote}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Orders"
          value={String(stats.total_orders)}
          icon={ShoppingCart}
          tone="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Pending"
          value={String(stats.pending_orders)}
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Products"
          value={String(stats.total_products)}
          icon={Package}
          tone="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Customers"
          value={String(stats.total_customers)}
          icon={Users}
          tone="bg-cyan-50 text-cyan-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Revenue (last 14 days)
            </h2>
            <Badge text="excl. cancelled" />
          </div>
          <div className="mt-5 flex h-44 items-end gap-1.5">
            {sales.length === 0 && (
              <p className="text-sm text-slate-400">No sales data yet.</p>
            )}
            {sales.map((s) => (
              <div
                key={s.date}
                className="group relative flex flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-500 transition-all group-hover:from-indigo-700 group-hover:to-violet-600"
                  style={{
                    height: `${Math.max((s.revenue / maxRevenue) * 100, 3)}%`,
                  }}
                  title={`${s.date}: ${formatPrice(s.revenue)}`}
                />
                <span className="mt-1 hidden text-[10px] text-slate-400 group-hover:block">
                  {s.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Products by category</h2>
          <div className="mt-5 space-y-3">
            {stats.category_counts.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.category}</span>
                  <span className="text-slate-500">
                    {c.count} ({totalCategory ? Math.round((c.count / totalCategory) * 100) : 0}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{
                      width: `${totalCategory ? (c.count / totalCategory) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {stats.category_counts.length === 0 && (
              <p className="text-sm text-slate-400">No categories yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {stats.recent_orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    #{order.id} · {order.customer_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            ))}
            {stats.recent_orders.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                No orders yet.
              </p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Low stock alerts</h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage products <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {stats.low_stock_products.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    p.stock === 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {p.stock} left
                </span>
              </Link>
            ))}
            {stats.low_stock_products.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                All products are well stocked.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
