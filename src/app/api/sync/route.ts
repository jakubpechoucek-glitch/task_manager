import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spustSync } from "@/lib/sync";

export async function POST() {
  const vysledek = await spustSync();
  return NextResponse.json(vysledek);
}

export async function GET() {
  const logy = await prisma.syncLog.findMany({
    orderBy: { cas: "desc" },
    take: 10,
  });
  return NextResponse.json(logy);
}
