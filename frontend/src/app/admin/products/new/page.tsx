"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductForm } from "@/app/admin/products/ProductForm";
import { api, ApiError } from "@/lib/api";

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number | null;
  featured: boolean;
};

export default function NewProductPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: ProductFormData) => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/products", { method: "POST", body: data, auth: true });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create product");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Add product</h2>
          <p className="text-sm text-slate-500">Create a new product listing.</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <ProductForm
          onSubmit={submit}
          submitLabel="Create product"
          busy={busy}
        />
      </div>
    </div>
  );
}
