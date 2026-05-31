import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const navrhy = await prisma.navrhUkolu.findMany({
    orderBy: { vytvoreno: "desc" },
  });
  return NextResponse.json(navrhy);
}
