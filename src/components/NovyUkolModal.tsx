"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onUlozit: (data: {
    nazev: string;
    popis: string;
    lokace: string;
    priorita: string;
    deadline: string;
  }) => void;
}

export default function NovyUkolModal({ onClose, onUlozit }: Props) {
  const [nazev, setNazev] = useState("");
  const [popis, setPopis] = useState("");
  const [lokace, setLokace] = useState("kdekoliv");
  const [priorita, setPriority] = useState("normalni");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nazev.trim()) return;
    onUlozit({ nazev: nazev.trim(), popis, lokace, priorita, deadline });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nový úkol</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Název *
              </label>
              <input
                type="text"
                value={nazev}
                onChange={(e) => setNazev(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Co je potřeba udělat?"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis
              </label>
              <textarea
                value={popis}
                onChange={(e) => setPopis(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Podrobnosti..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokace
                </label>
                <select
                  value={lokace}
                  onChange={(e) => setLokace(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kdekoliv">🌍 Kdekoliv</option>
                  <option value="praha">🇨🇿 Praha</option>
                  <option value="manila">🇵🇭 Manila</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorita
                </label>
                <select
                  value={priorita}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nizka">Nízká</option>
                  <option value="normalni">Normální</option>
                  <option value="vysoka">Vysoká</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={!nazev.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Přidat úkol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
