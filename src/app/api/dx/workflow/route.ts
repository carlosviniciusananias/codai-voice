import { NextResponse } from "next/server";
import { readWorkflowContext } from "@/src/lib/dx/workflow-context";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await readWorkflowContext();
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to read workflow context.";
    const code = (error as NodeJS.ErrnoException)?.code;
    const status =
      code === "ENOENT" ? 404 : message.includes("Invalid workflow context") ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
