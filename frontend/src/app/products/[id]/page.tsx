"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Info, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { ReviewsSection } from "@/components/Reviews";
import { WishlistButton } from "@/components/WishlistButton";
import {
  Badge,
  Breadcrumb,
  ErrorState,
  SkeletonProductGrid,
  SectionHeading,
  Stars,
} from "@/components/ui";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product, ProductPage } from "@/lib/types";

const perks = [
  { icon: Truck, text: "Free delivery over Rs 999" },
  { icon: RotateCcw, text: "7-day easy returns" },
  { icon: ShieldCheck, text: "Secure payment & COD" },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setProduct(null);
    setError(null);
    api<Product>(`/api/products/${id}`)
      .then((p) => {
        setProduct(p);
        if (p.category_id) {
          api<ProductPage>(`/api/products?category=${p.category_id}&page_size=5`).then(
            (page) =>
              setRelated(page.items.filter((r) => r.id !== p.id).slice(0, 4))
          );
        }
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message={error} />
        <div className="mt-6 text-center">
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-slate-100" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-8 w-3/4 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(product.category_name
            ? [
                {
                  label: product.category_name,
                  href: `/products?category=${product.category_id}`,
                },
              ]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="grid aspect-square w-full place-items-center text-slate-300">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category_name && (
            <Link
              href={`/products?category=${product.category_id}`}
              className="text-xs font-semibold uppercase tracking-wide text-indigo-600 hover:text-indigo-700"
            >
              {product.category_name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.featured && <Badge text="Featured" tone="primary" />}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge text={`Only ${product.stock} left`} tone="warning" />
            )}
          </div>

          <div className="mt-3">
            <Stars rating={product.avg_rating} count={product.review_count} />
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">
            {product.description ||
              "A great product from TechMos — quality you can trust."}
          </p>

          <div className="mt-6 flex items-center gap-2">
            {inStock ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  In stock ({product.stock} available)
                </span>
              </>
            ) : (
              <>
                <Info className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-medium text-rose-600">
                  Out of stock
                </span>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 sm:flex-none">
              <AddToCartButton product={product} />
            </div>
            <WishlistButton productId={product.id} variant="detail" />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <h3 className="font-semibold text-slate-900">
              Why buy from TechMos?
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <li key={perk.text} className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-indigo-500" />
                    {perk.text}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection productId={product.id} />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            title="You may also like"
            subtitle="More picks in this category"
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
