"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import {
  Breadcrumb,
  Button,
  Chip,
  Drawer,
  EmptyState,
  ErrorState,
  Pagination,
  SkeletonProductGrid,
  buttonStyles,
  inputClass,
} from "@/components/ui";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, Product, ProductPage } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "", label: "Name A–Z" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
];

const PAGE_SIZE = 12;

function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const low = Math.min(valueMin, max);
  const high = Math.max(valueMax, min);
  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100;

  return (
    <div>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-indigo-500"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        <div className="dual-range relative h-full">
          <input
            type="range"
            min={min}
            max={max}
            step={100}
            value={low}
            onChange={(e) => onChange(Number(e.target.value), high)}
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={100}
            value={high}
            onChange={(e) => onChange(low, Number(e.target.value))}
            aria-label="Maximum price"
          />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-xs font-medium text-slate-600">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
      </div>
    </div>
  );
}

function ProductsContent() {
  const params = useSearchParams();

  const [products, setProducts] = useState<Product[] | null>(null);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const search = params.get("search") ?? "";
  const featured = params.get("featured") === "true";

  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [sliderBound, setSliderBound] = useState(0);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(debounceRef.current);
  }, []);

  const resetPage = () => setPage(1);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (featured) q.set("featured", "true");
    if (category) q.set("category", category);
    if (sort) q.set("sort", sort);
    if (minPrice) q.set("min_price", minPrice);
    if (maxPrice) q.set("max_price", maxPrice);
    q.set("page", String(page));
    q.set("page_size", String(PAGE_SIZE));
    return `/api/products?${q.toString()}`;
  }, [search, featured, category, sort, minPrice, maxPrice, page]);

  const commitPrice = (lo: number, hi: number) => {
    setSliderMin(lo);
    setSliderMax(hi);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setMinPrice(lo > 0 ? String(lo) : "");
      setMaxPrice(hi < sliderBound ? String(hi) : "");
      resetPage();
    }, 250);
  };

  const clearPrice = () => {
    setSliderMin(0);
    setSliderMax(sliderBound);
    setMinPrice("");
    setMaxPrice("");
    resetPage();
  };

  useEffect(() => {
    setProducts(null);
    setError(null);
    api<ProductPage>(query)
      .then((p) => {
        setProducts(p.items);
        setPages(p.pages);
        setTotal(p.total);
      })
      .catch((e) => setError(e.message));
  }, [query]);

  useEffect(() => {
    api<Category[]>("/api/categories")
      .then(setCategories)
      .catch(() => {});
    api<ProductPage>("/api/products?sort=price_desc&page_size=1")
      .then((p) => {
        const bound = p.items[0] ? Math.ceil(p.items[0].price / 100) * 100 : 0;
        setSliderBound(bound);
        setSliderMax(bound);
      })
      .catch(() => {});
  }, []);

  const clearFilters = () => {
    setCategory("");
    setSort("");
    clearPrice();
  };

  const hasFilters = category || sort || minPrice || maxPrice;

  const filters = (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">Category</h4>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              name="category"
              checked={category === ""}
              onChange={() => {
                setCategory("");
                resetPage();
              }}
              className="h-4 w-4 accent-indigo-600"
            />
            All categories
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="category"
                checked={category === String(c.id)}
                onChange={() => {
                  setCategory(String(c.id));
                  resetPage();
                }}
                className="h-4 w-4 accent-indigo-600"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">Price range</h4>
          {(minPrice || maxPrice) && (
            <button
              onClick={clearPrice}
              className="text-xs font-medium text-rose-500 hover:text-rose-600"
            >
              Reset
            </button>
          )}
        </div>
        <div className="mt-3">
          {sliderBound > 0 ? (
            <PriceRangeSlider
              min={0}
              max={sliderBound}
              valueMin={sliderMin}
              valueMax={sliderMax || sliderBound}
              onChange={commitPrice}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Min</label>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    resetPage();
                  }}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Max</label>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    resetPage();
                  }}
                  placeholder="50000"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          <X className="h-3.5 w-3.5" /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: featured
              ? "Featured products"
              : search
                ? `Results for "${search}"`
                : "All products",
          },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {featured
              ? "Featured products"
              : search
                ? `Results for "${search}"`
                : "All products"}
          </h1>
          {!error && products && (
            <p className="mt-1 text-sm text-slate-500">
              {total} product{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className={buttonStyles({
              variant: "outline",
              size: "sm",
              className: "lg:hidden h-10 px-4",
            })}
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
          <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                resetPage();
              }}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip
            active
            onClick={clearFilters}
            className="bg-slate-100 text-slate-600 ring-1 ring-slate-200"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </Chip>
          {category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
              {categories.find((c) => String(c.id) === category)?.name ??
                `Category ${category}`}
            </span>
          )}
          {minPrice && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              From {formatPrice(Number(minPrice))}
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              To {formatPrice(Number(maxPrice))}
            </span>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            {filters}
          </div>
        </aside>

        <div>
          {error && <ErrorState message={error} />}
          {!error && !products && <SkeletonProductGrid count={8} />}
          {!error && products && products.length === 0 && (
            <EmptyState
              title="No products found"
              subtitle="Try adjusting your search or filters."
              action={
                <Button onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              }
            />
          )}
          {!error && products && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={page} pages={pages} onPage={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters"
      >
        {filters}
      </Drawer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-sm text-slate-400">
          Loading…
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
