"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { useWishlist } from "@/lib/wishlist-context";

export function WishlistButton({
  productId,
  variant = "card",
}: {
  productId: number;
  variant?: "card" | "detail";
}) {
  const { isInWishlist, toggle } = useWishlist();
  const [busy, setBusy] = useState(false);
  const active = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    await toggle(productId);
    setBusy(false);
  };

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full shadow-md transition-colors ${
          active
            ? "bg-rose-500 text-white"
            : "bg-white/90 text-slate-500 hover:text-rose-500"
        }`}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold transition-colors ${
        active
          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {active ? "In wishlist" : "Add to wishlist"}
    </button>
  );
}
