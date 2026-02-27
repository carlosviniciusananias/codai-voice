import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const systemPrompt = `Você é um especialista em React e Next.js (App Router). 
Gere apenas o código de um componente React em TSX, sem explicações antes ou depois.
Regras:
- Use apenas Tailwind CSS para estilos.
- Componente deve ser responsivo e acessível (a11y).
- Exporte o componente como default.
- Não use imports além de "react" quando necessário; use apenas JSX e Tailwind.`;

interface GenerateRequestBody {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY não configurada" },
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
          content: `Create a react component (tsx): ${text}`,
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
