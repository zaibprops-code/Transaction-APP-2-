"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  MoreVertical,
  Trash2,
  ImageOff,
  CheckCircle,
  Cloud,
  Monitor,
} from "lucide-react";
import { useMediaStore } from "@/stores/media-store";
import type { MediaItem, MediaCategory } from "@/types/media";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<MediaCategory, string> = {
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

const CATEGORY_COLORS: Partial<Record<MediaCategory, string>> = {
  exterior: "bg-blue-500/20 text-blue-300",
  kitchen: "bg-amber-500/20 text-amber-300",
  living_room: "bg-indigo-500/20 text-indigo-300",
  bedroom: "bg-violet-500/20 text-violet-300",
  bathroom: "bg-emerald-500/20 text-emerald-300",
  backyard: "bg-green-500/20 text-green-300",
  inspection: "bg-red-500/20 text-red-300",
  closing: "bg-slate-500/20 text-slate-300",
};

const ALL_CATEGORIES: Array<{ value: "all" | MediaCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "exterior", label: "Exterior" },
  { value: "kitchen", label: "Kitchen" },
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "backyard", label: "Backyard" },
  { value: "inspection", label: "Inspection" },
  { value: "closing", label: "Closing" },
  { value: "other", label: "Other" },
];

interface MediaGalleryProps {
  dealId: string;
  viewMode?: "masonry" | "grid" | "list";
}

interface MediaCardProps {
  item: MediaItem;
  index: number;
  allItems: MediaItem[];
}

function MediaCard({ item, index, allItems }: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openLightbox, setCover, setFeatured, removeItem } = useMediaStore();

  const qualityColor =
    !item.ai_analysis ? "text-muted-foreground" :
    item.ai_analysis.quality_score >= 80 ? "text-emerald-400" :
    item.ai_analysis.quality_score >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="relative group break-inside-avoid mb-2 rounded-xl overflow-hidden bg-surface cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={() => openLightbox(allItems, allItems.indexOf(item))}
    >
      <img
        src={item.thumbnail_url}
        alt={item.name}
        className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        loading="lazy"
      />

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          >
            {/* Top badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {item.is_cover && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/80 text-white">
                  Cover
                </span>
              )}
              {item.is_featured && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-500/80 text-white">
                  Featured
                </span>
              )}
            </div>

            {/* Source icon */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              {item.source === "google_drive" ? (
                <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center" title="Google Drive">
                  <Cloud className="w-3 h-3 text-blue-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center" title="Local Upload">
                  <Monitor className="w-3 h-3 text-white/60" />
                </div>
              )}
              {/* Context menu */}
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="w-5 h-5 rounded bg-black/40 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-[11px] font-medium text-white truncate">{item.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  CATEGORY_COLORS[item.category] ?? "bg-slate-500/20 text-slate-300"
                )}>
                  {CATEGORY_LABELS[item.category]}
                </span>
                {item.ai_analysis && (
                  <div className="flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                    <span className={cn("text-[10px] font-medium", qualityColor)}>
                      {item.ai_analysis.quality_score}
                    </span>
                  </div>
                )}
              </div>
              {/* AI tags */}
              {item.ai_analysis?.tags && item.ai_analysis.tags.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {item.ai_analysis.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[9px]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute top-8 right-2 z-10 bg-surface-2 border border-border rounded-lg shadow-xl overflow-hidden min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setCover(item.id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface text-foreground transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
              Set as Cover
            </button>
            <button
              onClick={() => { setFeatured(item.id, !item.is_featured); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface text-foreground transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-violet-400" />
              {item.is_featured ? "Unfeature" : "Mark Featured"}
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => { removeItem(item.id); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-red-500/10 text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MediaGallery({ dealId, viewMode = "masonry" }: MediaGalleryProps) {
  const { getItemsByDeal, activeCategory, setActiveCategory } = useMediaStore();
  const allItems = getItemsByDeal(dealId);

  const filtered = activeCategory === "all"
    ? allItems
    : allItems.filter((i) => i.category === activeCategory);

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">No photos yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Upload photos or import from Google Drive</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {ALL_CATEGORIES.map((cat) => {
          const count = cat.value === "all"
            ? allItems.length
            : allItems.filter((i) => i.category === cat.value).length;
          if (count === 0 && cat.value !== "all") return null;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value as MediaCategory | "all")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all",
                activeCategory === cat.value
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
              <span className={cn(
                "text-[10px] rounded-full px-1",
                activeCategory === cat.value ? "bg-indigo-500/30" : "bg-surface-2"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">No photos in this category</p>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <MediaCard key={item.id} item={item} index={i} allItems={filtered} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
