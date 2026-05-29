"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIMode = "minimized" | "panel" | "fullscreen";

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  toolName?: string;
  toolResult?: unknown;
  isStreaming?: boolean;
  timestamp: number;
}

export interface AIContext {
  pathname: string;
  dealId?: string;
  dealAddress?: string;
  pageName?: string;
  initialPrompt?: string;
}

interface AIStore {
  isOpen: boolean;
  mode: AIMode;
  messages: AIMessage[];
  isThinking: boolean;
  activeContext: AIContext;
  pendingActions: string[];
  // actions
  openAssistant: (prompt?: string) => void;
  closeAssistant: () => void;
  setMode: (mode: AIMode) => void;
  addMessage: (msg: Omit<AIMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<AIMessage>) => void;
  setThinking: (v: boolean) => void;
  setContext: (ctx: Partial<AIContext>) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      mode: "panel",
      messages: [],
      isThinking: false,
      activeContext: { pathname: "/dashboard" },
      pendingActions: [],

      openAssistant: (prompt) => {
        set({ isOpen: true });
        if (prompt) {
          const store = get();
          const id = `msg-${Date.now()}`;
          store.addMessage({ role: "user", content: prompt });
        }
      },

      closeAssistant: () => set({ isOpen: false }),

      setMode: (mode) => set({ mode }),

      addMessage: (msg) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set((s) => ({
          messages: [...s.messages, { ...msg, id, timestamp: Date.now() }],
        }));
        return id;
      },

      updateMessage: (id, updates) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      setThinking: (v) => set({ isThinking: v }),

      setContext: (ctx) =>
        set((s) => ({ activeContext: { ...s.activeContext, ...ctx } })),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: "closetrack-ai-store",
      partialize: (s) => ({ messages: s.messages.slice(-50), mode: s.mode }),
    }
  )
);
