"use client";

import { useState } from "react";
import { Ukol } from "@/types";
import { STAVY, LOKACE, PRIORITY, ZDROJE } from "@/lib/constants";

interface Props {
  ukol: Ukol;
  onUpdate: (id: number, data: Partial<Ukol>) => void;
  onDelete: (id: number) => void;
}

const STAVY_MOZNOSTI = ["novy", "v_reseni", "cekam", "blokovano", "hotovo"] as const;

export default function UkolKarta({ ukol, onUpdate, onDelete }: Props) {
  const [rozsireno, setRozsireno] = useState(false);

  const stav = STAVY[ukol.stav as keyof typeof STAVY];
  const lokace = LOKACE[ukol.lokace as keyof typeof LOKACE];
  const priorita = PRIORITY[ukol.priorita as keyof typeof PRIORITY];
  const zdroj = ZDROJE[ukol.zdroj as keyof typeof ZDROJE];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stav.barva}`}>
              {stav.label}
            </span>
            <span className="text-xs text-gray-500">
              {lokace.emoji} {lokace.label}
            </span>
            <span className={`text-xs font-medium ${priorita.barva}`}>
              {priorita.label}
            </span>
            <span className="text-xs text-gray-400">
              {zdroj.emoji} {zdroj.label}
            </span>
          </div>
          <h3 className="font-medium text-gray-900 truncate">{ukol.nazev}</h3>
          {ukol.popis && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ukol.popis}</p>
          )}
          {ukol.deadline && (
            <p className="text-xs text-orange-600 mt-1">
              📅 Do: {new Date(ukol.deadline).toLocaleDateString("cs-CZ")}
            </p>
          )}
        </div>
        <button
          onClick={() => setRozsireno(!rozsireno)}
          className="text-gray-400 hover:text-gray-600 shrink-0 p-1"
        >
          {rozsireno ? "▲" : "▼"}
        </button>
      </div>

      {rozsireno && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Změnit stav:</span>
            {STAVY_MOZNOSTI.map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(ukol.id, { stav: s })}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  ukol.stav === s
                    ? STAVY[s].barva + " border-transparent"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {STAVY[s].label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(ukol.id)}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Smazat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
