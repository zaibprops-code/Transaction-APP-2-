"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Maximize2,
  PanelRightOpen,
  Bot,
} from "lucide-react";
import { useAIStore } from "@/stores/ai-store";
import { AIAssistant } from "@/components/ai/ai-assistant";

// FAB only renders on the main dashboard — all other pages access AI via ⌘J
const DASHBOARD_PATHS = ["/dashboard"];

export function FloatingAssistant() {
  const pathname = usePathname();
  const { isOpen, mode, openAssistant, closeAssistant, setMode, setContext } = useAIStore();

  const isDashboard = DASHBOARD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  useEffect(() => {
    setContext({ pathname });
  }, [pathname, setContext]);

  // ⌘J still works on every page even without the FAB visible
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

  const showFAB = isDashboard && (!isOpen || mode === "panel");

  return (
    <>
      {/* ── Premium floating icon — dashboard only ── */}
      <AnimatePresence>
        {showFAB && (
          // Outer wrapper handles the gentle continuous float
          <motion.div
            key="fab-wrapper"
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, opacity: 0, y: 12 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: isOpen ? 0 : [0, -5, 0],
            }}
            exit={{ scale: 0, opacity: 0, y: 12 }}
            transition={{
              scale: { type: "spring", stiffness: 420, damping: 28 },
              opacity: { duration: 0.25 },
              y: isOpen
                ? { duration: 0.2 }
                : { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
          >
            {/* Ambient glow — blurred clone behind the button */}
            <span
              className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 blur-xl opacity-30 scale-150 transition-all duration-700 group-hover:opacity-60"
              aria-hidden
            />

            {/* Slow pulse ring — visible only when closed */}
            {!isOpen && (
              <motion.span
                className="absolute inset-0 rounded-full border border-indigo-400/25"
                animate={{ scale: [1, 1.8, 1.8], opacity: [0.5, 0, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                aria-hidden
              />
            )}

            {/* The button itself */}
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={() => (isOpen ? closeAssistant() : openAssistant())}
              aria-label={isOpen ? "Close AI assistant" : "Open AI assistant (⌘J)"}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Inner ring for glass depth */}
              <span className="absolute inset-0.5 rounded-full bg-white/5 border border-white/10" aria-hidden />

              {/* Icon — animates between Sparkles and X */}
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span
                    key="close-icon"
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="relative"
                  >
                    <X className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="ai-icon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="relative"
                  >
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Panel (slides in from right) ── */}
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

      {/* ── AI Fullscreen ── */}
      <AnimatePresence>
        {isOpen && mode === "fullscreen" && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.18 }}
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

      {/* ── Mobile backdrop when panel open ── */}
      <AnimatePresence>
        {isOpen && mode === "panel" && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAssistant}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Panel / Fullscreen header ─────────────────────────────────────── */

interface PanelHeaderProps {
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  mode: "panel" | "fullscreen";
}

function PanelHeader({ onClose, onExpand, onCollapse, mode }: PanelHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 flex-1">
        <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
          {/* Live indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-background" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">CloseTrack AI</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Operations Intelligence</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        {mode === "panel" && onExpand && (
          <button
            onClick={onExpand}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Expand"
            title="Expand to fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
        {mode === "fullscreen" && onCollapse && (
          <button
            onClick={onCollapse}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Collapse to panel"
            title="Collapse to panel"
          >
            <PanelRightOpen className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
