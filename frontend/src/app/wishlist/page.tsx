"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { api, getToken, getUser } from "@/lib/api";
import type { Product, User } from "@/lib/types";

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser() as User | null;
    if (!getToken() || !u) {
      router.replace(`/login?redirect=${encodeURIComponent("/wishlist")}`);
      return;
    }
    api<Product[]>("/api/wishlist", { auth: true })
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
        My wishlist
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Products you&apos;ve saved for later.
      </p>

      {error && <div className="mt-6"><ErrorState message={error} /></div>}
      {!error && !products && <Spinner />}
      {!error && products && products.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Your wishlist is empty"
            subtitle="Tap the heart on any product to save it here."
            action={
              <Link
                href="/products"
                className="mt-2 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Browse products
              </Link>
            }
          />
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
