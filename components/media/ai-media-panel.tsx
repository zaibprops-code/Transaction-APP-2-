"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Star,
  BarChart3,
  ImageOff,
} from "lucide-react";
import { useMediaStore } from "@/stores/media-store";
import { getMediaStats } from "@/lib/media/mock-media-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AIMediaPanelProps {
  dealId: string;
}

function generateListingDescription(dealId: string, items: ReturnType<typeof useMediaStore.getState>["items"]): string {
  const dealItems = items.filter((i) => i.deal_id === dealId);
  const categories = new Set(dealItems.map((i) => i.category));
  const features: string[] = [];
  if (categories.has("exterior")) features.push("beautiful curb appeal");
  if (categories.has("kitchen")) features.push("a gourmet kitchen");
  if (categories.has("living_room")) features.push("an elegant living room");
  if (categories.has("bedroom")) features.push("spacious bedrooms");
  if (categories.has("bathroom")) features.push("luxurious bathrooms");
  if (categories.has("backyard")) features.push("a stunning outdoor entertaining area");

  return `Welcome to this exceptional property showcasing ${features.join(", ")}. This meticulously maintained home offers the perfect blend of elegance and comfort. From the moment you arrive, you'll be captivated by the attention to detail throughout every space. Schedule your private showing today — this one won't last!`;
}

function generateInstagramCaption(dealId: string): string {
  return "✨ Just listed! This stunning property is everything you've been dreaming of. Gorgeous finishes, open-concept living, and a backyard made for entertaining. Swipe to see all the beautiful details ➡️\n\n🏡 Schedule a showing — DM us or tap the link in bio\n\n#JustListed #RealEstate #DreamHome #NewListing #PropertyMarketing";
}

export function AIMediaPanel({ dealId }: AIMediaPanelProps) {
  const { items } = useMediaStore();
  const stats = getMediaStats(dealId);
  const dealItems = items.filter((i) => i.deal_id === dealId);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const allTags = dealItems.flatMap((i) => i.ai_analysis?.tags ?? []);
  const tagCounts = allTags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const avgQuality = dealItems.length > 0
    ? Math.round(dealItems.reduce((s, i) => s + (i.ai_analysis?.quality_score ?? 0), 0) / dealItems.length)
    : 0;

  const issues = dealItems.flatMap((i) => (i.ai_analysis?.issues ?? []).map((issue) => ({ issue, photo: i.name })));

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  if (dealItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <ImageOff className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Upload photos to enable AI media analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Media Completeness */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">Media Completeness</span>
          </div>
          <span className={cn(
            "text-sm font-bold",
            stats.completeness_score >= 80 ? "text-emerald-400" :
            stats.completeness_score >= 60 ? "text-amber-400" : "text-red-400"
          )}>
            {stats.completeness_score}%
          </span>
        </div>
        <Progress value={stats.completeness_score} color={stats.completeness_score >= 80 ? "emerald" : stats.completeness_score >= 60 ? "amber" : "red"} />
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {["exterior", "kitchen", "living_room", "bedroom", "bathroom", "backyard"].map((room) => {
            const has = Boolean(stats.by_category[room]);
            return (
              <div key={room} className="flex items-center gap-1.5">
                {has ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                )}
                <span className={has ? "text-foreground" : "text-muted-foreground"}>
                  {room.replace(/_/g, " ")}
                  <span className="text-muted-foreground ml-1">({stats.by_category[room] ?? 0})</span>
                </span>
              </div>
            );
          })}
        </div>
        {stats.missing_rooms.length > 0 && (
          <p className="text-xs text-amber-400">
            Missing: {stats.missing_rooms.join(", ")}
          </p>
        )}
      </div>

      {/* AI Quality Score */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-foreground">AI Quality Analysis</span>
          </div>
          <span className={cn(
            "text-sm font-bold",
            avgQuality >= 80 ? "text-emerald-400" : avgQuality >= 60 ? "text-amber-400" : "text-red-400"
          )}>
            {avgQuality}/100
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { label: "High Quality", count: dealItems.filter((i) => (i.ai_analysis?.quality_score ?? 0) >= 80).length, color: "text-emerald-400" },
            { label: "Moderate", count: dealItems.filter((i) => { const s = i.ai_analysis?.quality_score ?? 0; return s >= 60 && s < 80; }).length, color: "text-amber-400" },
            { label: "Needs Attention", count: dealItems.filter((i) => (i.ai_analysis?.quality_score ?? 0) < 60).length, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-surface-2 p-2">
              <p className={cn("text-lg font-bold", stat.color)}>{stat.count}</p>
              <p className="text-muted-foreground text-[10px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {issues.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Issues Detected</p>
            {issues.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <span className="text-foreground font-medium">{item.photo}</span> — {item.issue}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Tags */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-foreground">AI Auto-Tags</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topTags.map(([tag, count]) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs"
            >
              {tag}
              <span className="text-indigo-500 text-[10px]">{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* AI Generated Listing Description */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-foreground">AI Listing Description</span>
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", generating && "animate-spin")} />
            Regenerate
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {generateListingDescription(dealId, items)}
        </p>
        <button
          onClick={() => copyText(generateListingDescription(dealId, items), "listing")}
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          {copied === "listing" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied === "listing" ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>

      {/* Instagram Caption */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-foreground">Social Media Caption</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {generateInstagramCaption(dealId)}
        </p>
        <button
          onClick={() => copyText(generateInstagramCaption(dealId), "instagram")}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {copied === "instagram" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied === "instagram" ? "Copied!" : "Copy caption"}
        </button>
      </div>
    </div>
  );
}
