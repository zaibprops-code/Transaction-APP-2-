"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    color?: "indigo" | "emerald" | "amber" | "red";
  }
>(({ className, value, color = "indigo", ...props }, ref) => {
  const trackColors = {
    indigo: "from-indigo-500 to-violet-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    red: "from-red-500 to-pink-500",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-gradient-to-r transition-all duration-500",
          trackColors[color]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
