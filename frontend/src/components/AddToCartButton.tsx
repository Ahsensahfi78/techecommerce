"use client";

import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    window.setTimeout(() => {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
        quantity: qty,
      });
      setAdding(false);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    }, 300);
  };

  const out = product.stock <= 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-xl border border-slate-300">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid h-12 w-12 place-items-center text-xl text-slate-500 hover:text-slate-900 disabled:opacity-40"
          disabled={out}
        >
          −
        </button>
        <span className="w-12 text-center text-sm font-semibold text-slate-900">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="grid h-12 w-12 place-items-center text-xl text-slate-500 hover:text-slate-900 disabled:opacity-40"
          disabled={out}
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={out || adding}
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none ${
          added
            ? "bg-emerald-500"
            : "bg-slate-900 hover:bg-indigo-600"
        }`}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" /> Added to cart
          </>
        ) : adding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Adding…
          </>
        ) : out ? (
          "Out of stock"
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </>
        )}
      </button>
    </div>
  );
}
