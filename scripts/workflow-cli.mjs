#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EXIT_OK = 0;
const EXIT_ERROR = 1;
const EXIT_GATE = 2;

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }
    const key = token.replace(/^--/, "");
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function printUsage() {
  console.log(`codai-workflow CLI

Usage:
  node scripts/workflow-cli.mjs status [--json] [--no-color] [--context-file PATH] [--base-url URL] [--fail-on phase=VALUE]
  node scripts/workflow-cli.mjs watch [--interval 2000] [--timeout 60000] [--json] [--no-color] [--context-file PATH] [--base-url URL]
  node scripts/workflow-cli.mjs prompts list [agent] [--base-url URL]
  node scripts/workflow-cli.mjs prompts rollback <agent> <versionId> [--base-url URL] [--created-by NAME] [--label TEXT]

Exit codes:
  0: success
  1: functional/runtime error
  2: timeout or gate condition not satisfied`);
}

function normalizeWorkflowPayload(payload) {
  return {
    jiraId: payload.jiraId ?? "",
    branch: payload.branch ?? "",
    currentPhase: payload.currentPhase ?? "unknown",
    retryCount: Number(payload.retryCount ?? 0),
    isCrisisMode: Boolean(payload.isCrisisMode),
    agents: payload.agents ?? {},
    updatedAt: payload.updatedAt ?? new Date().toISOString(),
    stale: Boolean(payload.stale),
    schemaVersion: Number(payload.schemaVersion ?? 1),
  };
}

async function readLocalWorkflowContext(customPath) {
  const filePath = path.resolve(
    customPath || path.join(process.cwd(), ".cursor/workflow-context.json"),
  );
  const [content, stats] = await Promise.all([fs.readFile(filePath, "utf-8"), fs.stat(filePath)]);
  const parsed = JSON.parse(content);
  return normalizeWorkflowPayload({
    ...parsed,
    updatedAt: new Date(stats.mtimeMs).toISOString(),
    stale: Date.now() - stats.mtimeMs > 60_000,
    schemaVersion: 1,
  });
}

async function fetchWorkflow(baseUrl) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/dx/workflow`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Workflow API error (${response.status}).`);
  }
  const payload = await response.json();
  return normalizeWorkflowPayload(payload);
}

async function getWorkflow(args) {
  if (typeof args["base-url"] === "string") {
    return fetchWorkflow(args["base-url"]);
  }
  return readLocalWorkflowContext(
    typeof args["context-file"] === "string" ? args["context-file"] : undefined,
  );
}

function gateFailed(payload, failOn) {
  if (!failOn) {
    return false;
  }
  const [field, expected] = String(failOn).split("=");
  if (field !== "phase" || !expected) {
    return false;
  }
  return payload.currentPhase !== expected;
}

function formatAgentStatus(status) {
  if (typeof status === "string") {
    return status;
  }
  if (status && typeof status === "object" && typeof status.status === "string") {
    return status.status;
  }
  return "unknown";
}

function printWorkflowText(payload) {
  console.log(`Issue: ${payload.jiraId}`);
  console.log(`Branch: ${payload.branch}`);
  console.log(`Phase: ${payload.currentPhase}`);
  console.log(`Retry: ${payload.retryCount} | Crisis: ${payload.isCrisisMode ? "yes" : "no"}`);
  console.log(`Updated: ${payload.updatedAt}${payload.stale ? " (stale)" : ""}`);
  console.log("Agents:");
  Object.entries(payload.agents).forEach(([name, status]) => {
    console.log(`  - ${name}: ${formatAgentStatus(status)}`);
  });
}

async function getPrompts(baseUrl, agent) {
  if (!baseUrl) {
    const registryPath = path.resolve(process.cwd(), "data/prompts/agents.json");
    const content = await fs.readFile(registryPath, "utf-8");
    const registry = JSON.parse(content);
    if (agent) {
      return {
        agent,
        activeVersion: registry.agents?.[agent]?.activeVersion ?? null,
        versions: registry.agents?.[agent]?.versions ?? [],
      };
    }
    return registry;
  }

  const endpoint = agent
    ? `${baseUrl.replace(/\/$/, "")}/api/dx/prompts/${agent}`
    : `${baseUrl.replace(/\/$/, "")}/api/dx/prompts`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Prompt API error (${response.status}).`);
  }
  return response.json();
}

async function rollbackPrompt(baseUrl, agent, versionId, createdBy, label) {
  if (!baseUrl) {
    throw new Error("Rollback requires --base-url to call API.");
  }
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/dx/prompts/${agent}/rollback`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetVersionId: versionId,
        createdBy: createdBy || "cli",
        label: label || `cli rollback to ${versionId}`,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Rollback API error (${response.status}).`);
  }
  return response.json();
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const [command, subCommand, maybeArg1, maybeArg2] = args._;

  if (!command || command === "help" || command === "--help") {
    printUsage();
    process.exit(EXIT_OK);
  }

  try {
    if (command === "status") {
      const payload = await getWorkflow(args);
      const jsonMode = Boolean(args.json);

      if (jsonMode) {
        console.log(JSON.stringify(payload, null, 2));
      } else {
        printWorkflowText(payload);
      }

      if (gateFailed(payload, args["fail-on"])) {
        console.error(
          `Gate check failed: expected ${String(args["fail-on"])} but got phase=${payload.currentPhase}.`,
        );
        process.exit(EXIT_GATE);
      }
      process.exit(EXIT_OK);
    }

    if (command === "watch") {
      const interval = Number(args.interval ?? 2000);
      const timeout = Number(args.timeout ?? 60_000);
      const jsonMode = Boolean(args.json);
      const start = Date.now();
      let previousSnapshot = "";

      while (true) {
        if (Date.now() - start > timeout) {
          console.error("Timeout reached while watching workflow.");
          process.exit(EXIT_GATE);
        }

        const payload = await getWorkflow(args);
        const snapshot = JSON.stringify(payload);
        if (snapshot !== previousSnapshot) {
          previousSnapshot = snapshot;
          if (jsonMode) {
            console.log(JSON.stringify(payload));
          } else {
            console.log("----");
            printWorkflowText(payload);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    if (command === "prompts" && subCommand === "list") {
      const payload = await getPrompts(
        typeof args["base-url"] === "string" ? args["base-url"] : "",
        maybeArg1,
      );
      console.log(JSON.stringify(payload, null, 2));
      process.exit(EXIT_OK);
    }

    if (command === "prompts" && subCommand === "rollback") {
      if (!maybeArg1 || !maybeArg2) {
        throw new Error("Usage: prompts rollback <agent> <versionId> [--base-url URL]");
      }
      const payload = await rollbackPrompt(
        typeof args["base-url"] === "string" ? args["base-url"] : "",
        maybeArg1,
        maybeArg2,
        typeof args["created-by"] === "string" ? args["created-by"] : "",
        typeof args.label === "string" ? args.label : "",
      );
      console.log(JSON.stringify(payload, null, 2));
      process.exit(EXIT_OK);
    }

    throw new Error("Unknown command.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected CLI error.";
    console.error(message);
    process.exit(EXIT_ERROR);
  }
}

run();
