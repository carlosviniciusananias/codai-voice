import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPrompt = `Você é um tutor sênior de React e Next.js.
Sua missão é explicar as decisões técnicas de um código gerado por IA de forma didática e profunda.

Foque sua explicação em:
1. **Escolhas de Layout (CSS/Tailwind):** Por que certas classes foram usadas, alternativas (ex: Flex vs Grid).
2. **Gerenciamento de Estado (Hooks):** Explique o uso de useState, useEffect ou outros hooks se presentes.
3. **Semântica HTML:** A importância das tags escolhidas para acessibilidade e SEO.
4. **Boas Práticas:** Mencione padrões de Clean Code aplicados.

Instruções Adicionais:
- Use Markdown para formatar a resposta.
- Use blocos de código para exemplificar pontos específicos.
- Mantenha um tom encorajador e educativo.
- Responda obrigatoriamente em Português (Brasil).
- Seja conciso, mas completo.`;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "codai-voice:explain",
});

interface ExplainRequestBody {
  code: string;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const ipHeader =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const ip =
      ipHeader && ipHeader.length > 0
        ? ipHeader
        : "anonymous";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ExplainRequestBody;
    const { code, prompt } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Field 'code' is required" },
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
          content: `O usuário solicitou: "${prompt}"\n\nO código gerado foi:\n\`\`\`jsx\n${code}\n\`\`\`\n\nPor favor, explique as decisões técnicas deste código.`,
        },
      ],
      temperature: 0.5,
    });

    const explanation = completion.choices[0]?.message?.content;
    if (typeof explanation !== "string") {
      return NextResponse.json(
        { error: "Model invalid response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("[api/explain]", err);
    const message =
      err instanceof Error ? err.message : "Error to generate explanation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
