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
    const historyKey = `session:${sessionId}:history`;

    const [versions, history] = await Promise.all([
      redis.lrange(key, 0, 4),
      redis.lrange(historyKey, 0, 9),
    ]);

    const parsedHistory = history.map((item) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch (e) {
        return { instruction: "Versão anterior", snapshot: item };
      }
    });

    return NextResponse.json({ 
      versions, 
      history: parsedHistory 
    });
  } catch (err) {
    console.error("[api/versions]", err);
    return NextResponse.json({ error: "Erro ao recuperar versões" }, { status: 500 });
  }
}
