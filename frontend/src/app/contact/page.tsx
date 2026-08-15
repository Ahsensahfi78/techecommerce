import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact us — TechMos",
  description:
    "Get in touch with the TechMos support team. We are happy to help with orders, returns and anything else.",
};

const channels = [
  {
    icon: Mail,
    title: "Email",
    lines: ["support@techmos.lk", "We reply within 24 hours."],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+94 077 1234 184", "Mon–Sat, 9 AM – 6 PM"],
  },
  {
    icon: MapPin,
    title: "Visit us",
    lines: ["No. 498, Moulana Road", "Saithamaruthu 14, Sri Lanka"],
  },
  {
    icon: Clock,
    title: "Support hours",
    lines: ["Mon–Sat: 9 AM – 6 PM", "Sun: Closed"],
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50">
          <MessageSquare className="h-7 w-7 text-indigo-600" />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Contact us</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Questions about an order, a return, or a product? We are here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {channels.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50">
              <c.icon className="h-5 w-5 text-indigo-600" />
            </span>
            <h2 className="mt-3 text-sm font-bold text-slate-900">{c.title}</h2>
            {c.lines.map((line) => (
              <p key={line} className="mt-1 text-sm text-slate-600">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the form and we will get back to you within one business day.
        </p>
        <form
          action="mailto:support@techmos.lk"
          method="get"
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <input
            required
            name="subject"
            type="text"
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <input
            required
            type="email"
            placeholder="Your email"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <textarea
            required
            name="body"
            rows={4}
            placeholder="How can we help?"
            className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:col-span-2"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:col-span-2"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
