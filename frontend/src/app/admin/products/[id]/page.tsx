"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/app/admin/products/ProductForm";
import type { ProductFormData } from "@/app/admin/products/ProductForm";
import { ErrorState, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<Product>(`/api/products/${id}`)
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [id]);

  const submit = async (data: ProductFormData) => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/products/${id}`, { method: "PUT", body: data, auth: true });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update product");
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!product) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h2 className="mt-3 text-lg font-bold text-slate-900">Edit product</h2>
      <p className="text-sm text-slate-500">Update #{product.id} — {product.name}</p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <ProductForm
          initial={product}
          onSubmit={submit}
          submitLabel="Save changes"
          busy={busy}
        />
      </div>
    </div>
  );
}
