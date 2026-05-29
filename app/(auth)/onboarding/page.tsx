"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Your role" },
  { id: 2, label: "Your team" },
  { id: 3, label: "Your setup" },
];

const roles = [
  { id: "solo_coordinator", icon: User, label: "Solo TC", desc: "I coordinate transactions independently" },
  { id: "agent", icon: Building2, label: "Real Estate Agent", desc: "I'm an agent who needs TC support" },
  { id: "team_coordinator", icon: Users, label: "Team Coordinator", desc: "I manage TCs for a team or brokerage" },
  { id: "brokerage_admin", icon: Building2, label: "Brokerage Admin", desc: "I run operations for a brokerage" },
];

const teamSizes = [
  { id: "solo", label: "Just me" },
  { id: "small", label: "2–5 people" },
  { id: "medium", label: "6–15 people" },
  { id: "large", label: "15+ people" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push("/dashboard");
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                step > s.id
                  ? "bg-emerald-500 text-white"
                  : step === s.id
                  ? "bg-gradient-closetrack text-white shadow-glow-sm"
                  : "bg-surface-2 text-muted-foreground border border-border"
              )}
            >
              {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:block",
                step === s.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground/30 ml-auto flex-shrink-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">What best describes you?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We&apos;ll personalize your dashboard based on your role.
            </p>
            <div className="space-y-3 mb-8">
              {roles.map(r => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      role === r.id
                        ? "bg-indigo-500/10 border-indigo-500/40"
                        : "bg-surface border-border hover:bg-surface-2 hover:border-border/80"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        role === r.id ? "bg-indigo-500/20" : "bg-surface-2"
                      )}
                    >
                      <Icon
                        className={cn("w-5 h-5", role === r.id ? "text-indigo-400" : "text-muted-foreground")}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.desc}</div>
                    </div>
                    {role === r.id && <Check className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <Button className="w-full" disabled={!role} onClick={() => setStep(2)}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">How big is your team?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This helps us set up the right features and permissions.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {teamSizes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTeamSize(t.id)}
                  className={cn(
                    "p-4 rounded-xl border text-sm font-medium transition-all",
                    teamSize === t.id
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                      : "bg-surface border-border text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" disabled={!teamSize} onClick={() => setStep(3)}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Set up your workspace</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Give your CloseTrack workspace a name. You can always change this later.
            </p>
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Organization / Brokerage name</label>
                <Input
                  placeholder="e.g. Mitchell TC Group"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                />
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-400">AI Setup</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  CloseTrack will import sample deals and configure AI workflows based on your role.
                  You&apos;ll be up and running in under 2 minutes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1" loading={loading} onClick={handleFinish}>
                <Sparkles className="w-4 h-4" />
                Launch CloseTrack
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
