import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("codai_session_id")?.value;

    if (!sessionId) {
      return NextResponse.json({ versions: [] });
    }

    const key = `session:${sessionId}:versions`;
    const versions = await redis.lrange(key, 0, 4);

    return NextResponse.json({ versions });
  } catch (err) {
    console.error("[api/versions]", err);
    return NextResponse.json({ error: "Erro ao recuperar versões" }, { status: 500 });
  }
}
