"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
  Sparkles,
  Download,
  Share2,
  Info,
} from "lucide-react";
import { useMediaStore } from "@/stores/media-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  exterior: "Exterior",
  kitchen: "Kitchen",
  living_room: "Living Room",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  backyard: "Backyard",
  garage: "Garage",
  inspection: "Inspection",
  renovation: "Renovation",
  closing: "Closing",
  floor_plan: "Floor Plan",
  drone: "Drone",
  other: "Other",
};

export function MediaLightbox() {
  const { lightboxOpen, lightboxIndex, lightboxItems, closeLightbox, lightboxNext, lightboxPrev } =
    useMediaStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "Escape") closeLightbox();
    },
    [lightboxOpen, lightboxNext, lightboxPrev, closeLightbox]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const current = lightboxItems[lightboxIndex];

  return (
    <AnimatePresence>
      {lightboxOpen && current && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col"
          onClick={closeLightbox}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-6 py-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">{current.name}</span>
              <Badge variant="secondary" className="text-[10px]">
                {CATEGORY_LABELS[current.category] ?? current.category}
              </Badge>
              {current.is_cover && (
                <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                  Cover Photo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">
                {lightboxIndex + 1} / {lightboxItems.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Main image area */}
          <div
            className="flex-1 flex items-center justify-center relative px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev button */}
            <button
              onClick={lightboxPrev}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl max-h-full flex flex-col items-center gap-4"
              >
                <img
                  src={current.url}
                  alt={current.name}
                  className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-2xl"
                  loading="eager"
                />
              </motion.div>
            </AnimatePresence>

            {/* Next button */}
            <button
              onClick={lightboxNext}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom panel: AI analysis + thumbnail strip */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/60 backdrop-blur-sm border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* AI Analysis */}
            {current.ai_analysis && (
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-start gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span className="text-xs text-white/60">AI Score</span>
                    <span className={cn(
                      "text-xs font-bold",
                      current.ai_analysis.quality_score >= 80 ? "text-emerald-400" :
                      current.ai_analysis.quality_score >= 60 ? "text-amber-400" : "text-red-400"
                    )}>
                      {current.ai_analysis.quality_score}/100
                    </span>
                  </div>

                  <div className="flex items-start gap-2 flex-1">
                    <Tag className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="flex gap-1.5 flex-wrap">
                      {current.ai_analysis.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] border border-indigo-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {current.ai_analysis.issues.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        {current.ai_analysis.issues.map((issue) => (
                          <p key={issue} className="text-[10px] text-amber-300">{issue}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors">
                      <Star className="w-3.5 h-3.5" />
                      Feature
                    </button>
                  </div>
                </div>

                <p className="text-xs text-white/50 mt-2 max-w-2xl">
                  {current.ai_analysis.description}
                </p>
              </div>
            )}

            {/* Thumbnail strip */}
            <div className="flex gap-2 px-6 py-3 overflow-x-auto">
              {lightboxItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => useMediaStore.getState().openLightbox(lightboxItems, i)}
                  className={cn(
                    "flex-shrink-0 rounded-lg overflow-hidden transition-all",
                    i === lightboxIndex
                      ? "ring-2 ring-indigo-500 opacity-100"
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  <img
                    src={item.thumbnail_url}
                    alt={item.name}
                    className="w-14 h-10 object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
