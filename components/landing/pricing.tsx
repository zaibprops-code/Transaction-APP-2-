"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="default" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple pricing. <span className="text-gradient">Powerful results.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free for 14 days. No credit card required. Scale as you grow.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                !annual ? "bg-surface-2 text-foreground shadow-sm border border-border" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                annual ? "bg-surface-2 text-foreground shadow-sm border border-border" : "text-muted-foreground"
              )}
            >
              Annual
              <Badge variant="success" className="text-[10px] py-0">Save 20%</Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col",
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/10 to-violet-500/10 border-indigo-500/40 shadow-glow"
                  : "bg-surface border-border"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-strata text-white border-0 px-3 text-xs font-semibold shadow-glow-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {plan.id === "starter" && <Zap className="w-4 h-4 text-indigo-400" />}
                  {plan.id === "growth" && <Building2 className="w-4 h-4 text-violet-400" />}
                  {plan.id === "enterprise" && <Building2 className="w-4 h-4 text-amber-400" />}
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1">
                  {plan.price_monthly !== null ? (
                    <>
                      <span className="text-4xl font-bold text-foreground">
                        ${annual ? plan.price_annual : plan.price_monthly}
                      </span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                      {annual && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          ${plan.price_monthly}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-foreground">Custom</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
                asChild
              >
                <Link href={plan.id === "enterprise" ? "#enterprise" : "/signup"}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Comparison note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          All plans include: SSL encryption, 99.9% uptime SLA, real-time sync, and 24/7 platform monitoring.
        </motion.p>
      </div>
    </section>
  );
}
