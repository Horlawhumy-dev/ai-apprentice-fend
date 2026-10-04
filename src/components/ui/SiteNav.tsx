"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/expert", label: "Capture", icon: "monitor" },
  { href: "/work-map/latest", label: "Work Map", icon: "map" },
  { href: "/apprentice", label: "Apprentice", icon: "graduation" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-5 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-strong text-white shadow-lg shadow-brand/25 transition-transform duration-300 group-hover:scale-105">
            <Icon name="sparkles" size={17} filled />
          </span>
          <span className="hidden text-[0.95rem] font-semibold tracking-tight sm:block">AI Apprentice</span>
        </Link>

        <span className="mx-1 hidden h-5 w-px bg-line-strong md:block" />

        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto sm:gap-1">
          {links.map((l) => {
            // "/work-map/latest" redirects to a real id, so match the whole section.
            const section = l.href.endsWith("/latest") ? l.href.replace(/\/latest$/, "") : l.href;
            const active = pathname === l.href || pathname.startsWith(`${section}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-soft text-brand-strong"
                    : "text-muted hover:bg-surface-inset hover:text-ink"
                }`}
              >
                <Icon name={l.icon} size={14} />
                <span className="whitespace-nowrap">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <span className="hidden items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-xs text-muted lg:flex">
          <span className="size-1.5 rounded-full bg-warn" />
          Prototype
        </span>
      </div>
    </header>
  );
}

export default SiteNav;
