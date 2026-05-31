import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Placeholder pro Google + Claude sync — implementace po nastavení OAuth
export async function POST() {
  const log = await prisma.syncLog.create({
    data: {
      typ: "manual",
      vysledek: "ok",
      zprava: "Sync zatím není nakonfigurován. Nejdříve nastavte Google OAuth.",
      noveNavrhy: 0,
    },
  });
  return NextResponse.json(log);
}

export async function GET() {
  const logy = await prisma.syncLog.findMany({
    orderBy: { cas: "desc" },
    take: 10,
  });
  return NextResponse.json(logy);
}
