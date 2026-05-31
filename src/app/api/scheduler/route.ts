import { NextRequest, NextResponse } from "next/server";
import { inicializujScheduler } from "@/lib/scheduler";

let started = false;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SCHEDULER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!started) {
    inicializujScheduler();
    started = true;
    return NextResponse.json({ ok: true, zprava: "Scheduler spuštěn" });
  }
  return NextResponse.json({ ok: true, zprava: "Scheduler již běží" });
}
