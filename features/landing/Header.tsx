"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/precios", label: "Precios" },
  { href: "/casos-de-exito", label: "Casos de éxito" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Growth<span className="text-brand-500">OS</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md text-sm text-zinc-600 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-md text-sm font-medium text-zinc-600 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Iniciar sesión
          </Link>
          <Link href="/signup">
            <Button>Empezar gratis</Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:hidden"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-4 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2 text-sm text-zinc-600 outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-zinc-600 outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            >
              Iniciar sesión
            </Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)}>
              <Button className="w-full">Empezar gratis</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
