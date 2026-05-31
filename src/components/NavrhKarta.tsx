"use client";

import { NavrhUkolu } from "@/types";
import { LOKACE, ZDROJE } from "@/lib/constants";

interface Props {
  navrh: NavrhUkolu;
  onSchvalit: (id: number) => void;
  onSmazat: (id: number) => void;
}

export default function NavrhKarta({ navrh, onSchvalit, onSmazat }: Props) {
  const lokace = LOKACE[navrh.lokace as keyof typeof LOKACE];
  const zdroj = ZDROJE[navrh.zdroj as keyof typeof ZDROJE];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-amber-700 font-medium">
              {zdroj.emoji} {zdroj.label}
            </span>
            <span className="text-xs text-gray-500">
              {lokace.emoji} {lokace.label}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">{navrh.nazev}</h3>
          {navrh.popis && (
            <p className="text-sm text-gray-600 mt-1">{navrh.popis}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSchvalit(navrh.id)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
        >
          ✓ Přidat
        </button>
        <button
          onClick={() => onSmazat(navrh.id)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 rounded-lg transition-colors"
        >
          ✕ Ignorovat
        </button>
      </div>
    </div>
  );
}
