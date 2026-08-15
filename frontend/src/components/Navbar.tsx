"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
} from "lucide-react";

import { useCart } from "@/lib/cart-context";
import { api, clearSession, getUser } from "@/lib/api";
import { formatPrice, initials } from "@/lib/format";
import type { ProductSuggest, User } from "@/lib/types";
import { buttonStyles, cx } from "@/components/ui";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/products?featured=true", label: "Featured" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggest[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUser() as User | null);
    setUserOpen(false);
    setSuggestOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggesting(true);
      try {
        const results = await api<ProductSuggest[]>(
          `/api/products/suggest?q=${encodeURIComponent(value.trim())}`
        );
        setSuggestions(results);
        setSuggestOpen(true);
      } catch {
        setSuggestions([]);
        setSuggestOpen(false);
      } finally {
        setSuggesting(false);
      }
    }, 250);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestOpen(false);
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setUserOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-600/30">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Tech<span className="text-indigo-600">Mos</span>
            </span>
          </Link>

          {/* Desktop search with suggestions */}
          <div
            ref={searchWrapRef}
            className="relative hidden flex-1 max-w-xl md:block"
          >
            <form
              onSubmit={submitSearch}
              className={cx(
                "flex items-center gap-2 rounded-full border bg-slate-50 px-4 py-2 transition",
                "focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100"
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                placeholder="Search products…"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              {suggesting && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-300" />
              )}
            </form>

            {suggestOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-fade-in">
                {suggestions.length === 0 && !suggesting ? (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    No products match “{search}”
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {suggestions.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/products/${s.id}`}
                          onClick={() => {
                            setSuggestOpen(false);
                            setSearch("");
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                        >
                          {s.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.image_url}
                              alt={s.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-[10px] text-slate-300">
                              img
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {s.name}
                            </p>
                            {s.category_name && (
                              <p className="text-xs text-slate-400">
                                {s.category_name}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {formatPrice(s.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop nav links */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const active =
                  link.href.split("?")[0] === pathname.split("?")[0] &&
                  link.href !== "/products?featured=true";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cx(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-indigo-600"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              href="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-600 px-1 text-[11px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex h-10 items-center gap-2 rounded-full pl-1 pr-3 transition-colors hover:bg-slate-100"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                    {initials(user.name)}
                  </span>
                  <span className="hidden text-sm font-medium text-slate-700 sm:block">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-fade-in">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <UserIcon className="h-4 w-4" /> My orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    {user.is_admin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Admin panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={buttonStyles({
                  size: "sm",
                  className: "hidden sm:inline-flex h-10 px-4",
                })}
              >
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden animate-fade-in">
          <form
            onSubmit={submitSearch}
            className="mb-3 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
          {suggestOpen && suggestions.length > 0 && (
            <ul className="mb-3 overflow-hidden rounded-xl border border-slate-200">
              {suggestions.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/products/${s.id}`}
                    onClick={() => {
                      setSuggestOpen(false);
                      setSearch("");
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {s.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image_url}
                        alt={s.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : null}
                    <span className="truncate">{s.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-1">
            <Link
              href="/products"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Shop all
            </Link>
            <Link
              href="/products?featured=true"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Featured
            </Link>
            <Link
              href="/wishlist"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Wishlist
            </Link>
            {user ? (
              <>
                <Link
                  href="/account"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My orders
                </Link>
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Admin panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
