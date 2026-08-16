"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Headset, PackageSearch, RotateCcw, X } from "lucide-react";

import {
  Badge,
  Breadcrumb,
  ErrorState,
  SkeletonProductGrid,
  type BadgeTone,
} from "@/components/ui";
import { api, getToken, getUser } from "@/lib/api";
import { formatDateTime, formatPrice, ORDER_STATUSES } from "@/lib/format";
import type { Order, User } from "@/lib/types";

const TRACKING_STEPS = ORDER_STATUSES.filter((s) => s !== "cancelled");

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "warning",
  paid: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
};

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser() as User | null;
    setUser(u);
    if (!getToken() || !u) {
      router.replace(`/login?redirect=${encodeURIComponent(`/orders/${params.id}`)}`);
      return;
    }
    setError(null);
    api<Order>(`/api/orders/${params.id}`, { auth: true })
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [params.id, router]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <SkeletonProductGrid count={3} />
      </div>
    );
  }

  const cancelled = order?.status === "cancelled";
  const currentIndex = order
    ? TRACKING_STEPS.indexOf(order.status as (typeof TRACKING_STEPS)[number])
    : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My orders", href: "/account" },
          { label: `Order #${params.id}` },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Back to my orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Order tracking <span className="text-slate-400">#{params.id}</span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Follow the progress of your delivery.
            </p>
          </div>
        </div>
        {order && (
          <Badge text={order.status} tone={STATUS_TONES[order.status] ?? "neutral"} />
        )}
      </div>

      {error && !order && (
        <div className="mt-6">
          <ErrorState message={error} />
        </div>
      )}
      {!error && !order && (
        <div className="mt-6">
          <SkeletonProductGrid count={2} />
        </div>
      )}

      {order && (
        <>
          {/* Tracking timeline */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            {cancelled ? (
              <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-100">
                  <X className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold">This order was cancelled</p>
                  <p className="text-xs text-rose-500">
                    Placed {formatDateTime(order.created_at)}
                  </p>
                </div>
              </div>
            ) : (
              <ol className="grid grid-cols-4 gap-2">
                {TRACKING_STEPS.map((step, i) => {
                  const done = i <= currentIndex;
                  const current = i === currentIndex;
                  return (
                    <li key={step} className="relative flex flex-col items-center gap-2">
                      {i > 0 && (
                        <span
                          className={`absolute left-[-50%] top-4 h-0.5 w-full ${
                            done ? "bg-indigo-600" : "bg-slate-200"
                          }`}
                        />
                      )}
                      <span
                        className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-white ${
                          done
                            ? "bg-indigo-600"
                            : "border-2 border-slate-200 bg-white text-slate-300"
                        } ${current ? "ring-4 ring-indigo-100" : ""}`}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </span>
                      <span
                        className={`text-center text-xs font-semibold capitalize ${
                          done ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Items */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            <h2 className="text-base font-bold text-slate-900">Items</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-300">
                      <PackageSearch className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium">
                  {formatPrice(order.total + order.discount)}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-emerald-600">Coupon {order.coupon_code}</dt>
                  <dd className="font-medium text-emerald-600">
                    −{formatPrice(order.discount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between text-base">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Shipping info */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            <h2 className="text-base font-bold text-slate-900">
              Shipping details
            </h2>
            <div className="mt-3 grid gap-1 text-sm text-slate-600">
              <p>{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.city}
                {order.city && order.postal_code ? ", " : ""}
                {order.postal_code}
              </p>
              {order.customer_phone && <p>{order.customer_phone}</p>}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Placed {formatDateTime(order.created_at)} · {order.customer_email}
            </p>
          </div>

          {/* Support / returns */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/returns"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/[0.02] transition-colors hover:border-indigo-300 hover:text-indigo-700"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <RotateCcw className="h-5 w-5" />
              </span>
              Request a return or refund
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/[0.02] transition-colors hover:border-indigo-300 hover:text-indigo-700"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Headset className="h-5 w-5" />
              </span>
              Get help with this order
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
