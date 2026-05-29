"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Alexandra Rivera",
    title: "Lead Transaction Coordinator",
    company: "Compass Real Estate",
    avatar: "AR",
    rating: 5,
    quote:
      "CloseTrack completely transformed how I run my TC business. I used to manage everything in spreadsheets and email chains. Now I handle 40% more deals with less stress. The AI assistant is like having a second coordinator on staff.",
    metric: "Handles 40% more deals",
    metricColor: "text-emerald-400",
  },
  {
    name: "Derek Washington",
    title: "Managing Broker",
    company: "Washington Realty Group",
    avatar: "DW",
    rating: 5,
    quote:
      "We run a 12-agent brokerage and CloseTrack gave us visibility into every deal we've never had before. The AI risk alerts have saved us from multiple potential liability situations. The enterprise features are exactly what a growing brokerage needs.",
    metric: "Zero missed deadlines in 8 months",
    metricColor: "text-indigo-400",
  },
  {
    name: "Priya Nair",
    title: "Real Estate Operations Manager",
    company: "Coldwell Banker Elite",
    avatar: "PN",
    rating: 5,
    quote:
      "The client portal alone is worth it. Our buyers and sellers love being able to see exactly where their transaction stands at any time. We've seen a 60% reduction in 'where are we?' calls. CloseTrack made our team look extremely professional.",
    metric: "60% fewer client check-in calls",
    metricColor: "text-violet-400",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="success" className="mb-4">Customer Stories</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by the best coordinators.{" "}
            <span className="text-gradient">In the business.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join 2,400+ transaction coordinators and real estate professionals who trust CloseTrack.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface rounded-2xl border border-border p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 hover:border-indigo-500/20 hover:shadow-glow-sm"
            >
              <Quote className="w-8 h-8 text-indigo-500/40 mb-4" />

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className={`text-sm font-semibold ${t.metricColor} mb-4 flex items-center gap-2`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {t.metric}
              </div>

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.title} · {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
