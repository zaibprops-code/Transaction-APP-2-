"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  Bot,
} from "lucide-react";
import { useAIStore } from "@/stores/ai-store";
import { AIAssistant } from "@/components/ai/ai-assistant";

export function FloatingAssistant() {
  const pathname = usePathname();
  const { isOpen, mode, openAssistant, closeAssistant, setMode, setContext } = useAIStore();

  useEffect(() => {
    setContext({ pathname });
  }, [pathname, setContext]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        isOpen ? closeAssistant() : openAssistant();
      }
    },
    [isOpen, openAssistant, closeAssistant]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isPanelOrFull = isOpen && (mode === "panel" || mode === "fullscreen");

  return (
    <>
      {/* Floating button (always visible when not open, or in panel mode) */}
      <AnimatePresence>
        {(!isOpen || mode === "panel") && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isOpen ? closeAssistant() : openAssistant())}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 group"
            aria-label="Toggle AI Assistant"
          >
            {/* Glow ring */}
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
            {/* Button */}
            <span className="relative flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-lg px-4 py-3 font-medium text-sm">
              {isOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Strata AI</span>
                  <kbd className="hidden sm:inline text-[10px] bg-white/20 rounded px-1 py-0.5 font-mono">⌘J</kbd>
                </>
              )}
            </span>
            {/* Pulse ring when closed */}
            {!isOpen && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel mode */}
      <AnimatePresence>
        {isOpen && mode === "panel" && (
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-40 flex flex-col shadow-2xl border-l border-border bg-background"
          >
            <PanelHeader
              onClose={closeAssistant}
              onExpand={() => setMode("fullscreen")}
              mode="panel"
            />
            <div className="flex-1 overflow-hidden">
              <AIAssistant />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen mode */}
      <AnimatePresence>
        {isOpen && mode === "fullscreen" && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex flex-col bg-background"
          >
            <PanelHeader
              onClose={closeAssistant}
              onCollapse={() => setMode("panel")}
              mode="fullscreen"
            />
            <div className="flex-1 overflow-hidden">
              <AIAssistant />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for panel on mobile */}
      <AnimatePresence>
        {isPanelOrFull && mode === "panel" && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAssistant}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface PanelHeaderProps {
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  mode: "panel" | "fullscreen";
}

function PanelHeader({ onClose, onExpand, onCollapse, mode }: PanelHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Strata AI</p>
          <p className="text-[10px] text-muted-foreground">Operations Assistant</p>
        </div>
      </div>

      {/* Mode controls */}
      <div className="flex items-center gap-1">
        {mode === "panel" && onExpand && (
          <button
            onClick={onExpand}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Expand to fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
        {mode === "fullscreen" && onCollapse && (
          <button
            onClick={onCollapse}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Collapse to panel"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}
        {mode === "fullscreen" && (
          <button
            onClick={onCollapse}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          aria-label="Close AI assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
