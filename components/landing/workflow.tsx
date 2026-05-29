"use client";

import { motion } from "framer-motion";
import {
  PlusCircle,
  ListChecks,
  FolderOpen,
  PenLine,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: 1,
    icon: PlusCircle,
    title: "Deal Created",
    description: "Create a deal or import from your MLS. AI immediately begins analysis.",
    color: "indigo",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
  {
    step: 2,
    icon: ListChecks,
    title: "Tasks Generated",
    description: "AI reads the contract and generates a complete task checklist with deadlines.",
    color: "violet",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
  },
  {
    step: 3,
    icon: FolderOpen,
    title: "Documents Collected",
    description: "Smart document requests are sent automatically. AI tracks receipt and extracts key data.",
    color: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  {
    step: 4,
    icon: PenLine,
    title: "Signatures Obtained",
    description: "E-signature requests are sent to all parties with automated reminders and audit trails.",
    color: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  {
    step: 5,
    icon: Trophy,
    title: "Deal Closed",
    description: "Closing is confirmed, docs are archived, and analytics are updated automatically.",
    color: "emerald",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
];

export function WorkflowSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="success" className="mb-4">Transaction Lifecycle</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            From offer to close.{" "}
            <span className="text-gradient">Fully automated.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CloseTrack manages the entire transaction lifecycle with intelligent automation at every step.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:flex items-start gap-0 relative">
          {/* Connecting line */}
          <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-emerald-500/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 flex flex-col items-center text-center px-3"
              >
                <div
                  className={`relative z-10 w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-4 shadow-sm`}
                >
                  <Icon className={`w-5 h-5 ${step.text}`} />
                </div>
                <div className={`text-xs font-bold ${step.text} mb-1 uppercase tracking-wide`}>
                  Step {step.step}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`flex items-start gap-4 p-4 rounded-xl border ${step.bg} ${step.border}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-surface flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${step.text}`} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${step.text} uppercase tracking-wide mb-0.5`}>
                    Step {step.step}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 ml-auto flex-shrink-0 hidden" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
