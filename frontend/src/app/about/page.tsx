import type { Metadata } from "next";
import { Boxes, Headset, RefreshCw, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "About us — TechMos",
  description:
    "Learn about TechMos, your one-stop shop for the latest tech, fashion, home goods and more.",
};

const values = [
  {
    icon: Truck,
    title: "Fast delivery",
    text: "We ship orders quickly across the island so you get your gear when you need it.",
  },
  {
    icon: RefreshCw,
    title: "Easy returns",
    text: "Changed your mind? Returns are simple, no-questions-asked within 14 days.",
  },
  {
    icon: Headset,
    title: "Real support",
    text: "Our friendly support team is here to help before, during and after your purchase.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50">
          <Boxes className="h-7 w-7 text-indigo-600" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">About TechMos</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Your one-stop shop for the latest tech, fashion, home goods and more —
          with fast delivery and easy returns.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Who we are</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            TechMos started with a simple idea: shopping for tech should be
            effortless. What began as a small online electronics store has grown
            into a full marketplace offering everything from smartphones and
            laptops to fashion and home essentials.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We hand-pick every product we sell, work directly with trusted
            suppliers, and keep our prices honest. Our goal is simple — give you
            great products at great prices, delivered quickly and backed by
            support that actually helps.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Why shop with us</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-indigo-50">
                  <v.icon className="h-5 w-5 text-indigo-600" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {v.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Our promise</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Every order comes with genuine products, secure checkout, and a
            14-day money-back guarantee. If something is not right, we will make
            it right — that is the TechMos way.
          </p>
        </div>
      </div>
    </div>
  );
}
