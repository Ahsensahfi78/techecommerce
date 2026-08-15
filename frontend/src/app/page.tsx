"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Headset,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import {
  ErrorState,
  SkeletonProductGrid,
  SectionHeading,
  buttonStyles,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { Category, Product, ProductPage } from "@/lib/types";

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<ProductPage>("/api/products?featured=true&sort=newest&page_size=8")
        .then((p) => p.items)
        .catch((e) => {
          setError(e.message);
          return [];
        }),
      api<Category[]>("/api/categories").catch(() => []),
    ]).then(([prods, cats]) => {
      setFeatured(prods);
      setCategories(cats);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> New season collection is live
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Everything you love,
              <br />
              delivered to your door.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-indigo-100">
              Discover thousands of quality products across tech, fashion, home
              and more — at prices you will love.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse featured
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                { value: "10k+", label: "Products" },
                { value: "50k+", label: "Happy customers" },
                { value: "4.8★", label: "Average rating" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold text-white">{s.value}</dt>
                  <dd className="mt-0.5 text-xs text-indigo-200">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by category"
          subtitle="Find exactly what you're looking for"
          action={
            <Link
              href="/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          }
        />
        <div className="mt-5 flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Featured products"
          subtitle="Hand-picked picks from the new collection"
          action={
            <Link
              href="/products?featured=true"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              See all →
            </Link>
          }
        />

        {error && <div className="mt-6"><ErrorState message={error} /></div>}
        {!error && !featured && (
          <div className="mt-6">
            <SkeletonProductGrid count={8} />
          </div>
        )}
        {!error && featured && featured.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No featured products yet.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured?.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Limited time offer
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Up to 30% off electronics
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Refresh your setup with the latest gadgets and accessories.
                Offer valid while stocks last.
              </p>
            </div>
            <Link href="/products?category=1" className={buttonStyles({ size: "lg", className: "shrink-0" })}>
              Grab the deal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              icon: Truck,
              title: "Fast shipping",
              text: "Free delivery on orders over Rs 999, right to your door.",
            },
            {
              icon: ShieldCheck,
              title: "Secure checkout",
              text: "Your payment details are always safe and encrypted.",
            },
            {
              icon: RotateCcw,
              title: "Easy returns",
              text: "Changed your mind? 7-day hassle-free returns.",
            },
            {
              icon: Headset,
              title: "24/7 support",
              text: "Our team is always here to help you out.",
            },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{b.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
