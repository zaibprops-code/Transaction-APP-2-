"use client";

import { Sparkles, ChevronRight } from "lucide-react";
import { useAIStore } from "@/stores/ai-store";

interface CopilotBarProps {
  message: string;
  prompt: string;
  variant?: "indigo" | "amber" | "red" | "violet";
}

const variantStyles = {
  indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10",
  amber: "border-amber-500/20 bg-amber-500/5 text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10",
  red: "border-red-500/20 bg-red-500/5 text-red-300 hover:border-red-500/40 hover:bg-red-500/10",
  violet: "border-violet-500/20 bg-violet-500/5 text-violet-300 hover:border-violet-500/40 hover:bg-violet-500/10",
};

export function CopilotBar({ message, prompt, variant = "indigo" }: CopilotBarProps) {
  const { openAssistant } = useAIStore();

  return (
    <button
      onClick={() => openAssistant(prompt)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${variantStyles[variant]} group`}
    >
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
      <span className="flex-1 text-left">{message}</span>
      <span className="opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        Ask AI
        <ChevronRight className="w-3 h-3" />
      </span>
    </button>
  );
}
