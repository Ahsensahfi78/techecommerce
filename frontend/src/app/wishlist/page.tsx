"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import {
  Breadcrumb,
  Button,
  EmptyState,
  ErrorState,
  SkeletonProductGrid,
} from "@/components/ui";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <Heart className="h-6 w-6 fill-current" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My wishlist
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Products you&apos;ve saved for later.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorState message={error} />
        </div>
      )}
      {!error && !products && (
        <div className="mt-8">
          <SkeletonProductGrid count={8} />
        </div>
      )}
      {!error && products && products.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Your wishlist is empty"
            subtitle="Tap the heart on any product to save it here."
            action={
              <Link href="/products">
                <Button className="mt-2">Browse products</Button>
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
