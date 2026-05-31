import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const navrhId = Number(id);

  const navrh = await prisma.navrhUkolu.findUnique({ where: { id: navrhId } });
  if (!navrh) return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });

  const data = await req.json();
  const ukol = await prisma.ukol.create({
    data: {
      nazev: data.nazev || navrh.nazev,
      popis: data.popis || navrh.popis,
      lokace: data.lokace || navrh.lokace,
      zdroj: navrh.zdroj as "gmail" | "kalendar",
      zdrojId: navrh.zdrojId,
      stav: "novy",
      priorita: data.priorita || "normalni",
      schvaleno: true,
    },
  });

  await prisma.navrhUkolu.delete({ where: { id: navrhId } });
  return NextResponse.json(ukol, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.navrhUkolu.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
