"use client";

import { useEffect, useState } from "react";
import { getTimeGreeting } from "@/lib/greeting";

export function Greeting({ name }: { name: string }) {
  // Se calcula en el navegador porque el servidor corre en UTC: si lo
  // calculáramos en el servidor, un usuario en España vería "Buenas noches"
  // a media tarde. No se renderiza nada hasta montar, para evitar un
  // desajuste de hidratación entre servidor y cliente.
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  if (!greeting) return null;

  const firstName = name.split(" ")[0];

  return (
    <p className="text-sm text-zinc-600">
      {greeting}, {firstName}
    </p>
  );
}
