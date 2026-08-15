"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { cx } from "@/components/ui";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: LayoutGrid },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { ids } = useWishlist();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          const badge =
            link.href === "/cart"
              ? count
              : link.href === "/wishlist"
                ? ids.size
                : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
