import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { getNoveMailyCached, getNoveUdalostiKalendare } from "./google";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
}

interface NavrhAI {
  nazev: string;
  popis: string;
  lokace: "praha" | "manila" | "kdekoliv";
  vytvorit: boolean;
}

async function analyzujMailem(maily: { id: string; subject: string; from: string; snippet: string; date: string }[]): Promise<{ zdrojId: string; navrh: NavrhAI }[]> {
  if (!maily.length) return [];

  const prompt = `Jsi asistent pro správu úkolů. Analyzuj tyto emaily a rozhodni, zda každý z nich vyžaduje akci nebo úkol.

Kontext: Uživatel žije střídavě v Manile (Filipíny) a v Praze (Česká republika). Úkoly které lze vyřešit jen osobně v ČR označ jako "praha", úkoly jen v Manile jako "manila", ostatní jako "kdekoliv".

Emaily:
${maily.map((m, i) => `[${i + 1}] Od: ${m.from}\nPředmět: ${m.subject}\nÚryvek: ${m.snippet}`).join("\n\n")}

Pro každý email vrať JSON pole objektů:
{
  "index": číslo emailu (1-based),
  "vytvorit": true/false (zda je potřeba akce),
  "nazev": "stručný název úkolu",
  "popis": "co konkrétně udělat",
  "lokace": "praha" | "manila" | "kdekoliv"
}

Vrať pouze JSON pole, nic jiného.`;

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const text = raw.replace(/^```[a-z]*\n?/m, "").replace(/```\s*$/m, "").trim();
  const vysledky: { index: number; vytvorit: boolean; nazev: string; popis: string; lokace: "praha" | "manila" | "kdekoliv" }[] = JSON.parse(text);

  return vysledky
    .filter((v) => v.vytvorit)
    .map((v) => ({
      zdrojId: maily[v.index - 1].id,
      navrh: { nazev: v.nazev, popis: v.popis, lokace: v.lokace, vytvorit: true },
    }));
}

async function analyzujKalendar(udalosti: { id: string; nazev: string; popis: string; zacatek: string }[]): Promise<{ zdrojId: string; navrh: NavrhAI }[]> {
  if (!udalosti.length) return [];

  const prompt = `Jsi asistent pro správu úkolů. Analyzuj tyto události z kalendáře a rozhodni, zda každá vyžaduje přípravu nebo akci navíc.

Kontext: Uživatel žije střídavě v Manile (Filipíny) a v Praze (Česká republika).

Události:
${udalosti.map((u, i) => `[${i + 1}] Název: ${u.nazev}\nPopis: ${u.popis || "(prázdný)"}\nZačátek: ${u.zacatek}`).join("\n\n")}

Pro každou událost vrať JSON pole objektů:
{
  "index": číslo události (1-based),
  "vytvorit": true/false (zda je potřeba příprava/akce),
  "nazev": "stručný název úkolu",
  "popis": "co konkrétně připravit nebo udělat",
  "lokace": "praha" | "manila" | "kdekoliv"
}

Vrať pouze JSON pole, nic jiného.`;

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const text = raw.replace(/^```[a-z]*\n?/m, "").replace(/```\s*$/m, "").trim();
  const vysledky: { index: number; vytvorit: boolean; nazev: string; popis: string; lokace: "praha" | "manila" | "kdekoliv" }[] = JSON.parse(text);

  return vysledky
    .filter((v) => v.vytvorit)
    .map((v) => ({
      zdrojId: udalosti[v.index - 1].id,
      navrh: { nazev: v.nazev, popis: v.popis, lokace: v.lokace, vytvorit: true },
    }));
}

export async function spustSync(): Promise<{ noveNavrhy: number; chyba?: string }> {
  try {
    const [maily, udalosti] = await Promise.all([
      getNoveMailyCached(),
      getNoveUdalostiKalendare(),
    ]);

    // Zkontroluj zdrojId v návrzích, schválených úkolech i ignorovaných zdrojích
    const [existujiciNavrhy, existujiciUkoly, ignorovane] = await Promise.all([
      prisma.navrhUkolu.findMany({ select: { zdrojId: true } }),
      prisma.ukol.findMany({ select: { zdrojId: true }, where: { zdrojId: { not: null } } }),
      prisma.ignorovanyZdroj.findMany({ select: { zdrojId: true } }),
    ]);

    const existujiciZdrojIds = new Set([
      ...existujiciNavrhy.map((n: { zdrojId: string | null }) => n.zdrojId),
      ...existujiciUkoly.map((u: { zdrojId: string | null }) => u.zdrojId),
      ...ignorovane.map((i: { zdrojId: string }) => i.zdrojId),
    ].filter(Boolean) as string[]);

    const [navrhyMailu, navrhyKalendare] = await Promise.all([
      analyzujMailem(maily.filter((m) => !existujiciZdrojIds.has(m.id))),
      analyzujKalendar(udalosti.filter((u) => !existujiciZdrojIds.has(u.id))),
    ]);

    const vsechnyNavrhy = [...navrhyMailu, ...navrhyKalendare];

    await Promise.all(
      vsechnyNavrhy.map((n) =>
        prisma.navrhUkolu.create({
          data: {
            nazev: n.navrh.nazev,
            popis: n.navrh.popis,
            lokace: n.navrh.lokace,
            zdroj: navrhyMailu.includes(n) ? "gmail" : "kalendar",
            zdrojId: n.zdrojId,
          },
        })
      )
    );

    await prisma.syncLog.create({
      data: {
        typ: "auto",
        vysledek: "ok",
        zprava: `Gmail: ${maily.length} mailů, Kalendář: ${udalosti.length} událostí`,
        noveNavrhy: vsechnyNavrhy.length,
      },
    });

    return { noveNavrhy: vsechnyNavrhy.length };
  } catch (e) {
    const zprava = e instanceof Error ? e.message : String(e);
    await prisma.syncLog.create({
      data: { typ: "auto", vysledek: "chyba", zprava, noveNavrhy: 0 },
    });
    return { noveNavrhy: 0, chyba: zprava };
  }
}
