"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Your cart</h1>
        <div className="mt-6">
          <EmptyState
            title="Your cart is empty"
            subtitle="Browse our products and add something you love."
            action={
              <Link
                href="/products"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <ShoppingBag className="h-4 w-4" /> Start shopping
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Your cart</h1>
      <p className="mt-1 text-sm text-slate-500">
        {items.length} item{items.length !== 1 ? "s" : ""} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
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
                    onClick={() => removeItem(item.product_id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity - 1)
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:text-slate-900"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity + 1)
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:text-slate-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <span className="text-sm font-bold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-slate-900">Order summary</h2>
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
            {shipping > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Add {formatPrice(50 - subtotal)} more to unlock free shipping.
              </p>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            onClick={() => router.push("/checkout")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
