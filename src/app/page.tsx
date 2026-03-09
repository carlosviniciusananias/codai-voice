"use client";

import { useState, useEffect } from "react";
import VoiceInput from "./components/VoiceInput";
import PromptInput from "./components/PromptInput";
import { PreviewSandbox } from "../components/PreviewSandbox";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Loader2, Mic, Code2, Eye, Download, CheckCircle2, MessageSquare, History, Lightbulb } from "lucide-react";
import { Button } from "./components/ui/button";
import { downloadAsTsx, sanitizeFileName } from "./utils/export-utils";
import { ExplanationSidebar } from "./components/ExplanationSidebar";

export default function Home() {
  const [transcription, setTranscription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [versions, setVersions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"voice" | "manual">("voice");

  // Estados para a funcionalidade Explain-to-Me
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  // Resetar explicação quando o código gerado mudar
  useEffect(() => {
    if (generatedCode) {
      setExplanation("");
      setShowExplanation(false);
    }
  }, [generatedCode]);

  const fetchVersions = async () => {
    try {
      const response = await fetch("/api/versions");
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error("Erro ao buscar versões:", err);
    }
  };

  const handleExport = () => {
    if (!generatedCode) return;
    
    setIsExporting(true);
    try {
      const fileName = sanitizeFileName(transcription || "ComponenteGerado");
      downloadAsTsx(generatedCode, fileName);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Erro ao exportar o arquivo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExplain = async () => {
    if (!generatedCode) return;

    setIsExplaining(true);
    setError(null);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        body: JSON.stringify({
          code: generatedCode,
          prompt: transcription || "Componente gerado",
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 429) {
        throw new Error("Muitas solicitações. Por favor, aguarde um momento.");
      }

      if (!response.ok) {
        throw new Error("Erro ao gerar explicação.");
      }

      const data = await response.json();
      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido ao explicar código.";
      setError(message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerate = async (text: string) => {
    setTranscription(text);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text: text.trim().slice(0, 500) }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 429) {
        throw new Error("429 Too Many Requests");
      }

      if (!response.ok) {
        throw new Error("Erro ao gerar código.");
      }

      const data = (await response.json()) as {
        component?: string;
        error?: string;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedCode(data.component ?? "");
      fetchVersions(); // Atualiza o histórico após gerar
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro desconhecido ao gerar código.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-label="Studio de geração de componentes por voz"
      className="flex flex-1 flex-col gap-8 py-4"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
            Transforme suas ideias em realidade. Descreva o componente e veja a mágica acontecer em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Pronto
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processando...
            </div>
          )}
        </div>
      </header>

        <div className={`grid flex-1 grid-cols-1 gap-6 transition-all duration-300 ${showExplanation ? "lg:grid-cols-[380px_1fr_400px]" : "lg:grid-cols-[380px_1fr]"}`}>
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col shadow-lg border-zinc-200/60 dark:border-zinc-800/60">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {inputMode === "voice" ? (
                      <Mic className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-zinc-500" />
                    )}
                    <CardTitle>{inputMode === "voice" ? "Comando de Voz" : "Prompt Manual"}</CardTitle>
                  </div>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button
                      onClick={() => setInputMode("voice")}
                      className={`p-1.5 rounded-md transition-all ${
                        inputMode === "voice"
                          ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                      title="Voz"
                    >
                      <Mic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setInputMode("manual")}
                      className={`p-1.5 rounded-md transition-all ${
                        inputMode === "manual"
                          ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      }`}
                      title="Manual"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {inputMode === "voice" ? (
                  <VoiceInput
                    onTranscription={handleGenerate}
                    onError={(msg) => setError(msg)}
                  />
                ) : (
                  <PromptInput
                    onGenerate={handleGenerate}
                    disabled={isLoading}
                  />
                )}

                {transcription && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Transcrição
                    </p>
                    <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
                        &ldquo;{transcription}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                  >
                    <p className="font-medium">Ops! Algo deu errado</p>
                    <p className="mt-1 text-xs opacity-90">{error}</p>
                  </div>
                )}

                {!transcription && !error && (
                  <div className="rounded-xl bg-blue-50/50 border border-blue-100/50 p-4 dark:bg-blue-950/10 dark:border-blue-900/20">
                    <p className="text-xs leading-relaxed text-blue-700/80 dark:text-blue-400/80">
                      <span className="font-semibold block mb-1 text-blue-800 dark:text-blue-300">Dica:</span>
                      Experimente dizer: &quot;Crie um card de perfil com foto, nome e um botão de seguir&quot;
                    </p>
                  </div>
                )}

                {versions.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <History className="h-3 w-3" />
                      Histórico de Versões
                    </div>
                    <div className="flex flex-col gap-2">
                      {versions.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => setGeneratedCode(v)}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
                        >
                          <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                            Versão {versions.length - i}
                          </span>
                          <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Restaurar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 flex-1">
            <Card className="flex flex-col overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-zinc-500" />
                    <CardTitle>Código Fonte</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {showSuccess && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-right-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Exportado!
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px] gap-1.5 border-zinc-200 dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600"
                      onClick={handleExplain}
                      disabled={!generatedCode || isExplaining}
                    >
                      {isExplaining ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Lightbulb className="h-3 w-3" />
                      )}
                      {isExplaining ? "Explicando..." : "Explicar Código"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px] gap-1.5 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={handleExport}
                      disabled={!generatedCode || isExporting}
                    >
                      {isExporting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      {isExporting ? "Exportando..." : "Baixar .tsx"}
                    </Button>
                    <span className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                      TSX
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-zinc-950">
                <div className="relative h-full min-h-[400px]">
                  <pre className="absolute inset-0 overflow-auto p-6 text-xs md:text-sm font-mono leading-relaxed text-zinc-300">
                    <code>
                      {generatedCode || "// Fale para gerar o código..."}
                    </code>
                  </pre>
                  {isLoading && (
                    <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="text-xs font-medium text-zinc-400">Codificando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-zinc-500" />
                  <CardTitle>Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/10">
                {generatedCode ? (
                  <PreviewSandbox code={generatedCode} className="border-none rounded-none" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                    <div className="text-center space-y-3 opacity-40">
                      <div className="mx-auto w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <Eye className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-zinc-500">
                        O preview aparecerá aqui
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {showExplanation && (
          <div className="hidden lg:block w-[400px] animate-in slide-in-from-right duration-300">
            <ExplanationSidebar
              explanation={explanation}
              onClose={() => setShowExplanation(false)}
              isVisible={showExplanation}
            />
          </div>
        )}
      </div>
    </section>
  );
}
