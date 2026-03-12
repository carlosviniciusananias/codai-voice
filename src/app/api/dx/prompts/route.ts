import { NextResponse } from "next/server";
import { listPromptRegistry } from "@/src/lib/dx/prompt-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const registry = await listPromptRegistry();
    const agents = Object.entries(registry.agents).map(([agent, entry]) => ({
      agent,
      activeVersion: entry.activeVersion,
      versions: entry.versions.length,
      updatedAt: entry.versions.at(-1)?.createdAt ?? null,
    }));

    return NextResponse.json(
      {
        schemaVersion: registry.schemaVersion,
        updatedAt: registry.updatedAt,
        agents,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to read prompt registry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
