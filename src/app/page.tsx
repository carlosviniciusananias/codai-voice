"use client";

import { useState } from "react";
import VoiceInput from "./components/VoiceInput";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Loader2, Mic, Code2, Eye } from "lucide-react";

export default function Home() {
  const [transcription, setTranscription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscription = async (text: string) => {
    setTranscription(text);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text }),
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
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-zinc-900 dark:text-zinc-50">
            Studio Studio
          </h1>
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

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col shadow-lg border-zinc-200/60 dark:border-zinc-800/60">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-zinc-500" />
                <CardTitle>Comando de Voz</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <VoiceInput
                onTranscription={handleTranscription}
                onError={(msg) => setError(msg)}
              />

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
                  <span className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                    TSX
                  </span>
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
              <CardContent className="flex-1 flex items-center justify-center p-8 bg-zinc-50/30 dark:bg-zinc-900/10">
                {generatedCode ? (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <div
                      className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-500 animate-in fade-in zoom-in-95"
                      dangerouslySetInnerHTML={{ __html: generatedCode }}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-3 opacity-40">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Eye className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500">
                      O preview aparecerá aqui
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
