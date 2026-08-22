import Link from "next/link";
import { LEGAL_INFO } from "@/lib/legalInfo";

const LEGAL_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" },
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terminos", label: "Términos" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} {LEGAL_INFO.tradeName} · {LEGAL_INFO.fullName} · NIF {LEGAL_INFO.nif}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-zinc-500 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
