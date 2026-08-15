"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Badge, Stars } from "@/components/ui";
import { WishlistButton } from "@/components/WishlistButton";
import { QuickViewModal } from "@/components/QuickViewModal";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [quickView, setQuickView] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
      quantity: 1,
    });
    toast.success(`Added “${product.name}” to cart`);
  };

  return (
    <>
      <Link
        href={`/products/${product.id}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-slate-300">
              No image
            </div>
          )}
          {product.featured && (
            <Badge
              text="Featured"
              tone="primary"
              className="absolute left-3 top-3 shadow-sm"
            />
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                Out of stock
              </span>
            </div>
          )}
          <WishlistButton productId={product.id} />
        </div>

        <div className="flex flex-1 flex-col p-4">
          {product.category_name && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-indigo-600">
              {product.category_name}
            </span>
          )}
          <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">
            {product.name}
          </h3>
          <div className="mt-1">
            <Stars rating={product.avg_rating} count={product.review_count} />
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setQuickView(true);
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Add to cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      <QuickViewModal
        product={quickView ? product : null}
        onClose={() => setQuickView(false)}
      />
    </>
  );
}
