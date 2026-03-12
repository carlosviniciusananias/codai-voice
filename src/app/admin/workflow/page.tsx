"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CircleCheck, CircleDashed, Loader2, RefreshCw, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";

type WorkflowAgentStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | {
      status?: "pending" | "in_progress" | "completed" | "failed";
      score?: number;
      coverage?: number;
    };

type WorkflowPayload = {
  jiraId: string;
  branch: string;
  currentPhase: string;
  retryCount: number;
  isCrisisMode: boolean;
  updatedAt: string;
  stale: boolean;
  agents: Record<string, WorkflowAgentStatus>;
  contextMemory?: {
    history?: Array<{ timestamp?: string; instruction?: string }>;
  };
};

const POLL_INTERVAL_MS = 3000;
const BACKOFF_INTERVAL_MS = 10000;

function renderStatus(status: WorkflowAgentStatus): string {
  if (typeof status === "string") return status;
  return status.status ?? "pending";
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "completed"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : status === "in_progress"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
        : status === "failed"
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{status}</span>;
}

export default function AdminWorkflowPage() {
  const [data, setData] = useState<WorkflowPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await fetch("/api/dx/workflow", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Falha ao carregar workflow.");
      }
      const payload = (await response.json()) as WorkflowPayload;
      setData(payload);
      setError(null);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Erro ao consultar workflow.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await load();
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const schedule = async () => {
      await run();
      if (!mounted) return;
      const interval = document.hidden ? BACKOFF_INTERVAL_MS : POLL_INTERVAL_MS;
      timeoutId = setTimeout(() => {
        void schedule();
      }, interval);
    };

    void schedule();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const agents = useMemo(() => Object.entries(data?.agents ?? {}), [data?.agents]);
  const timeline = useMemo(() => {
    return (data?.contextMemory?.history ?? [])
      .map((item, index) => ({
        id: index,
        instruction: item.instruction || "Sem descricao",
        timestamp: item.timestamp || "",
      }))
      .slice(0, 8);
  }, [data?.contextMemory?.history]);

  return (
    <section className="flex flex-col gap-6 py-4" aria-label="Painel de workflow em tempo real">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workflow Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Atualizacao automatica a cada {POLL_INTERVAL_MS / 1000}s via polling
            {" "}({BACKOFF_INTERVAL_MS / 1000}s em aba inativa).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar agora
        </Button>
      </header>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center gap-2 py-8 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando estado do workflow...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="flex items-center gap-2 py-8 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {data && !isLoading && !error && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumo da tarefa atual</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <p>
                <strong>Issue:</strong> {data.jiraId}
              </p>
              <p>
                <strong>Branch:</strong> {data.branch}
              </p>
              <p>
                <strong>Fase:</strong> {data.currentPhase}
              </p>
              <p>
                <strong>Retry:</strong> {data.retryCount} | <strong>Crisis:</strong>{" "}
                {data.isCrisisMode ? "Sim" : "Nao"}
              </p>
              <p className="md:col-span-2">
                <strong>Ultima atualizacao:</strong> {new Date(data.updatedAt).toLocaleString()}
                {data.stale ? " (stale)" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado dos agentes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {agents.map(([name, status]) => {
                const normalizedStatus = renderStatus(status);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                  >
                    <span className="text-sm font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      {normalizedStatus === "completed" && (
                        <CircleCheck className="h-4 w-4 text-emerald-500" />
                      )}
                      {normalizedStatus === "in_progress" && (
                        <Timer className="h-4 w-4 text-blue-500" />
                      )}
                      {normalizedStatus === "pending" && (
                        <CircleDashed className="h-4 w-4 text-zinc-400" />
                      )}
                      {normalizedStatus === "failed" && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <StatusPill status={normalizedStatus} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline da tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeline.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum evento registrado no contexto atual.</p>
              ) : (
                timeline.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                  >
                    <p className="text-sm font-medium">{item.instruction}</p>
                    <p className="text-xs text-zinc-500">{item.timestamp}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
