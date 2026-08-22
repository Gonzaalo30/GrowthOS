// Lista curada (no las ~195 del mundo) centrada en los mercados donde tiene
// sentido que factures hoy: España primero, resto de habla hispana y algunos
// mercados europeos/anglosajones comunes. Ampliable sin tocar nada más si
// hace falta.
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "ES", name: "España" },
  { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Perú" },
  { code: "PT", name: "Portugal" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Alemania" },
  { code: "IT", name: "Italia" },
  { code: "GB", name: "Reino Unido" },
  { code: "US", name: "Estados Unidos" },
];

export function countryName(code: string | null | undefined): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? "España";
}
