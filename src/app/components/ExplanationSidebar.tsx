'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ExplanationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string | null;
  isLoading: boolean;
  error: string | null;
}

export const ExplanationSidebar: React.FC<ExplanationSidebarProps> = ({
  isOpen,
  onClose,
  explanation,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Explicação Técnica</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium animate-pulse">Gerando explicação didática...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
            <p className="font-semibold mb-1">Erro ao carregar explicação</p>
            <p className="opacity-90">{error}</p>
          </div>
        ) : explanation ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-code:text-amber-600 dark:prose-code:text-amber-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
            <Lightbulb className="h-12 w-12 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              Clique no botão de lâmpada para entender como este componente foi construído.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
          Powered by Groq & Llama 3
        </p>
      </div>
    </div>
  );
};
