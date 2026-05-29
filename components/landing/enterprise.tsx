"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Key, FileCheck, Globe, LifeBuoy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const enterpriseFeatures = [
  { icon: Shield, label: "SOC 2 Type II", desc: "Security audited" },
  { icon: Lock, label: "SSO / SAML", desc: "Enterprise auth" },
  { icon: Key, label: "Custom API", desc: "Full REST access" },
  { icon: FileCheck, label: "Audit Logs", desc: "Full traceability" },
  { icon: Globe, label: "GDPR Compliant", desc: "Data residency" },
  { icon: LifeBuoy, label: "Dedicated CSM", desc: "White glove" },
];

export function EnterpriseSection() {
  return (
    <section
      id="enterprise"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface/30 to-background"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-3xl p-10 md:p-14 text-center"
        >
          <Badge variant="purple" className="mb-4">Enterprise</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for brokerages.{" "}
            <span className="text-gradient">Scaled for enterprise.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Strata Enterprise offers custom pricing, dedicated support, white-label portals, and
            compliance-grade infrastructure for the most demanding real estate organizations.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-left max-w-2xl mx-auto">
            {enterpriseFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center gap-3 bg-surface/60 rounded-xl border border-border/50 px-4 py-3"
                >
                  <Icon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{feat.label}</div>
                    <div className="text-xs text-muted-foreground">{feat.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="#">
                Contact enterprise sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#">View security docs</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
