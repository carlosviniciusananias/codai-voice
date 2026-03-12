import { NextRequest, NextResponse } from "next/server";
import { getAgentPrompts, isDxAgentName } from "@/src/lib/dx/prompt-registry";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ agent: string }> },
) {
  const params = await context.params;
  if (!isDxAgentName(params.agent)) {
    return NextResponse.json({ error: "Invalid agent." }, { status: 400 });
  }

  try {
    const payload = await getAgentPrompts(params.agent);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to read agent prompts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
