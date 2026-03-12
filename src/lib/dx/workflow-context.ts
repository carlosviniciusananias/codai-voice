import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { WorkflowContext, WorkflowPayload } from "./types";

const WORKFLOW_CONTEXT_RELATIVE_PATH = ".cursor/workflow-context.json";
const WORKFLOW_SCHEMA_VERSION = 1;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateContext(raw: unknown): WorkflowContext {
  if (!isObject(raw)) {
    throw new Error("Workflow context should be an object.");
  }

  const requiredStringKeys = ["jiraId", "branch", "currentPhase"] as const;
  for (const key of requiredStringKeys) {
    if (typeof raw[key] !== "string" || raw[key].trim().length === 0) {
      throw new Error(`Invalid workflow context: '${key}' is required.`);
    }
  }

  if (!isObject(raw.agents)) {
    throw new Error("Invalid workflow context: 'agents' should be an object.");
  }

  return {
    jiraId: String(raw.jiraId),
    branch: String(raw.branch),
    prNumber: typeof raw.prNumber === "number" ? raw.prNumber : null,
    currentPhase: String(raw.currentPhase),
    retryCount: typeof raw.retryCount === "number" ? raw.retryCount : 0,
    lastError: typeof raw.lastError === "string" ? raw.lastError : null,
    isCrisisMode: Boolean(raw.isCrisisMode),
    agents: raw.agents,
    contextMemory: isObject(raw.contextMemory)
      ? {
          currentLayout:
            typeof raw.contextMemory.currentLayout === "string"
              ? raw.contextMemory.currentLayout
              : undefined,
          history: Array.isArray(raw.contextMemory.history)
            ? raw.contextMemory.history
            : [],
          components: Array.isArray(raw.contextMemory.components)
            ? raw.contextMemory.components
            : [],
        }
      : undefined,
  };
}

export function getWorkflowContextPath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }
  return path.resolve(process.cwd(), WORKFLOW_CONTEXT_RELATIVE_PATH);
}

export async function readWorkflowContext(customPath?: string): Promise<WorkflowPayload> {
  const filePath = getWorkflowContextPath(customPath);

  const [content, fileStats] = await Promise.all([
    readFile(filePath, "utf-8"),
    stat(filePath),
  ]);

  const parsed = JSON.parse(content) as unknown;
  const context = validateContext(parsed);

  return {
    ...context,
    schemaVersion: WORKFLOW_SCHEMA_VERSION,
    stale: Date.now() - fileStats.mtimeMs > 60_000,
    updatedAt: new Date(fileStats.mtimeMs).toISOString(),
  };
}
