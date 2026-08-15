"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Minus, Plus, ShoppingBag, Truck } from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import {
  Badge,
  Button,
  Modal,
  QuantityStepper,
  Stars,
  cx,
} from "@/components/ui";
import { WishlistButton } from "@/components/WishlistButton";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) setQty(1);
  }, [product]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
      quantity: qty,
    });
    toast.success(`Added “${product.name}” to cart`);
    onClose();
  };

  return (
    <Modal open={!!product} onClose={onClose} size="lg" aria-label="Quick view">
      {product && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-slate-300">
                No image
              </div>
            )}
            {product.featured && (
              <Badge
                text="Featured"
                tone="primary"
                className="absolute left-3 top-3"
              />
            )}
            {product.stock <= 0 && (
              <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  Out of stock
                </span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col">
            {product.category_name && (
              <span className="text-[11px] font-medium uppercase tracking-wide text-indigo-600">
                {product.category_name}
              </span>
            )}
            <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">
              {product.name}
            </h3>
            <div className="mt-1.5">
              <Stars rating={product.avg_rating} count={product.review_count} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-slate-500">
              {product.description}
            </p>

            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              {formatPrice(product.price)}
            </p>

            <p
              className={cx(
                "mt-1 text-xs font-medium",
                product.stock > 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Currently unavailable"}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <QuantityStepper
                value={qty}
                onChange={setQty}
                max={product.stock}
                disabled={product.stock <= 0}
              />
              <Button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className="flex-1"
              >
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <WishlistButton productId={product.id} variant="detail" />
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" /> View details
              </Link>
            </div>

            <p className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <Truck className="h-4 w-4 text-indigo-500" /> Free delivery on
              orders over Rs 999
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
