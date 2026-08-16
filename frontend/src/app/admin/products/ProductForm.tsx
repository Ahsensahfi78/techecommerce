"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";

import { api, apiUpload, assetUrl } from "@/lib/api";
import type { Category, Product, Supplier } from "@/lib/types";

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number | null;
  supplier_id: number | null;
  featured: boolean;
};

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function ProductForm({
  initial,
  onSubmit,
  submitLabel,
  busy,
}: {
  initial?: Product;
  onSubmit: (data: ProductFormData) => void;
  submitLabel: string;
  busy: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    stock: initial ? String(initial.stock) : "",
    image_url: initial?.image_url ?? "",
    category_id: initial?.category_id ? String(initial.category_id) : "",
    supplier_id: initial?.supplier_id ? String(initial.supplier_id) : "",
    featured: initial?.featured ?? false,
  });

  useEffect(() => {
    api<Category[]>("/api/categories").then(setCategories).catch(() => {});
    api<Supplier[]>("/api/suppliers", { auth: true })
      .then(setSuppliers)
      .catch(() => {});
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await apiUpload(file);
      setForm((f) => ({ ...f, image_url: assetUrl(result.url) }));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Try a JPG, PNG, WEBP, GIF or SVG file."
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock || "0", 10),
      image_url: form.image_url,
      category_id: form.category_id ? Number(form.category_id) : null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      featured: form.featured,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className={labelClass}>Product name *</label>
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Wireless Headphones"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={set("description")}
          placeholder="Describe the product…"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Price (Rs) *</label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={set("price")}
            placeholder="999"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Stock *</label>
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={set("stock")}
            placeholder="10"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.category_id}
            onChange={set("category_id")}
            className={inputClass}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className={labelClass}>Supplier</label>
          <select
            value={form.supplier_id}
            onChange={set("supplier_id")}
            className={inputClass}
          >
            <option value="">No supplier assigned</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.contact_name ? ` — ${s.contact_name}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Used for returns &amp; supplier enquiries.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Image</label>
        <div className="flex gap-3">
          <input
            value={form.image_url}
            onChange={set("image_url")}
            placeholder="Paste an image URL, or upload one"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={upload}
          />
        </div>
        {uploadError && (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{uploadError}</p>
        )}
        {form.image_url ? (
          <div className="relative mt-2 h-28 w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.image_url}
              alt="Preview"
              className="h-28 w-28 rounded-xl border border-slate-200 object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              onLoad={(e) => ((e.target as HTMLImageElement).style.display = "block")}
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white shadow hover:bg-rose-600"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px] font-medium">Add image</span>
          </button>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          className="h-4 w-4 accent-indigo-600"
        />
        <span className="text-sm font-medium text-slate-700">
          Featured on the storefront
        </span>
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
