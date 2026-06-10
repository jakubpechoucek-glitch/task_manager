import { NextResponse } from "next/server";
import { getPrijateMaily } from "@/lib/google";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result: Record<string, unknown> = {
    claudeKey: process.env.CLAUDE_API_KEY ? "set (" + process.env.CLAUDE_API_KEY.slice(0, 10) + "...)" : "MISSING",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "set" : "MISSING",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "MISSING",
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN ? "set" : "MISSING",
    databaseUrl: process.env.DATABASE_URL ? "set" : "MISSING",
    nodeEnv: process.env.NODE_ENV,
  };

  // Test DB
  try {
    const count = await prisma.ukol.count();
    result.db = `OK (${count} úkolů)`;
  } catch (e) {
    result.db = `CHYBA: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test Gmail
  try {
    const maily = await getPrijateMaily(1);
    result.gmail = `OK (${maily.length} mailů za posledních 24h)`;
  } catch (e) {
    result.gmail = `CHYBA: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test Claude API
  try {
    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    const resp = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: "Hi" }],
    });
    result.claude = `OK (${resp.usage.input_tokens} tokens)`;
  } catch (e) {
    result.claude = `CHYBA: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(result, { status: 200 });
}
