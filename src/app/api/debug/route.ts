import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    claudeKey: process.env.CLAUDE_API_KEY ? "set (" + process.env.CLAUDE_API_KEY.slice(0,10) + "...)" : "MISSING",
    googleRefresh: process.env.GOOGLE_REFRESH_TOKEN ? "set" : "MISSING",
    databaseUrl: process.env.DATABASE_URL ?? "MISSING",
    nodeEnv: process.env.NODE_ENV,
  });
}
