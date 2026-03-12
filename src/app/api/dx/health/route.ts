import { NextResponse } from "next/server";
import { listPromptRegistry } from "@/src/lib/dx/prompt-registry";
import { readWorkflowContext } from "@/src/lib/dx/workflow-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    workflowContextReadable: false,
    promptStoreReadable: false,
  };

  try {
    await readWorkflowContext();
    checks.workflowContextReadable = true;
  } catch {}

  try {
    await listPromptRegistry();
    checks.promptStoreReadable = true;
  } catch {}

  const ok = checks.workflowContextReadable && checks.promptStoreReadable;
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 500 });
}
