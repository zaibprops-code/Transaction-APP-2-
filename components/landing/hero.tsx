"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  TrendingUp,
  CheckCircle,
  Zap,
  Building2,
  FileText,
  BarChart3,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

function StatCounter({
  value,
  suffix,
  label,
  start,
}: {
  value: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const count = useCounter(value, 2000, start);
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-gradient">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const demoTabs = [
  { id: "deals", label: "Deals Pipeline", icon: Building2 },
  { id: "ai", label: "AI Assistant", icon: Brain },
  { id: "docs", label: "Documents", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const DashboardMockup = ({ activeTab }: { activeTab: string }) => {
  const colors = {
    deals: "from-indigo-500/20 to-violet-500/20",
    ai: "from-violet-500/20 to-purple-500/20",
    docs: "from-blue-500/20 to-indigo-500/20",
    analytics: "from-emerald-500/20 to-teal-500/20",
  };

  const stages = ["New Lead", "Under Contract", "Due Diligence", "Pending Docs", "Clear to Close"];
  const cards = [
    { stage: 0, address: "1847 Oakwood Dr", price: "$875K", score: 88, color: "emerald" },
    { stage: 1, address: "4520 Riverside Blvd", price: "$485K", score: 62, color: "amber" },
    { stage: 1, address: "7801 Summit Ridge", price: "$395K", score: 79, color: "emerald" },
    { stage: 2, address: "923 Maple Court", price: "$620K", score: 45, color: "red" },
    { stage: 3, address: "3340 Elm Street", price: "$540K", score: 55, color: "amber" },
    { stage: 4, address: "215 Harbor View", price: "$1.2M", score: 82, color: "emerald" },
  ];

  if (activeTab === "deals") {
    return (
      <div className="h-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Deal Pipeline</h3>
          <Badge variant="default" className="text-xs">6 Active</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {stages.map((stage, i) => (
            <div key={stage} className="min-w-[140px] flex-shrink-0">
              <div className="text-xs text-muted-foreground mb-2 font-medium">{stage}</div>
              <div className="space-y-2">
                {cards.filter(c => c.stage === i).map(card => (
                  <div
                    key={card.address}
                    className="bg-surface-2 rounded-lg p-2.5 border border-border text-xs"
                  >
                    <div className="font-medium text-foreground truncate">{card.address}</div>
                    <div className="text-muted-foreground mt-0.5">{card.price}</div>
                    <div className={`mt-1.5 text-[10px] font-semibold ${
                      card.color === "emerald" ? "text-emerald-400" :
                      card.color === "amber" ? "text-amber-400" : "text-red-400"
                    }`}>
                      ● {card.score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "ai") {
    return (
      <div className="h-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-closetrack flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold">CloseTrack AI</span>
          <Badge variant="purple" className="text-[10px]">GPT-4o</Badge>
        </div>
        <div className="space-y-3 flex-1 overflow-hidden">
          <div className="bg-surface-2 rounded-lg p-3 text-xs text-muted-foreground">
            What needs my attention today?
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs space-y-2">
            <p className="text-foreground font-medium">🔴 Critical: 923 Maple Court</p>
            <p className="text-muted-foreground">Inspection deadline in 2 days — no report received</p>
            <p className="text-foreground font-medium mt-2">🟡 High: 4520 Riverside Blvd</p>
            <p className="text-muted-foreground">3 documents missing, closing in 18 days</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 text-xs text-muted-foreground">
            Draft follow-up email for 923 Maple Court?
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["Summarize deals", "Risk analysis", "Draft email"].map(p => (
              <span key={p} className="text-[10px] bg-surface border border-border rounded-md px-2 py-1 text-muted-foreground cursor-pointer hover:text-foreground hover:border-indigo-500/40 transition-colors">{p}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "docs") {
    const docs = [
      { name: "Purchase Agreement.pdf", cat: "Contract", status: "Signed", size: "2.3 MB" },
      { name: "HOA Documents.pdf", cat: "Disclosure", status: "Pending", size: "1.8 MB" },
      { name: "Inspection Report.pdf", cat: "Inspection", status: "AI Analyzed", size: "5.0 MB" },
      { name: "Lender Letter.pdf", cat: "Financing", status: "Missing", size: "—" },
    ];
    return (
      <div className="h-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Documents</h3>
          <Badge variant="info">AI Extract</Badge>
        </div>
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.name} className="flex items-center gap-3 bg-surface-2 rounded-lg p-2.5 border border-border">
              <div className="w-7 h-8 bg-red-500/10 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{doc.name}</div>
                <div className="text-[10px] text-muted-foreground">{doc.cat} · {doc.size}</div>
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                doc.status === "Signed" ? "text-emerald-400 bg-emerald-400/10" :
                doc.status === "Missing" ? "text-red-400 bg-red-400/10" :
                doc.status === "AI Analyzed" ? "text-violet-400 bg-violet-400/10" :
                "text-amber-400 bg-amber-400/10"
              }`}>{doc.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Analytics
  const bars = [{ label: "Jun", h: 60 }, { label: "Jul", h: 80 }, { label: "Aug", h: 65 }, { label: "Sep", h: 95 }, { label: "Oct", h: 85 }, { label: "Nov", h: 50 }];
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Analytics Overview</h3>
        <span className="text-xs text-muted-foreground">Last 6 months</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Deals Closed", value: "61", trend: "+12%" }, { label: "Avg Days", value: "30", trend: "-8%" }, { label: "On-Time Rate", value: "94%", trend: "+3%" }].map(m => (
          <div key={m.label} className="bg-surface-2 rounded-lg p-2.5 border border-border">
            <div className="text-lg font-bold text-gradient">{m.value}</div>
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
            <div className="text-[10px] text-emerald-400">{m.trend}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-surface-2 rounded-lg border border-border p-3">
        <div className="text-[10px] text-muted-foreground mb-2">Deals Closed / Month</div>
        <div className="flex items-end gap-1 h-16">
          {bars.map(bar => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-gradient-to-t from-indigo-500 to-violet-500 opacity-80 transition-all"
                style={{ height: `${bar.h}%` }}
              />
              <span className="text-[8px] text-muted-foreground">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function Hero() {
  const [activeTab, setActiveTab] = useState("deals");
  const [startCounters, setStartCounters] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStartCounters(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl animate-float [animation-delay:2s]" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500/6 rounded-full blur-3xl animate-float [animation-delay:4s]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-6"
          >
            <Badge variant="purple" className="px-3 py-1 text-xs gap-1.5">
              <Zap className="w-3 h-3" />
              AI-Native Transaction Platform — Now in Beta
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Close More Deals.{" "}
            <span className="text-gradient">Track Every Step.</span>
            {" "}AI Does the Rest.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            CloseTrack is the AI-native transaction coordination platform — built to close more deals, track every step, and automate the work your team shouldn't have to do manually.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          >
            <Button size="xl" asChild className="w-full sm:w-auto">
              <Link href="/signup">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-3 h-3 fill-current" />
              </div>
              Watch 2-min demo
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xs text-muted-foreground mb-16"
          >
            No credit card required · 14-day free trial · Cancel anytime
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-16"
          >
            <StatCounter value={2400} suffix="+" label="Coordinators" start={startCounters} />
            <StatCounter value={4} suffix=".2B" label="Managed in Deals" start={startCounters} />
            <StatCounter value={99} suffix=".2%" label="On-Time Close Rate" start={startCounters} />
          </motion.div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
              Trusted by teams at
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {["Compass RE", "Century 21", "Coldwell Banker", "Keller Williams", "eXp Realty"].map(
                (brand) => (
                  <span key={brand} className="text-muted-foreground/50 text-sm font-medium hover:text-muted-foreground transition-colors">
                    {brand}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* Tabs */}
          <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
            {demoTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-surface text-foreground border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dashboard frame */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-violet-500/20 blur-2xl rounded-2xl transform scale-95 opacity-50" />

            <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4">
                  <div className="bg-surface-2 rounded-md h-5 text-[10px] text-muted-foreground flex items-center px-2 max-w-xs mx-auto">
                    app.closetrack.co/deals
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="flex h-[400px] sm:h-[480px]">
                {/* Sidebar */}
                <div className="w-14 bg-surface border-r border-border flex flex-col items-center py-4 gap-3">
                  {[Building2, FileText, CheckCircle, BarChart3].map((Icon, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        i === 0 && activeTab === "deals"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : i === 2 && activeTab === "docs"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : i === 3 && activeTab === "analytics"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "text-muted-foreground hover:bg-surface-2"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  ))}
                </div>

                {/* Main area */}
                <div className="flex-1 p-4 overflow-hidden">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <DashboardMockup activeTab={activeTab} />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { icon: CheckCircle, label: "Zero missed deadlines" },
              { icon: TrendingUp, label: "40% faster closings" },
              { icon: Zap, label: "Save 8+ hrs/week" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
