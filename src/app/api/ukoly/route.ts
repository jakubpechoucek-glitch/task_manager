import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lokace = searchParams.get("lokace");
  const stav = searchParams.get("stav");

  const ukoly = await prisma.ukol.findMany({
    where: {
      schvaleno: true,
      ...(lokace && lokace !== "vse" ? { lokace } : {}),
      ...(stav ? { stav } : { stav: { not: "hotovo" } }),
    },
    orderBy: [{ priorita: "desc" }, { vytvoreno: "desc" }],
  });

  return NextResponse.json(ukoly);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const ukol = await prisma.ukol.create({
    data: {
      nazev: data.nazev,
      popis: data.popis || null,
      stav: data.stav || "novy",
      lokace: data.lokace || "kdekoliv",
      priorita: data.priorita || "normalni",
      deadline: data.deadline ? new Date(data.deadline) : null,
      zdroj: "rucni",
    },
  });
  return NextResponse.json(ukol, { status: 201 });
}
