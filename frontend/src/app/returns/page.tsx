import type { Metadata } from "next";
import { PackageSearch, RefreshCw, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns — TechMos",
  description:
    "TechMos return policy. Easy, no-questions-asked returns within 14 days of delivery.",
};

const steps = [
  {
    title: "1. Request a return",
    text: "Contact us via the contact page or email support@techmos.lk within 14 days of delivery with your order number.",
  },
  {
    title: "2. Pack the item",
    text: "Pack the product in its original packaging with all accessories, tags and the invoice included.",
  },
  {
    title: "3. Ship it back",
    text: "We will send you a prepaid return label or arrange a courier pickup at your convenience.",
  },
  {
    title: "4. Get your refund",
    text: "Once we receive and check the item, your refund is processed within 3–5 business days to your original payment method.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50">
          <RefreshCw className="h-7 w-7 text-indigo-600" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Returns &amp; refunds</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Changed your mind? No problem. Returns are simple and free within 14
          days of delivery.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">How returns work</h2>
          <ol className="mt-5 space-y-5">
            {steps.map((s) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                  {s.title.split(".")[0]}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {s.title.split(".").slice(1).join(".")}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              14-day no-questions-asked returns
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Most items can be returned within 14 days of delivery for a full
              refund, as long as they are unused and in their original packaging.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50">
              <Wallet className="h-5 w-5 text-amber-600" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              Damaged or faulty items
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              If your item arrives damaged or faulty, contact us within 48 hours
              and we will replace it or refund you in full, including delivery.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50">
            <PackageSearch className="h-5 w-5 text-rose-600" />
          </span>
          <h2 className="mt-3 text-lg font-bold text-slate-900">
            What cannot be returned
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            For hygiene and safety reasons, we cannot accept returns of used
            personal-care items, opened consumables, or software that has been
            activated. Digital downloads and gift cards are also non-returnable.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400">
          Questions about a return? Reach us at support@techmos.lk or via our{" "}
          <a href="/contact" className="text-indigo-600 hover:text-indigo-700">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
