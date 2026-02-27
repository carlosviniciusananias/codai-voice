"use client";

import { useState } from "react";
import VoiceInput from "./components/VoiceInput";

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

      const code = await response.text();
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 dark:bg-zinc-950">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Vocode</h1>
        <p className="text-zinc-500">Fale o componente, veja a mágica.</p>
      </header>

      <main className="flex w-full max-w-5xl flex-1 flex-col gap-8 lg:flex-row">
        <div className="flex flex-col gap-4 lg:w-1/3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">Comando de Voz</h2>
            <VoiceInput 
              onTranscription={handleTranscription} 
              onError={(msg) => setError(msg)} 
            />
            
            {transcription && (
              <div className="mt-4">
                <p className="text-xs uppercase text-zinc-400 font-bold">Você disse:</p>
                <p className="text-sm italic">"{transcription}"</p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 shadow-xl dark:border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4 py-2">
            <span className="text-xs text-zinc-400 font-mono">output.tsx</span>
            {isLoading && <span className="text-xs text-blue-400 animate-pulse">Gerando código...</span>}
          </div>
          
          <pre className="flex-1 overflow-auto p-6 text-sm text-zinc-300 font-mono">
            <code>{generatedCode || "// O código aparecerá aqui..."}</code>
          </pre>
        </div>
      </main>
    </div>
  );
}