import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { DX_AGENTS, type DxAgentName, type PromptRegistry, type PromptVersion } from "./types";

const PROMPT_REGISTRY_PATH = path.resolve(process.cwd(), "data/prompts/agents.json");
const REGISTRY_SCHEMA_VERSION = 1;

function checksum(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function nextVersionId(versions: PromptVersion[]): string {
  return `v${versions.length + 1}`;
}

function emptyRegistry(): PromptRegistry {
  const agents = Object.fromEntries(
    DX_AGENTS.map((agent) => [agent, { activeVersion: null, versions: [] }]),
  ) as PromptRegistry["agents"];

  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    agents,
  };
}

async function writeAtomicJson(filePath: string, data: PromptRegistry): Promise<void> {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  await rename(tempPath, filePath);
}

export async function readPromptRegistry(): Promise<PromptRegistry> {
  try {
    const content = await readFile(PROMPT_REGISTRY_PATH, "utf-8");
    const parsed = JSON.parse(content) as PromptRegistry;

    if (typeof parsed !== "object" || parsed === null || !parsed.agents) {
      throw new Error("Prompt registry invalid structure.");
    }

    for (const agent of DX_AGENTS) {
      if (!parsed.agents[agent]) {
        parsed.agents[agent] = { activeVersion: null, versions: [] };
      }
    }

    return parsed;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError?.code !== "ENOENT") {
      throw error;
    }
    const registry = emptyRegistry();
    await writeAtomicJson(PROMPT_REGISTRY_PATH, registry);
    return registry;
  }
}

export async function listPromptRegistry(): Promise<PromptRegistry> {
  return readPromptRegistry();
}

export async function getAgentPrompts(agent: DxAgentName): Promise<{
  agent: DxAgentName;
  activeVersion: string | null;
  versions: PromptVersion[];
}> {
  const registry = await readPromptRegistry();
  return {
    agent,
    activeVersion: registry.agents[agent].activeVersion,
    versions: registry.agents[agent].versions,
  };
}

export async function createPromptVersion(params: {
  agent: DxAgentName;
  content: string;
  createdBy?: string;
  label?: string;
}): Promise<{
  agent: DxAgentName;
  activeVersion: string;
  version: PromptVersion;
}> {
  const registry = await readPromptRegistry();
  const entry = registry.agents[params.agent];
  const now = new Date().toISOString();
  const version: PromptVersion = {
    id: nextVersionId(entry.versions),
    createdAt: now,
    createdBy: params.createdBy?.trim() || "system",
    label: params.label?.trim() || "manual update",
    content: params.content,
    checksum: checksum(params.content),
    rollbackFrom: null,
  };

  entry.versions.push(version);
  entry.activeVersion = version.id;
  registry.updatedAt = now;
  await writeAtomicJson(PROMPT_REGISTRY_PATH, registry);

  return {
    agent: params.agent,
    activeVersion: version.id,
    version,
  };
}

export async function rollbackPromptVersion(params: {
  agent: DxAgentName;
  targetVersionId: string;
  createdBy?: string;
  label?: string;
}): Promise<{
  agent: DxAgentName;
  activeVersion: string;
  rolledBackTo: string;
  version: PromptVersion;
}> {
  const registry = await readPromptRegistry();
  const entry = registry.agents[params.agent];
  const target = entry.versions.find((version) => version.id === params.targetVersionId);

  if (!target) {
    throw new Error("Target version not found for rollback.");
  }

  const now = new Date().toISOString();
  const version: PromptVersion = {
    id: nextVersionId(entry.versions),
    createdAt: now,
    createdBy: params.createdBy?.trim() || "system",
    label: params.label?.trim() || `rollback to ${params.targetVersionId}`,
    content: target.content,
    checksum: checksum(target.content),
    rollbackFrom: params.targetVersionId,
  };

  entry.versions.push(version);
  entry.activeVersion = version.id;
  registry.updatedAt = now;
  await writeAtomicJson(PROMPT_REGISTRY_PATH, registry);

  return {
    agent: params.agent,
    activeVersion: version.id,
    rolledBackTo: params.targetVersionId,
    version,
  };
}

export function isDxAgentName(value: string): value is DxAgentName {
  return DX_AGENTS.includes(value as DxAgentName);
}
