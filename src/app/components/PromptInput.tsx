"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

interface PromptInputProps {
  onGenerate: (text: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 500;

export default function PromptInput({ onGenerate, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setPrompt(value);
    }
  };

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt) {
      onGenerate(trimmedPrompt);
    }
  };

  const isOverLimit = prompt.length > MAX_CHARS;
  const isEmpty = prompt.trim().length === 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={handleChange}
          placeholder="Descreva o componente que você deseja criar..."
          className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100/10 dark:focus:border-zinc-100 resize-none"
          disabled={disabled}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className={`text-[10px] font-medium ${isOverLimit ? "text-red-500" : "text-zinc-400"}`}>
            {prompt.length}/{MAX_CHARS}
          </span>
        </div>
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={disabled || isEmpty || isOverLimit}
        className="w-full gap-2"
        variant="default"
      >
        <Send className="h-4 w-4" />
        Gerar componente
      </Button>
    </div>
  );
}
