"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { markNotificationsReadAction } from "@/app/actions/notifications";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { getLevelProgress } from "@/lib/levels";
import type { Database } from "@/types/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Centro de Mejoras" },
  { href: "/account", label: "Mi cuenta" },
];

export function AppHeader({
  notifications = [],
  avatarUrl,
  xp,
}: {
  notifications?: Notification[];
  avatarUrl?: string | null;
  xp?: number | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent("toggle-command-palette"));
  }

  function handleBellClick() {
    setBellOpen((v) => !v);
    if (!bellOpen && items.length > 0) {
      markNotificationsReadAction();
      setItems([]);
    }
  }

  return (
    <header className="relative border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-foreground">
            Growth<span className="text-brand-500">OS</span>
          </Link>
          {xp !== null && xp !== undefined && (
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <LevelBadge level={getLevelProgress(xp).level} />
              <span className="text-xs font-medium text-zinc-500">{xp} XP</span>
            </Link>
          )}
        </div>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md text-sm text-zinc-600 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {link.href === "/account" && avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- avatar viene de Supabase Storage, no de assets propios
                <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Abrir buscador de comandos"
            className="hidden items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs text-zinc-500 outline-none transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:flex"
          >
            Buscar
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-sans text-[10px]">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={handleBellClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                />
              </svg>
              {items.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                  {items.length}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-11 z-10 w-72 rounded-xl border border-border bg-white p-2 shadow-lg">
                {notifications.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-zinc-500">No tienes notificaciones.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {notifications.map((n) => (
                      <li key={n.id} className="rounded-lg px-2 py-2 text-sm text-zinc-700">
                        {n.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <form action={signOutAction} className="hidden sm:block">
            <button
              type="submit"
              className="rounded-md text-sm font-medium text-zinc-600 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Cerrar sesión
            </button>
          </form>

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
          <form action={signOutAction} className="mt-2 border-t border-border pt-3">
            <button
              type="submit"
              className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-zinc-600 outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            >
              Cerrar sesión
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
