import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNoveMailyCached } from "@/lib/google";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
}

export async function POST(req: NextRequest) {
  const { dnu = 45 } = await req.json().catch(() => ({}));

  try {
    const maily = await getNoveMailyCached(dnu);

    if (!maily.length) {
      return NextResponse.json({ noveNavrhy: 0, zprava: "Žádné maily nenalezeny" });
    }

    // Přeskočit již zpracované — kontroluj návrhy i schválené úkoly
    const [existujiciNavrhy, existujiciUkoly] = await Promise.all([
      prisma.navrhUkolu.findMany({ select: { zdrojId: true } }),
      prisma.ukol.findMany({ select: { zdrojId: true }, where: { zdrojId: { not: null } } }),
    ]);
    const existujici = new Set([
      ...existujiciNavrhy.map((n) => n.zdrojId),
      ...existujiciUkoly.map((u) => u.zdrojId),
    ].filter(Boolean) as string[]);
    const nove = maily.filter((m) => !existujici.has(m.id));

    if (!nove.length) {
      return NextResponse.json({ noveNavrhy: 0, zprava: "Vše již bylo zpracováno" });
    }

    // Zpracovávej po dávkách 10
    let celkemNavrhu = 0;
    for (let i = 0; i < nove.length; i += 10) {
      const davka = nove.slice(i, i + 10);
      const prompt = `Analyzuj tyto emaily a rozhodni, zda každý vyžaduje akci. Uživatel žije střídavě v Praze a Manile.

Emaily:
${davka.map((m, idx) => `[${idx + 1}] Od: ${m.from}\nPředmět: ${m.subject}\nÚryvek: ${m.snippet}`).join("\n\n")}

Vrať JSON pole objektů (bez markdown):
{"index":1,"vytvorit":true/false,"nazev":"...","popis":"...","lokace":"praha"|"manila"|"kdekoliv"}`;

      const response = await getAnthropic().messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
      const text = raw.replace(/^```[a-z]*\n?/m, "").replace(/```\s*$/m, "").trim();

      try {
        const vysledky: { index: number; vytvorit: boolean; nazev: string; popis: string; lokace: string }[] = JSON.parse(text);
        const kVytvoreni = vysledky.filter((v) => v.vytvorit);

        await Promise.all(kVytvoreni.map((v) =>
          prisma.navrhUkolu.create({
            data: {
              nazev: v.nazev,
              popis: v.popis,
              lokace: v.lokace,
              zdroj: "gmail",
              zdrojId: davka[v.index - 1]?.id,
            },
          })
        ));
        celkemNavrhu += kVytvoreni.length;
      } catch { /* přeskočit chybnou dávku */ }
    }

    await prisma.syncLog.create({
      data: { typ: "historie", vysledek: "ok", zprava: `${dnu} dní, ${maily.length} mailů`, noveNavrhy: celkemNavrhu },
    });

    return NextResponse.json({ noveNavrhy: celkemNavrhu, zpracovanoMailu: nove.length });
  } catch (e) {
    const zprava = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ chyba: zprava }, { status: 500 });
  }
}
