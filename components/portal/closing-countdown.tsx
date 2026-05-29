"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { differenceInDays, parseISO, format } from "date-fns";

interface ClosingCountdownProps {
  closingDate: string;
  size?: "sm" | "md" | "lg";
}

export function ClosingCountdown({ closingDate, size = "md" }: ClosingCountdownProps) {
  const [days, setDays] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const d = differenceInDays(parseISO(closingDate), new Date());
    setDays(Math.max(0, d));
  }, [closingDate]);

  const progress = mounted ? Math.min(100, Math.max(0, ((44 - days) / 44) * 100)) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke="url(#countdown-gradient-sm)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
            <defs>
              <linearGradient id="countdown-gradient-sm" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-foreground">{days}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{days} days</p>
          <p className="text-[10px] text-muted-foreground">to closing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none"
            stroke="url(#countdown-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          />
          <defs>
            <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-foreground leading-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
          >
            {days}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">days</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground mt-2">To Closing</p>
      <p className="text-xs text-muted-foreground">{format(parseISO(closingDate), "MMMM d, yyyy")}</p>
    </div>
  );
}
