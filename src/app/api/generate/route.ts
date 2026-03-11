import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPrompt = (context?: string) => `Você é um especialista em React e Next.js (App Router).
Gere apenas o JSX/HTML do corpo de um componente, sem imports, sem export default e sem envolver em função.
Regras:
- Use apenas Tailwind CSS para estilos.
- O conteúdo deve ser responsivo e acessível (a11y).
- Retorne somente a marcação começando em uma tag raiz (por exemplo, <div ...>...</div>), sem explicações em texto.
${
  context
    ? `
Contexto Atual:
\`\`\`jsx
${context}
\`\`\`

Instruções de Composição:
O usuário quer fazer uma alteração incremental no código acima. 
- Se for uma adição, insira o novo elemento no local apropriado mantendo a estrutura existente.
- Se for uma edição, modifique apenas a parte solicitada.
- Retorne SEMPRE o código COMPLETO e CONSOLIDADO resultante da alteração.`
    : ""
}`;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function saveVersion(sessionId: string, component: string, instruction: string) {
  const versionsKey = `session:${sessionId}:versions`;
  const historyKey = `session:${sessionId}:history`;
  const layoutKey = `session:${sessionId}:layout`;

  // Salvar na lista de versões (compatibilidade)
  await redis.lpush(versionsKey, component);
  await redis.ltrim(versionsKey, 0, 4);
  await redis.expire(versionsKey, 60 * 60 * 24);

  // Salvar no histórico incremental (CB-9)
  const historyEntry = JSON.stringify({
    timestamp: new Date().toISOString(),
    instruction,
    snapshot: component,
  });
  await redis.lpush(historyKey, historyEntry);
  await redis.ltrim(historyKey, 0, 9); // Mantém os últimos 10 passos
  await redis.expire(historyKey, 60 * 60 * 24);

  // Salvar layout consolidado (CB-9)
  await redis.set(layoutKey, component);
  await redis.expire(layoutKey, 60 * 60 * 24);
}

async function getCurrentLayout(sessionId: string): Promise<string | null> {
  const layoutKey = `session:${sessionId}:layout`;
  return await redis.get<string>(layoutKey);
}

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "codai-voice:generate",
});

interface GenerateRequestBody {
  text: string;
  isIncremental?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const ipHeader =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const ip =
      ipHeader && ipHeader.length > 0
        ? ipHeader
        : // Fallback para ambientes onde o IP não está disponível
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
    const isIncremental = !!body?.isIncremental;

    if (!text) {
      return NextResponse.json(
        { error: "Field 'text' is required" },
        { status: 400 },
      );
    }

    const sessionId = request.cookies.get("codai_session_id")?.value;
    let context: string | undefined;

    if (isIncremental && sessionId) {
      const layout = await getCurrentLayout(sessionId);
      if (layout) {
        context = layout;
      }
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt(context) },
        {
          role: "user",
          content: context 
            ? `Com base no contexto atual, realize a seguinte alteração incremental: ${text}. Retorne o código consolidado.`
            : `Com base na descrição a seguir, gere apenas o JSX/HTML do conteúdo do componente, sem imports nem export default: ${text}`,
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

    // Salvar versão na sessão
    if (sessionId) {
      try {
        await saveVersion(sessionId, component, text);
        console.log(`[api/generate] Version saved for session: ${sessionId}`);
      } catch (saveErr) {
        console.error(`[api/generate] Error saving version for session ${sessionId}:`, saveErr);
        // Não bloqueia a resposta se falhar ao salvar a versão
      }
    } else {
      console.warn("[api/generate] No session_id found in cookies");
    }

    return NextResponse.json({ component });
  } catch (err) {
    console.error("[api/generate]", err);
    const message =
      err instanceof Error ? err.message : "Error to generate component";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
