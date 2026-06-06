import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { getPrijateMaily, getOdeslaneMaily, getNoveUdalostiKalendare } from "./google";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
}

function parseJSON(raw: string) {
  const text = raw.replace(/^```[a-z]*\n?/m, "").replace(/```\s*$/m, "").trim();
  return JSON.parse(text);
}

type Mail = { id: string; subject: string; from: string; to: string; snippet: string; date: string };
type Udalost = { id: string; nazev: string; popis: string; zacatek: string };
type NavrhVysledek = { zdrojId: string; nazev: string; popis: string; lokace: string; stav: string };

async function analyzujPrijatyeMaily(maily: Mail[]): Promise<NavrhVysledek[]> {
  if (!maily.length) return [];

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user", content: `Analyzuj příchozí emaily a rozhodni, zda každý vyžaduje akci.
Uživatel žije střídavě v Praze (ČR) a Manile (PH).

Emaily:
${maily.map((m, i) => `[${i + 1}] Od: ${m.from}\nPředmět: ${m.subject}\nÚryvek: ${m.snippet}`).join("\n\n")}

Vrať JSON pole (bez markdown):
[{"index":1,"vytvorit":true/false,"nazev":"...","popis":"...","lokace":"praha"|"manila"|"kdekoliv"}]`
    }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const vysledky: { index: number; vytvorit: boolean; nazev: string; popis: string; lokace: string }[] = parseJSON(raw);

  return vysledky
    .filter((v) => v.vytvorit && maily[v.index - 1])
    .map((v) => ({
      zdrojId: maily[v.index - 1].id,
      nazev: v.nazev,
      popis: v.popis,
      lokace: v.lokace,
      stav: "novy",
    }));
}

async function analyzujOdeslaneMaily(maily: Mail[]): Promise<NavrhVysledek[]> {
  if (!maily.length) return [];

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user", content: `Analyzuj odeslané emaily a rozhodni, zda uživatel čeká na odpověď nebo akci od druhé strany.
Uživatel žije střídavě v Praze (ČR) a Manile (PH).

Odeslané emaily:
${maily.map((m, i) => `[${i + 1}] Komu: ${m.to}\nPředmět: ${m.subject}\nÚryvek: ${m.snippet}`).join("\n\n")}

Vrať JSON pole (bez markdown) — jen maily kde uživatel čeká na odpověď nebo splnění:
[{"index":1,"vytvorit":true/false,"nazev":"Čekám na odpověď od [jméno] — [téma]","popis":"...","lokace":"praha"|"manila"|"kdekoliv"}]`
    }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const vysledky: { index: number; vytvorit: boolean; nazev: string; popis: string; lokace: string }[] = parseJSON(raw);

  return vysledky
    .filter((v) => v.vytvorit && maily[v.index - 1])
    .map((v) => ({
      zdrojId: maily[v.index - 1].id,
      nazev: v.nazev,
      popis: v.popis,
      lokace: v.lokace,
      stav: "cekam",
    }));
}

async function analyzujKalendar(udalosti: Udalost[]): Promise<NavrhVysledek[]> {
  if (!udalosti.length) return [];

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user", content: `Analyzuj události z kalendáře a rozhodni, zda každá vyžaduje přípravu nebo akci.
Uživatel žije střídavě v Praze (ČR) a Manile (PH).

Události:
${udalosti.map((u, i) => `[${i + 1}] Název: ${u.nazev}\nPopis: ${u.popis || "(prázdný)"}\nZačátek: ${u.zacatek}`).join("\n\n")}

Vrať JSON pole (bez markdown):
[{"index":1,"vytvorit":true/false,"nazev":"...","popis":"...","lokace":"praha"|"manila"|"kdekoliv"}]`
    }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const vysledky: { index: number; vytvorit: boolean; nazev: string; popis: string; lokace: string }[] = parseJSON(raw);

  return vysledky
    .filter((v) => v.vytvorit && udalosti[v.index - 1])
    .map((v) => ({
      zdrojId: udalosti[v.index - 1].id,
      nazev: v.nazev,
      popis: v.popis,
      lokace: v.lokace,
      stav: "novy",
    }));
}

async function getExistujiciZdrojIds(): Promise<Set<string>> {
  const [navrhy, ukoly, ignorovane] = await Promise.all([
    prisma.navrhUkolu.findMany({ select: { zdrojId: true } }),
    prisma.ukol.findMany({ select: { zdrojId: true }, where: { zdrojId: { not: null } } }),
    prisma.ignorovanyZdroj.findMany({ select: { zdrojId: true } }),
  ]);
  return new Set([
    ...navrhy.map((n: { zdrojId: string | null }) => n.zdrojId),
    ...ukoly.map((u: { zdrojId: string | null }) => u.zdrojId),
    ...ignorovane.map((i: { zdrojId: string }) => i.zdrojId),
  ].filter(Boolean) as string[]);
}

export async function spustSync(): Promise<{ noveNavrhy: number; chyba?: string }> {
  try {
    const [prijate, odeslane, udalosti, existujiciZdrojIds] = await Promise.all([
      getPrijateMaily(),
      getOdeslaneMaily(),
      getNoveUdalostiKalendare(),
      getExistujiciZdrojIds(),
    ]);

    const nove = (maily: Mail[]) => maily.filter((m) => !existujiciZdrojIds.has(m.id));
    const noveUdalosti = udalosti.filter((u) => !existujiciZdrojIds.has(u.id));

    const [navrhyPrijate, navrhyOdeslane, navrhyKalendar] = await Promise.all([
      analyzujPrijatyeMaily(nove(prijate)),
      analyzujOdeslaneMaily(nove(odeslane)),
      analyzujKalendar(noveUdalosti),
    ]);

    const vsechny = [
      ...navrhyPrijate.map((n) => ({ ...n, zdroj: "gmail" })),
      ...navrhyOdeslane.map((n) => ({ ...n, zdroj: "gmail" })),
      ...navrhyKalendar.map((n) => ({ ...n, zdroj: "kalendar" })),
    ];

    await Promise.all(
      vsechny.map((n) =>
        prisma.navrhUkolu.create({
          data: {
            nazev: n.nazev,
            popis: n.popis,
            lokace: n.lokace,
            stav: n.stav,
            zdroj: n.zdroj,
            zdrojId: n.zdrojId,
          },
        })
      )
    );

    await prisma.syncLog.create({
      data: {
        typ: "auto",
        vysledek: "ok",
        zprava: `Příchozí: ${prijate.length}, Odeslané: ${odeslane.length}, Kalendář: ${udalosti.length}`,
        noveNavrhy: vsechny.length,
      },
    });

    return { noveNavrhy: vsechny.length };
  } catch (e) {
    const zprava = e instanceof Error ? e.message : String(e);
    await prisma.syncLog.create({
      data: { typ: "auto", vysledek: "chyba", zprava, noveNavrhy: 0 },
    });
    return { noveNavrhy: 0, chyba: zprava };
  }
}
