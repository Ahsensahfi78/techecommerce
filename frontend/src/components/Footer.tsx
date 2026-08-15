import Link from "next/link";
import {
  AtSign,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
  Truck,
} from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "Featured", href: "/products?featured=true" },
      { label: "My orders", href: "/account" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Returns & refunds", href: "/returns" },
      { label: "Shipping info", href: "/contact" },
      { label: "Track order", href: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Terms & privacy", href: "/about" },
    ],
  },
];

const perks = [
  {
    icon: Truck,
    title: "Fast delivery",
    text: "Free shipping on orders over Rs 999",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    text: "COD, cards & UPI — fully protected",
  },
  {
    icon: CreditCard,
    title: "Easy returns",
    text: "7-day no-questions-asked returns",
  },
];

const socials = [
  { icon: Globe, label: "Website", href: "#" },
  { icon: AtSign, label: "Social", href: "#" },
  { icon: MessageCircle, label: "Community", href: "#" },
  { icon: Play, label: "Videos", href: "#" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Perks strip */}
        <div className="grid gap-6 border-b border-slate-800 py-8 sm:grid-cols-3">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div key={perk.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{perk.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{perk.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Truck className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Tech<span className="text-indigo-400">Mos</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Your one-stop shop for the latest tech, fashion, home goods and
              more. Fast delivery, easy returns, always in stock.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-400" /> 4th Floor, Tower B,
                Indiranagar, Bengaluru
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" /> support@techmos.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-400" /> +94 077 1234 184
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-indigo-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 py-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TechMos. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-indigo-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
