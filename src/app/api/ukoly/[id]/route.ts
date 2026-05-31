import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const ukol = await prisma.ukol.update({
    where: { id: Number(id) },
    data: {
      ...(data.nazev !== undefined && { nazev: data.nazev }),
      ...(data.popis !== undefined && { popis: data.popis }),
      ...(data.stav !== undefined && { stav: data.stav }),
      ...(data.lokace !== undefined && { lokace: data.lokace }),
      ...(data.priorita !== undefined && { priorita: data.priorita }),
      ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
    },
  });
  return NextResponse.json(ukol);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.ukol.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
