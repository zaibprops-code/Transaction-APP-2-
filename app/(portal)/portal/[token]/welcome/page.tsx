"use client";

import { use } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { MOCK_CLIENT_PORTAL } from "@/lib/portal-mock-data";
import { PortalNav } from "@/components/portal/portal-nav";
import { AIHelpWidget } from "@/components/portal/ai-help-widget";
import { Button } from "@/components/ui/button";
import { differenceInDays, parseISO } from "date-fns";

const INTRO_STEPS = [
  {
    icon: LayoutDashboard,
    title: "Your Overview",
    description:
      "See everything about your transaction at a glance — key dates, progress, and what needs your attention.",
    color: "bg-indigo-500/15 text-indigo-400",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description:
      "Follow each milestone from offer acceptance through closing. Always know exactly where you are.",
    color: "bg-teal-500/15 text-teal-400",
  },
  {
    icon: FileText,
    title: "Your Documents",
    description:
      "Access, review, and sign documents securely. AI summaries make complex paperwork easy to understand.",
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: Users,
    title: "Contact Your Team",
    description:
      "Message your coordinator, agent, lender, and escrow officer directly from your portal — anytime.",
    color: "bg-violet-500/15 text-violet-400",
  },
];

export default function WelcomePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const portal = MOCK_CLIENT_PORTAL;
  const daysToClose = differenceInDays(parseISO(portal.closingDate), new Date());

  return (
    <div className="min-h-screen bg-background">
      <PortalNav
        token={token}
        clientName={portal.clientName}
        clientInitials={portal.clientInitials}
        propertyAddress={portal.propertyAddress}
        daysToClose={daysToClose}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Welcome hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Animated logo mark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 22, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25"
          >
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4"/>
              <line x1="2" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7"/>
              <line x1="2" y1="12.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="15.8" cy="12.5" r="1.7" fill="white"/>
            </svg>
          </motion.div>

          <p className="text-sm font-medium text-indigo-400 mb-2">Welcome to CloseTrack</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            Your transaction portal
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
              is ready.
            </span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Hi {portal.clientName.split(" ")[0]}! Your coordinator has set up a secure portal for your purchase of{" "}
            <span className="text-foreground font-medium">{portal.propertyAddress}</span>.
            Everything is in one place — no more back-and-forth emails.
          </p>
        </motion.div>

        {/* Intro steps */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {INTRO_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
                className="rounded-xl border border-border bg-surface p-5 hover:border-indigo-500/25 hover:bg-surface-2 transition-all duration-200"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${step.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* AI intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="flex items-start gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4 mb-8"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">Your AI transaction assistant is here</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tap the sparkle button anytime to ask questions — "What happens next?", "What documents do I need?", or anything else about your transaction.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center"
        >
          <Link href={`/portal/${token}`}>
            <Button size="lg" className="gap-2 px-8 shadow-lg shadow-indigo-500/20">
              Go to My Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            {daysToClose > 0 ? `${daysToClose} days until closing · ` : ""}
            Questions? Tap the sparkle button below.
          </p>
        </motion.div>
      </main>

      <AIHelpWidget />
    </div>
  );
}
