import { NextRequest, NextResponse } from "next/server";
import { isDxAgentName, rollbackPromptVersion } from "@/src/lib/dx/prompt-registry";

type RollbackBody = {
  targetVersionId?: string;
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

  let body: RollbackBody;
  try {
    body = (await request.json()) as RollbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const targetVersionId =
    typeof body.targetVersionId === "string" ? body.targetVersionId.trim() : "";

  if (!targetVersionId) {
    return NextResponse.json(
      { error: "Field 'targetVersionId' is required." },
      { status: 422 },
    );
  }

  try {
    const payload = await rollbackPromptVersion({
      agent: params.agent,
      targetVersionId,
      label: body.label,
      createdBy: body.createdBy,
    });
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to rollback prompt.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
