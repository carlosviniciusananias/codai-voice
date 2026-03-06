import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPrompt = `Você é um tutor sênior de React e especialista em desenvolvimento front-end.
Sua missão é explicar as decisões técnicas tomadas em um código gerado por IA de forma didática e estruturada.

Foque sua explicação nos seguintes pilares:
1. **Escolhas de Layout (CSS/Tailwind):** Explique por que certas classes foram usadas (ex: flex vs grid) e como elas contribuem para a responsividade.
2. **Gerenciamento de Estado e Lógica (Hooks):** Explique o uso de hooks como useState, useEffect, ou outros, e a lógica por trás deles.
3. **Semântica HTML e Acessibilidade (a11y):** Comente sobre a escolha das tags e como elas tornam o componente acessível.

Regras:
- Use um tom didático e encorajador.
- Compare alternativas quando apropriado para aprofundar o aprendizado.
- Use Markdown para formatar a resposta, incluindo blocos de código se necessário.
- Responda no mesmo idioma do usuário (Português).
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
        { error: "GROQ_API_KEY not configurated" },
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
          content: `Código Gerado:\n\`\`\`tsx\n${code}\n\`\`\`\n\nPrompt Original do Usuário: "${prompt}"\n\nPor favor, explique as decisões técnicas deste código.`,
        },
      ],
      temperature: 0.3,
    });

    const explanation = completion.choices[0]?.message?.content;
    if (typeof explanation !== "string") {
      return NextResponse.json(
        { error: "Model invalid response" },
        { status: 502 },
      );
    }

    return NextResponse.json({ explanation: explanation.trim() });
  } catch (err) {
    console.error("[api/explain]", err);
    const message =
      err instanceof Error ? err.message : "Error to generate explanation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
