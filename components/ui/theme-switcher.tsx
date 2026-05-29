"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light" as const, icon: Sun, label: "Light" },
  { value: "system" as const, icon: Monitor, label: "System" },
  { value: "dark" as const, icon: Moon, label: "Dark" },
];

interface ThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeSwitcher({ className, showLabels = true }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const activeIndex = OPTIONS.findIndex(o => o.value === theme);

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-xl border border-border bg-surface-2 p-1 gap-0.5",
        className
      )}
    >
      {/* Sliding pill indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg bg-background border border-border shadow-sm"
        style={{
          width: showLabels ? "calc(33.333% - 2px)" : "calc(33.333% - 2px)",
        }}
        animate={{ x: `calc(${activeIndex} * 100% + ${activeIndex * 2}px)` }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-lg transition-colors duration-150",
              showLabels ? "px-3 py-1.5 text-xs font-medium" : "p-2",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={opt.label}
          >
            <Icon className={cn("flex-shrink-0", showLabels ? "w-3.5 h-3.5" : "w-4 h-4")} />
            {showLabels && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Compact icon-only cycle button for the header */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const Icon = theme === "light" ? Sun : theme === "system" ? Monitor : Moon;
  const label = theme === "light" ? "Light" : theme === "system" ? "System" : "Dark";

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label}. Click to cycle.`}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 15, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
