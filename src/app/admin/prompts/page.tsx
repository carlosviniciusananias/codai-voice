"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";

type AgentSummary = {
  agent: string;
  activeVersion: string | null;
  versions: number;
  updatedAt: string | null;
};

type PromptVersion = {
  id: string;
  createdAt: string;
  createdBy: string;
  label: string;
  content: string;
  rollbackFrom: string | null;
};

type AgentPromptPayload = {
  agent: string;
  activeVersion: string | null;
  versions: PromptVersion[];
};

export default function AdminPromptsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("mike");
  const [promptData, setPromptData] = useState<AgentPromptPayload | null>(null);
  const [content, setContent] = useState("");
  const [label, setLabel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = useCallback(async () => {
    const response = await fetch("/api/dx/prompts", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Falha ao carregar lista de agentes.");
    }
    const payload = (await response.json()) as { agents: AgentSummary[] };
    setAgents(payload.agents || []);
    if (!selectedAgent && payload.agents?.[0]) {
      setSelectedAgent(payload.agents[0].agent);
    }
  }, [selectedAgent]);

  const loadAgentDetails = useCallback(async (agent: string) => {
    const response = await fetch(`/api/dx/prompts/${agent}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Falha ao carregar versoes de prompt.");
    }
    const payload = (await response.json()) as AgentPromptPayload;
    setPromptData(payload);
    const active = payload.versions.find((version) => version.id === payload.activeVersion);
    setContent(active?.content || "");
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      setIsLoading(true);
      setError(null);
      try {
        await loadAgents();
        await loadAgentDetails(selectedAgent);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Erro ao carregar playground.";
        setError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [selectedAgent, loadAgentDetails, loadAgents]);

  const sortedVersions = useMemo(() => {
    return [...(promptData?.versions ?? [])].reverse();
  }, [promptData?.versions]);

  const saveVersion = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/dx/prompts/${selectedAgent}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          label: label.trim() || "manual update",
          createdBy: "admin-ui",
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Falha ao salvar nova versao.");
      }
      setLabel("");
      await loadAgentDetails(selectedAgent);
      await loadAgents();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Erro ao salvar versao de prompt.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const rollback = async (versionId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/dx/prompts/${selectedAgent}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetVersionId: versionId,
          createdBy: "admin-ui",
          label: `rollback to ${versionId}`,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Falha ao executar rollback.");
      }
      await loadAgentDetails(selectedAgent);
      await loadAgents();
    } catch (rollbackError) {
      const message =
        rollbackError instanceof Error ? rollbackError.message : "Erro ao fazer rollback.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 py-4" aria-label="Playground de prompts">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Prompt Playground</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Edite prompts, publique novas versoes e execute rollback com historico append-only.
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-8 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando dados do playground...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Agentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.agent}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    selectedAgent === agent.agent
                      ? "border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
                  }`}
                  onClick={() => setSelectedAgent(agent.agent)}
                >
                  <p className="font-medium">{agent.agent}</p>
                  <p className="text-xs text-zinc-500">
                    ativa: {agent.activeVersion || "n/a"} | versoes: {agent.versions}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Editor ({selectedAgent})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Label da versao (ex: ajuste de contexto)"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={12}
                  placeholder="Edite aqui o prompt do agente selecionado..."
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={() => void saveVersion()} disabled={isSaving || !content.trim()}>
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Salvar nova versao
                  </Button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historico de versoes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sortedVersions.length === 0 ? (
                  <p className="text-sm text-zinc-500">Sem versoes para este agente.</p>
                ) : (
                  sortedVersions.map((version) => (
                    <div
                      key={version.id}
                      className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {version.id}
                            {promptData?.activeVersion === version.id ? " (ativa)" : ""}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {version.label} | {version.createdBy} |{" "}
                            {new Date(version.createdAt).toLocaleString()}
                            {version.rollbackFrom ? ` | rollbackFrom: ${version.rollbackFrom}` : ""}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={isSaving}
                          onClick={() => void rollback(version.id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Rollback
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
