"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";

import {
  Breadcrumb,
  Button,
  EmptyState,
  QuantityStepper,
  buttonStyles,
} from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 49;

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const toast = useToast();
  const router = useRouter();

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Your cart
        </h1>
        <div className="mt-6">
          <EmptyState
            title="Your cart is empty"
            subtitle="Browse our products and add something you love."
            action={
              <Button className="mt-2">
                <ShoppingBag className="h-4 w-4" /> Start shopping
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
        <Link
          href="/products"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]"
            >
              <Link
                href={`/products/${item.product_id}`}
                className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"
              >
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-slate-300">
                    No image
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/products/${item.product_id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      removeItem(item.product_id);
                      toast.info(`Removed “${item.name}” from cart`);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    min={1}
                    max={item.stock}
                    onChange={(q) => updateQuantity(item.product_id, q)}
                  />
                  <span className="text-sm font-bold text-slate-900 sm:hidden">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>

              <div className="hidden items-center text-right sm:flex">
                <span className="text-sm font-bold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02] lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-slate-900">Order summary</h2>

          {/* Free shipping progress */}
          {shipping > 0 ? (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Add {formatPrice(remaining)} more to unlock free shipping.
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              You&apos;ve unlocked free shipping!
            </p>
          )}

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium text-slate-900">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd className="font-medium text-slate-900">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            onClick={() => router.push("/checkout")}
            className={buttonStyles({
              size: "lg",
              fullWidth: true,
              className: "mt-6",
            })}
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
