"use client";

import { useEffect, useState, useCallback } from "react";
import { Ukol, NavrhUkolu, Lokace } from "@/types";
import { STAVY } from "@/lib/constants";
import UkolKarta from "@/components/UkolKarta";
import NavrhKarta from "@/components/NavrhKarta";
import NovyUkolModal from "@/components/NovyUkolModal";

type LokaceFiltr = "vse" | Lokace;

export default function Dashboard() {
  const [ukoly, setUkoly] = useState<Ukol[]>([]);
  const [navrhy, setNavrhy] = useState<NavrhUkolu[]>([]);
  const [lokaceFiltr, setLokaceFiltr] = useState<LokaceFiltr>("vse");
  const [zobrazitHotove, setZobrazitHotove] = useState(false);
  const [modalOtevren, setModalOtevren] = useState(false);
  const [posledniSync, setPosledniSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [importujuHistorii, setImportujuHistorii] = useState(false);

  const nactiUkoly = useCallback(async () => {
    const params = new URLSearchParams();
    if (lokaceFiltr !== "vse") params.set("lokace", lokaceFiltr);
    if (zobrazitHotove) params.set("stav", "hotovo");
    const res = await fetch(`/api/ukoly?${params}`);
    const data = await res.json();
    setUkoly(data);
  }, [lokaceFiltr, zobrazitHotove]);

  const nactiNavrhy = useCallback(async () => {
    const res = await fetch("/api/navrhy");
    const data = await res.json();
    setNavrhy(data);
  }, []);

  const nactiSyncLog = useCallback(async () => {
    const res = await fetch("/api/sync");
    const data = await res.json();
    if (data.length > 0) {
      setPosledniSync(new Date(data[0].cas).toLocaleString("cs-CZ"));
    }
  }, []);

  useEffect(() => {
    nactiUkoly();
    nactiNavrhy();
    nactiSyncLog();
  }, [nactiUkoly, nactiNavrhy, nactiSyncLog]);

  const handleImportHistorie = async (dnu: number) => {
    setImportujuHistorii(true);
    await fetch("/api/sync/historie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dnu }),
    });
    await Promise.all([nactiNavrhy(), nactiSyncLog()]);
    setImportujuHistorii(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetch("/api/sync", { method: "POST" });
    await Promise.all([nactiNavrhy(), nactiSyncLog()]);
    setSyncing(false);
  };

  const handleUlozitUkol = async (data: {
    nazev: string;
    popis: string;
    lokace: string;
    priorita: string;
    deadline: string;
  }) => {
    await fetch("/api/ukoly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setModalOtevren(false);
    await nactiUkoly();
  };

  const handleUpdateUkol = async (id: number, data: Partial<Ukol>) => {
    await fetch(`/api/ukoly/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await nactiUkoly();
  };

  const handleDeleteUkol = async (id: number) => {
    await fetch(`/api/ukoly/${id}`, { method: "DELETE" });
    await nactiUkoly();
  };

  const handleSchvalitNavrh = async (id: number) => {
    await fetch(`/api/navrhy/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await Promise.all([nactiNavrhy(), nactiUkoly()]);
  };

  const handleSmazatNavrh = async (id: number) => {
    await fetch(`/api/navrhy/${id}`, { method: "DELETE" });
    await nactiNavrhy();
  };

  const ukolyDleStavu = (stav: string) =>
    ukoly.filter((u) => u.stav === stav);

  const statistiky = {
    celkem: ukoly.length,
    vysoka: ukoly.filter((u) => u.priorita === "vysoka" && u.stav !== "hotovo").length,
    blokovano: ukoly.filter((u) => u.stav === "blokovano").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hlavička */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">📋 Task Manager</h1>
            {navrhy.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {navrhy.length} ke schválení
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {posledniSync && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Sync: {posledniSync}
              </span>
            )}
            <button
              onClick={() => handleImportHistorie(45)}
              disabled={importujuHistorii}
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Jednorázový import posledních 45 dní z Gmailu"
            >
              {importujuHistorii ? "⏳" : "📥"} Import historie
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {syncing ? "⏳" : "🔄"} Synchronizovat
            </button>
            <button
              onClick={() => setModalOtevren(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              + Nový úkol
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistiky */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistiky.celkem}</div>
            <div className="text-sm text-gray-500">Celkem aktivních</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statistiky.vysoka}</div>
            <div className="text-sm text-gray-500">Vysoká priorita</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statistiky.blokovano}</div>
            <div className="text-sm text-gray-500">Blokováno</div>
          </div>
        </div>

        {/* Návrhy ke schválení */}
        {navrhy.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">
              ⏳ Ke schválení ({navrhy.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {navrhy.map((n) => (
                <NavrhKarta
                  key={n.id}
                  navrh={n}
                  onSchvalit={handleSchvalitNavrh}
                  onSmazat={handleSmazatNavrh}
                />
              ))}
            </div>
          </section>
        )}

        {/* Filtry lokace */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["vse", "manila", "praha", "kdekoliv"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLokaceFiltr(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                lokaceFiltr === l
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {l === "vse" && "🌐 Vše"}
              {l === "manila" && "🇵🇭 Manila"}
              {l === "praha" && "🇨🇿 Praha"}
              {l === "kdekoliv" && "🌍 Kdekoliv"}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setZobrazitHotove(!zobrazitHotove)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                zobrazitHotove
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              ✓ Hotové
            </button>
          </div>
        </div>

        {/* Sloupce úkolů */}
        {zobrazitHotove ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ukolyDleStavu("hotovo").map((u) => (
              <UkolKarta key={u.id} ukol={u} onUpdate={handleUpdateUkol} onDelete={handleDeleteUkol} />
            ))}
            {ukolyDleStavu("hotovo").length === 0 && (
              <p className="text-gray-400 text-sm col-span-3 text-center py-8">Žádné hotové úkoly.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-4">
            {(["novy", "v_reseni", "cekam", "blokovano"] as const).map((stav) => (
              <div key={stav}>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STAVY[stav].barva}`}>
                    {STAVY[stav].label}
                  </span>
                  <span className="text-gray-400">{ukolyDleStavu(stav).length}</span>
                </h2>
                <div className="space-y-3">
                  {ukolyDleStavu(stav).map((u) => (
                    <UkolKarta
                      key={u.id}
                      ukol={u}
                      onUpdate={handleUpdateUkol}
                      onDelete={handleDeleteUkol}
                    />
                  ))}
                  {ukolyDleStavu(stav).length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 text-xs">
                      Prázdné
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOtevren && (
        <NovyUkolModal
          onClose={() => setModalOtevren(false)}
          onUlozit={handleUlozitUkol}
        />
      )}
    </div>
  );
}
