import { NextRequest, NextResponse } from "next/server";
import { createPromptVersion, isDxAgentName } from "@/src/lib/dx/prompt-registry";

type CreateVersionBody = {
  content?: string;
  label?: string;
  createdBy?: string;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ agent: string }> },
) {
  const params = await context.params;
  if (!isDxAgentName(params.agent)) {
    return NextResponse.json({ error: "Invalid agent." }, { status: 400 });
  }

  let body: CreateVersionBody;
  try {
    body = (await request.json()) as CreateVersionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Field 'content' is required." }, { status: 422 });
  }

  try {
    const payload = await createPromptVersion({
      agent: params.agent,
      content,
      label: body.label,
      createdBy: body.createdBy,
    });
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create prompt version.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
