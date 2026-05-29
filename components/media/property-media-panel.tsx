"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Images,
  Upload,
  Cloud,
  Sparkles,
  LayoutGrid,
  List,
  Plus,
  Camera,
  CheckCircle,
} from "lucide-react";
import { useMediaStore } from "@/stores/media-store";
import { getMediaStats } from "@/lib/media/mock-media-data";
import { MediaGallery } from "@/components/media/media-gallery";
import { MediaLightbox } from "@/components/media/media-lightbox";
import { UploadZone } from "@/components/media/upload-zone";
import { MediaImportModal } from "@/components/media/media-import-modal";
import { AIMediaPanel } from "@/components/media/ai-media-panel";
import { cn } from "@/lib/utils";

interface PropertyMediaPanelProps {
  dealId: string;
  dealAddress?: string;
}

type Tab = "gallery" | "upload" | "import" | "ai";

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: "gallery", label: "Gallery", icon: <Images className="w-3.5 h-3.5" /> },
  { id: "upload", label: "Upload", icon: <Upload className="w-3.5 h-3.5" /> },
  { id: "import", label: "Import", icon: <Cloud className="w-3.5 h-3.5" /> },
  { id: "ai", label: "AI Analysis", icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export function PropertyMediaPanel({ dealId, dealAddress }: PropertyMediaPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("gallery");
  const [importOpen, setImportOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(0);
  const { getItemsByDeal } = useMediaStore();

  const items = getItemsByDeal(dealId);
  const stats = getMediaStats(dealId);
  const coverPhoto = items.find((i) => i.is_cover);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Media header stats */}
      <div className="flex items-center gap-4 px-1 pb-4 flex-wrap">
        {/* Cover photo preview */}
        {coverPhoto && (
          <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
            <img src={coverPhoto.thumbnail_url} alt="Cover" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/60 text-white py-0.5">
              Cover
            </span>
          </div>
        )}

        {/* Stats chips */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-xs">
            <Camera className="w-3 h-3 text-indigo-400" />
            <span className="font-medium text-foreground">{items.length}</span>
            <span className="text-muted-foreground">photos</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className={cn(
              "font-medium",
              stats.completeness_score >= 80 ? "text-emerald-400" :
              stats.completeness_score >= 60 ? "text-amber-400" : "text-red-400"
            )}>
              {stats.completeness_score}%
            </span>
            <span className="text-muted-foreground">complete</span>
          </div>
          {stats.missing_rooms.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              Missing: {stats.missing_rooms.slice(0, 2).join(", ")}
              {stats.missing_rooms.length > 2 && ` +${stats.missing_rooms.length - 2}`}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted-foreground hover:text-foreground hover:border-indigo-500/30 transition-all"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            Import
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Photos
          </button>
        </div>
      </div>

      {/* Upload success toast */}
      {uploadSuccess > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {uploadSuccess} photo{uploadSuccess !== 1 ? "s" : ""} uploaded and AI-analyzed successfully
        </motion.div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-border mb-4 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all",
              activeTab === tab.id
                ? "border-indigo-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "gallery" && (
          <MediaGallery dealId={dealId} viewMode="masonry" />
        )}

        {activeTab === "upload" && (
          <div className="max-w-2xl">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Upload Property Photos</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Select a category, then drag & drop or click to upload. AI will automatically analyze and tag your photos.
              </p>
            </div>
            <UploadZone
              dealId={dealId}
              onUploaded={(uploaded) => {
                setUploadSuccess(uploaded.length);
                setTimeout(() => {
                  setActiveTab("gallery");
                  setUploadSuccess(0);
                }, 2500);
              }}
            />
          </div>
        )}

        {activeTab === "import" && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Import from External Sources</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Connect cloud storage to import property photos directly.
              </p>
            </div>

            {/* Source cards */}
            <div className="grid gap-3">
              {/* Google Drive — primary */}
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Cloud className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Google Drive</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse and import photos from Drive folders</p>
                  <div className="flex gap-1.5 mt-2">
                    {["Folder browse", "Bulk import", "Drive sync"].map((f) => (
                      <span key={f} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-blue-400 group-hover:text-blue-300 font-medium flex-shrink-0">
                  Connect →
                </div>
              </button>

              {/* Coming soon providers */}
              {[
                { name: "Dropbox", desc: "Import from Dropbox Business or Personal", color: "blue" },
                { name: "OneDrive", desc: "Connect Microsoft OneDrive account", color: "blue" },
                { name: "MLS / IDX", desc: "Pull listing photos from your MLS system", color: "amber" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border opacity-60"
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                    <LayoutGrid className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground border border-border">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-muted-foreground">
              <p className="font-medium text-indigo-300 mb-1">Provider Architecture</p>
              <p>The media system is built with an extensible provider architecture. New storage sources (Dropbox, Box, iCloud, Brokerage Libraries) can be added without refactoring. See <code className="text-indigo-300">lib/media/providers.ts</code> to add a new provider.</p>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="max-w-xl">
            <AIMediaPanel dealId={dealId} />
          </div>
        )}
      </div>

      {/* Lightbox (portal-like, renders globally) */}
      <MediaLightbox />

      {/* Import modal */}
      <MediaImportModal
        dealId={dealId}
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}
