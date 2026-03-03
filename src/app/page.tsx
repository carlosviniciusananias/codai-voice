"use client";

import { useState } from "react";
import VoiceInput from "./components/VoiceInput";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

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
        throw new Error("Error to generate code.");
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
        err instanceof Error ? err.message : "Unknown error generating code.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-label="Studio de geração de componentes por voz"
      className="flex flex-1 flex-col gap-6 py-2 md:py-4"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Studio de componentes por voz
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
            Descreva em voz alta o componente que você quer. Nós cuidamos do
            código em React/Next para você.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Pronto para escutar
          </span>
          {isLoading && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              Gerando código...
            </span>
          )}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="order-1 flex flex-col">
          <CardHeader>
            <CardTitle>Comando de voz</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <VoiceInput
              onTranscription={handleTranscription}
              onError={(msg) => setError(msg)}
            />

            {transcription && (
              <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                <p className="mb-1 font-semibold uppercase tracking-wide text-[0.65rem] text-zinc-400">
                  Você disse
                </p>
                <p className="text-sm italic">“{transcription}”</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
              >
                {error}
              </div>
            )}

            {!transcription && !error && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dica: peça por componentes específicos, como{" "}
                <span className="font-mono text-[0.7rem]">
                  &quot;um card com título, descrição e botão primário&quot;
                </span>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="order-3 flex flex-1 flex-col overflow-hidden border-zinc-200 bg-zinc-950 px-0 pb-0 pt-0 text-zinc-50 shadow-md dark:border-zinc-800 lg:order-2">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2">
            <span className="text-xs font-mono text-zinc-400">output.tsx</span>
            {isLoading && (
              <span className="text-xs text-blue-400 animate-pulse">
                Gerando código...
              </span>
            )}
          </div>
          <pre
            aria-label="Código gerado"
            aria-live="polite"
            className="flex-1 overflow-auto bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200 md:p-5 md:text-sm"
          >
            <code>
              {generatedCode || "// O código gerado aparecerá aqui assim que você falar."}
            </code>
          </pre>
        </Card>

        <Card className="order-2 flex flex-1 flex-col lg:order-3">
          <CardHeader>
            <CardTitle>Preview interativo</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedCode ? (
              <div
                className="prose max-w-none rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                // O conteúdo vem do modelo; garantir que seja usado apenas em ambiente controlado.
                dangerouslySetInnerHTML={{ __html: generatedCode }}
              />
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Assim que o código for gerado, tentaremos renderizar aqui um
                preview visual do componente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
