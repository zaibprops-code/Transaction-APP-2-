"use client";

import { useState } from "react";
import { Monitor, Layers, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { cn } from "@/lib/utils";

const DENSITY_OPTIONS = [
  {
    value: "comfortable",
    label: "Comfortable",
    desc: "More breathing room between elements",
  },
  {
    value: "compact",
    label: "Compact",
    desc: "Denser layout, fits more on screen",
  },
];

export function AppearanceSettings() {
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="space-y-4">
      {/* Theme selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Choose your preferred appearance. System automatically matches your OS setting.
            </p>
            <ThemeSwitcher showLabels />
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            Changes apply instantly — no save needed.
          </p>
        </CardContent>
      </Card>

      {/* Density */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Layout Density
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Control the spacing and information density of the interface.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDensity(opt.value as "comfortable" | "compact")}
                className={cn(
                  "flex flex-col gap-1 p-3 rounded-xl border text-left transition-all duration-150",
                  density === opt.value
                    ? "border-indigo-500/40 bg-indigo-500/8 text-foreground"
                    : "border-border bg-surface-2 text-muted-foreground hover:border-border/80 hover:text-foreground"
                )}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[11px]">{opt.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Minimize2 className="w-4 h-4 text-indigo-400" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Reduce motion</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Minimize animations and transitions throughout the app
              </p>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={cn(
                "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                reducedMotion ? "bg-indigo-500" : "bg-surface-3"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                  reducedMotion ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
