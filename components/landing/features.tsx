"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Workflow,
  FileSignature,
  Users,
  Building,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "AI Transaction Intelligence",
    description:
      "Every deal gets a dedicated AI analyst. Risk detection, contract analysis, smart task generation, and proactive insights — all powered by GPT-4o.",
    badge: "AI-Powered",
    badgeVariant: "purple" as const,
    highlights: ["Contract risk detection", "Deadline monitoring", "Smart task generation"],
    gradient: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Workflow,
    title: "Smart Workflow Automation",
    description:
      "Build powerful transaction workflows with triggers, conditions, and actions. Automate reminders, escalations, and stage transitions without lifting a finger.",
    badge: "Automation",
    badgeVariant: "default" as const,
    highlights: ["Trigger-based automation", "Smart reminders", "Stage transitions"],
    gradient: "from-indigo-500/10 to-blue-500/10",
    border: "border-indigo-500/20",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    icon: FileSignature,
    title: "Document & E-Signature Hub",
    description:
      "Collect, organize, and sign all transaction documents in one place. AI extracts key data, tracks versions, and ensures nothing falls through the cracks.",
    badge: "E-Signatures",
    badgeVariant: "success" as const,
    highlights: ["AI document extraction", "Multi-party signing", "Full audit trail"],
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Users,
    title: "Real-Time Client Portal",
    description:
      "Give buyers and sellers a beautiful, branded portal to track progress, view documents, and sign forms — with passwordless access and mobile support.",
    badge: "Client-Facing",
    badgeVariant: "info" as const,
    highlights: ["Branded portal", "Progress tracking", "Passwordless login"],
    gradient: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Building,
    title: "Team & Brokerage Operations",
    description:
      "Built for teams of all sizes. Manage multiple coordinators, assign deals, track performance, and maintain compliance across your entire brokerage.",
    badge: "Enterprise",
    badgeVariant: "warning" as const,
    highlights: ["Role-based permissions", "Team analytics", "Multi-office support"],
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics & Reporting",
    description:
      "Understand your business with deep analytics. Track pipeline value, team performance, closing rates, and AI-powered predictive insights.",
    badge: "Intelligence",
    badgeVariant: "default" as const,
    highlights: ["Pipeline analytics", "Team performance", "AI predictions"],
    gradient: "from-pink-500/10 to-rose-500/10",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
  },
];

const roiStats = [
  { icon: Clock, value: "8 hrs", label: "Saved per week", color: "text-indigo-400" },
  { icon: TrendingUp, value: "40%", label: "Faster closings", color: "text-emerald-400" },
  { icon: CheckCircle, value: "99%", label: "On-time close rate", color: "text-violet-400" },
  { icon: Zap, value: "3x", label: "More deals handled", color: "text-amber-400" },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-4">Platform Features</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything your team needs.{" "}
            <span className="text-gradient">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Strata replaces your email chains, spreadsheets, and disconnected tools with one
            intelligent platform built for real estate operations.
          </p>
        </motion.div>

        {/* ROI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {roiStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-surface rounded-xl border border-border p-5 text-center"
              >
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-3`} />
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative bg-gradient-to-br ${feature.gradient} rounded-2xl border ${feature.border} p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-glow-sm`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 ${feature.iconBg} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <Badge variant={feature.badgeVariant} className="text-[10px]">
                    {feature.badge}
                  </Badge>
                </div>

                <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                <ul className="space-y-1.5">
                  {feature.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Learn more
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
