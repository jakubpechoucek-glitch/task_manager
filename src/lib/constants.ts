export const STAVY = {
  novy: { label: "Nový", barva: "bg-blue-100 text-blue-800" },
  v_reseni: { label: "V řešení", barva: "bg-yellow-100 text-yellow-800" },
  cekam: { label: "Čekám na odpověď", barva: "bg-purple-100 text-purple-800" },
  blokovano: { label: "Blokováno", barva: "bg-red-100 text-red-800" },
  hotovo: { label: "Hotovo", barva: "bg-green-100 text-green-800" },
} as const;

export const LOKACE = {
  praha: { label: "Praha", emoji: "🇨🇿" },
  manila: { label: "Manila", emoji: "🇵🇭" },
  kdekoliv: { label: "Kdekoliv", emoji: "🌍" },
} as const;

export const PRIORITY = {
  nizka: { label: "Nízká", barva: "text-gray-500" },
  normalni: { label: "Normální", barva: "text-blue-600" },
  vysoka: { label: "Vysoká", barva: "text-red-600" },
} as const;

export const ZDROJE = {
  rucni: { label: "Ručně", emoji: "✏️" },
  gmail: { label: "Gmail", emoji: "📧" },
  kalendar: { label: "Kalendář", emoji: "📅" },
} as const;
