import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPrompt = `Você é um especialista em React e Next.js (App Router).
Gere apenas o JSX/HTML do corpo de um componente, sem imports, sem export default e sem envolver em função.
Regras:
- Use apenas Tailwind CSS para estilos.
- O conteúdo deve ser responsivo e acessível (a11y).
- Retorne somente a marcação começando em uma tag raiz (por exemplo, <div ...>...</div>), sem explicações em texto.`;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "codai-voice:generate",
});

interface GenerateRequestBody {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      (request as any).ip ??
      "anonymous";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configurated" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as GenerateRequestBody;
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Field 'text' is required" },
        { status: 400 },
      );
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Com base na descrição a seguir, gere apenas o JSX/HTML do conteúdo do componente, sem imports nem export default: ${text}`,
        },
      ],
      temperature: 0.3,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (typeof rawContent !== "string") {
      return NextResponse.json(
        { error: "Model invalid response" },
        { status: 502 },
      );
    }

    const component = rawContent.trim();
    return NextResponse.json({ component });
  } catch (err) {
    console.error("[api/generate]", err);
    const message =
      err instanceof Error ? err.message : "Error to generate component";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
