"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Glow orb */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-500/20 to-transparent blur-3xl" />
          <div className="relative bg-gradient-to-br from-indigo-500/10 via-teal-500/5 to-emerald-500/8 rounded-3xl border border-indigo-500/20 p-12 md:p-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-closetrack flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Zap className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start closing more.{" "}
              <span className="text-gradient">Track everything.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 2,400+ real estate teams who close more deals, miss fewer deadlines, and
              spend less time on admin — with CloseTrack.
            </p>

            {/* Email capture */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 h-11 rounded-lg border border-border bg-surface-2 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="lg" asChild className="flex-shrink-0">
                <Link href={`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`}>
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
