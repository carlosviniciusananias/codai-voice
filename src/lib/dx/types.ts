export const DX_AGENTS = [
  "mike",
  "isa",
  "buttowski",
  "hermione",
  "harry",
  "workflow",
] as const;

export type DxAgentName = (typeof DX_AGENTS)[number];

export type WorkflowAgentStatusValue = "pending" | "in_progress" | "completed" | "failed";

export type WorkflowAgentStatus =
  | WorkflowAgentStatusValue
  | {
      status: WorkflowAgentStatusValue;
      score?: number;
      coverage?: number;
      note?: string;
    };

export type WorkflowContext = {
  jiraId: string;
  branch: string;
  prNumber: number | null;
  currentPhase: string;
  retryCount: number;
  lastError: string | null;
  isCrisisMode: boolean;
  agents: Record<string, WorkflowAgentStatus>;
  contextMemory?: {
    currentLayout?: string;
    history?: unknown[];
    components?: unknown[];
  };
};

export type WorkflowPayload = WorkflowContext & {
  updatedAt: string;
  stale: boolean;
  schemaVersion: number;
};

export type PromptVersion = {
  id: string;
  createdAt: string;
  createdBy: string;
  label: string;
  content: string;
  checksum: string;
  rollbackFrom: string | null;
};

export type PromptAgentEntry = {
  activeVersion: string | null;
  versions: PromptVersion[];
};

export type PromptRegistry = {
  schemaVersion: number;
  updatedAt: string;
  agents: Record<DxAgentName, PromptAgentEntry>;
};
