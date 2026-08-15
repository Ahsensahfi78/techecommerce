"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api, getToken } from "@/lib/api";
import type { Product } from "@/lib/types";

interface WishlistContextValue {
  ids: Set<number>;
  loading: boolean;
  toggle: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!getToken()) {
      setIds(new Set());
      setLoading(false);
      return;
    }
    try {
      const products = await api<Product[]>("/api/wishlist", { auth: true });
      setIds(new Set(products.map((p) => p.id)));
    } catch {
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener("shopease-auth-changed", reload);
    return () => window.removeEventListener("shopease-auth-changed", reload);
  }, [reload]);

  const toggle = useCallback(
    async (productId: number): Promise<boolean> => {
      if (!getToken()) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return false;
      }
      const exists = ids.has(productId);
      try {
        if (exists) {
          await api(`/api/wishlist/${productId}`, { method: "DELETE", auth: true });
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        } else {
          await api("/api/wishlist", {
            method: "POST",
            body: { product_id: productId },
            auth: true,
          });
          setIds((prev) => new Set(prev).add(productId));
        }
        return !exists;
      } catch {
        return exists;
      }
    },
    [ids, router]
  );

  const isInWishlist = useCallback((productId: number) => ids.has(productId), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, loading, toggle, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
