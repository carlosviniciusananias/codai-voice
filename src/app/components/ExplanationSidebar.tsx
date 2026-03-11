"use client";

import ReactMarkdown from "react-markdown";
import { X, Lightbulb } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

interface ExplanationSidebarProps {
  explanation: string;
  onClose: () => void;
  isVisible: boolean;
}

export const ExplanationSidebar = ({
  explanation,
  onClose,
  isVisible,
}: ExplanationSidebarProps) => {
  if (!isVisible) return null;

  return (
    <Card className="flex flex-col h-full border-zinc-200/60 dark:border-zinc-800/60 shadow-xl bg-white dark:bg-zinc-950 overflow-hidden animate-in slide-in-from-right duration-300">
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm">Explicação do Tutor</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 prose prose-zinc dark:prose-invert prose-sm max-w-none">
        <ReactMarkdown
          components={{
            code({ children, ...props }: { children: React.ReactNode }) {
              return (
                <code
                  className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-900 dark:text-zinc-100"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre({ children, ...props }: { children: React.ReactNode }) {
              return (
                <pre
                  className="bg-zinc-900 dark:bg-black p-4 rounded-xl overflow-x-auto my-4 border border-zinc-800"
                  {...props}
                >
                  {children}
                </pre>
              );
            },
            h1: ({ children }) => <h1 className="text-lg font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-md font-semibold mt-6 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold mt-4 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-2">{children}</ul>,
            li: ({ children }) => <li className="text-zinc-600 dark:text-zinc-400">{children}</li>,
          }}
        >
          {explanation}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};