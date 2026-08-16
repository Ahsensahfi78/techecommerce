"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Ticket } from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { api, getToken } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { CouponResult } from "@/lib/types";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Field,
  Input,
  buttonStyles,
} from "@/components/ui";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 49;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    city: "",
    postal_code: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<number | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const discount = coupon?.discount ?? 0;
  const total = subtotal + shipping - discount;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setValidating(true);
    setCouponError(null);
    try {
      const result = await api<CouponResult>("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal },
      });
      setCoupon(result);
      setCouponCode("");
    } catch (err) {
      setCoupon(null);
      setCouponError(
        err instanceof ApiError ? err.message : "Could not apply coupon"
      );
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await api<{ id: number }>("/api/orders", {
        method: "POST",
        body: {
          ...form,
          coupon_code: coupon?.code ?? null,
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        },
        auth: Boolean(getToken()),
      });
      clearCart();
      setPlaced(order.id);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong placing the order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center animate-fade-in">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Order placed!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thanks for shopping with us. Your order{" "}
          <span className="font-semibold text-slate-900">#{placed}</span> has
          been received and is being prepared.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => router.push(`/orders/${placed}`)}>
            Track my order
          </Button>
          <Button variant="outline" onClick={() => router.push("/products")}>
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Nothing to check out
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your cart is empty. Add some products first.
        </p>
        <Button onClick={() => router.push("/products")} className="mt-6">
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your delivery details to place the order.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        {/* Shipping form */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
          <h2 className="text-base font-bold text-slate-900">
            Shipping details
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required className="sm:col-span-2">
              <Input
                required
                value={form.customer_name}
                onChange={set("customer_name")}
                placeholder="John Doe"
              />
            </Field>
            <Field label="Email" required>
              <Input
                required
                type="email"
                value={form.customer_email}
                onChange={set("customer_email")}
                placeholder="john@example.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.customer_phone}
                onChange={set("customer_phone")}
                placeholder="+91 90000 00000"
              />
            </Field>
            <Field label="Street address" required className="sm:col-span-2">
              <Input
                required
                value={form.shipping_address}
                onChange={set("shipping_address")}
                placeholder="123 Market Street, Apt 4"
              />
            </Field>
            <Field label="City">
              <Input
                value={form.city}
                onChange={set("city")}
                placeholder="Bengaluru"
              />
            </Field>
            <Field label="Postal code">
              <Input
                value={form.postal_code}
                onChange={set("postal_code")}
                placeholder="560001"
              />
            </Field>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Order summary</h2>
            <Badge text={`${items.length} items`} tone="primary" />
          </div>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-slate-600">
                  {i.name} × {i.quantity}
                </span>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-emerald-600">
                  Coupon {coupon?.code}
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="ml-2 text-xs text-slate-400 underline hover:text-rose-500"
                  >
                    remove
                  </button>
                </dt>
                <dd className="font-medium text-emerald-600">
                  −{formatPrice(discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd className="font-medium">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          {/* Coupon input */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                <span className="flex items-center gap-2 font-semibold">
                  <Ticket className="h-4 w-4" />
                  {coupon.code}
                </span>
                <span>
                  {coupon.discount_type === "percent"
                    ? `${coupon.discount_value}%`
                    : `Rs ${coupon.discount_value.toFixed(2)}`}{" "}
                  applied
                </span>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="e.g. WELCOME10"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={validating || !couponCode.trim()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {validating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ticket className="h-4 w-4" />
                    )}
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">
                    {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            loadingLabel="Placing order…"
            className="mt-6"
          >
            Place order · {formatPrice(total)}
          </Button>
          <p className="mt-3 text-center text-xs text-slate-400">
            This is a demo checkout — no real payment is taken.
          </p>
        </div>
      </form>
    </div>
  );
}
