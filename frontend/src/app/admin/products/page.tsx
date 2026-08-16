"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Pencil, Search, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, EmptyState, ErrorState, Skeleton, inputClass } from "@/components/ui";
import { useToast } from "@/lib/toast-context";
import { api, ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product, ProductPage } from "@/lib/types";

export default function AdminProductsPage() {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setProducts(null);
    setError(null);
    api<ProductPage>("/api/products?page_size=100")
      .then((p) => setProducts(p.items))
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const doDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    try {
      await api(`/api/products/${confirmId}`, { method: "DELETE", auth: true });
      setConfirmId(null);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">
            {filtered?.length ?? 0} of {products?.length ?? 0} products
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {error && (
        <div className="mt-5">
          <ErrorState message={error} />
        </div>
      )}
      {!error && !products && (
        <div className="mt-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      )}
      {!error && products && filtered && filtered.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No products found"
            subtitle="Add your first product to get started."
            action={
              <Link href="/admin/products/new">
                <Button className="mt-2">Add product</Button>
              </Link>
            }
          />
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-[10px] text-slate-300">
                            img
                          </div>
                        )}
                        <span className="max-w-48 truncate font-semibold text-slate-900">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.category_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.supplier_name ?? (
                        <span className="text-slate-300">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          p.stock === 0
                            ? "text-rose-600"
                            : p.stock < 10
                              ? "text-amber-600"
                              : "text-slate-900"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.stock === 0 ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Out of stock
                        </span>
                      ) : p.featured ? (
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          Featured
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => router.push(`/admin/products/${p.id}`)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(p.id)}
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete product?"
        message="This product will be permanently removed. This action cannot be undone."
        busy={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
