"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h3.5v-5.5a1 1 0 011-1h3a1 1 0 011 1V20H18a1 1 0 001-1v-9"
      />
    ),
  },
  {
    href: "/marketplace",
    label: "Mejoras",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 2L4.5 13.5H11L10 22l9-12h-6.5L13 2z"
      />
    ),
  },
  {
    href: "/account",
    label: "Cuenta",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path strokeLinecap="round" d="M4.5 20c0-4.14 3.36-7 7.5-7s7.5 2.86 7.5 7" />
      </>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-white/95 backdrop-blur sm:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500",
              active ? "text-brand-500" : "text-zinc-500",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={active ? 2.25 : 2}
            >
              {tab.icon}
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
