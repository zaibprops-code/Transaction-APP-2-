"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, HardDrive, Laptop, ChevronRight, Clock } from "lucide-react";
import { DriveBrowser } from "@/components/media/drive-browser";
import { mockImportFiles, MEDIA_PROVIDERS } from "@/lib/media/providers";
import { useMediaStore } from "@/stores/media-store";
import { cn } from "@/lib/utils";

interface MediaImportModalProps {
  dealId: string;
  open: boolean;
  onClose: () => void;
}

type Source = "picker" | "local" | "google_drive";

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google_drive: <Cloud className="w-5 h-5 text-blue-400" />,
  dropbox: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5L6 8.25l6 3.75 6-3.75L12 4.5zM6 15.75L12 19.5l6-3.75-6-3.75-6 3.75zM6 8.25L0 12l6 3.75 6-3.75-6-3.75zM18 8.25l-6 3.75 6 3.75 6-3.75-6-3.75z" />
    </svg>
  ),
  onedrive: (
    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 12.5a4.5 4.5 0 019 0 3.5 3.5 0 01.5 6.9H4.5a3.5 3.5 0 01.5-6.9z" />
    </svg>
  ),
  mls: <HardDrive className="w-5 h-5 text-amber-400" />,
};

export function MediaImportModal({ dealId, open, onClose }: MediaImportModalProps) {
  const [source, setSource] = useState<Source>("picker");
  const [recentImports, setRecentImports] = useState<string[]>([]);
  const { addItems } = useMediaStore();

  const handleDriveImport = (fileIds: string[]) => {
    const items = mockImportFiles(fileIds, dealId);
    addItems(items);
    setRecentImports((prev) => [...prev, ...fileIds]);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="import-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="import-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">Import Property Media</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a source to import photos from</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Source picker sidebar */}
              <div className="w-48 border-r border-border p-3 space-y-1 flex-shrink-0">
                <button
                  onClick={() => setSource("local")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                    source === "local"
                      ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  )}
                >
                  <Laptop className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Computer</p>
                    <p className="text-[10px] text-muted-foreground">Local files</p>
                  </div>
                </button>

                <div className="pt-1 pb-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Cloud Sources</p>
                </div>

                {MEDIA_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => !provider.comingSoon && setSource(provider.id as Source)}
                    disabled={provider.comingSoon}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left relative",
                      source === provider.id
                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        : provider.comingSoon
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                    )}
                  >
                    <span className="flex-shrink-0">{PROVIDER_ICONS[provider.id]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{provider.name}</p>
                      {provider.comingSoon && (
                        <p className="text-[10px] text-muted-foreground/60">Coming soon</p>
                      )}
                    </div>
                    {source === provider.id && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  </button>
                ))}

                {recentImports.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 px-2 mb-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground px-3">
                      {recentImports.length} file{recentImports.length !== 1 ? "s" : ""} imported this session
                    </p>
                  </div>
                )}
              </div>

              {/* Content area */}
              <div className="flex-1 p-6 overflow-hidden flex flex-col">
                {source === "picker" && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <p className="text-muted-foreground text-sm">Select a source from the left</p>
                  </div>
                )}

                {source === "local" && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-foreground">Upload from Your Computer</p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop photos or click to browse. Supports JPG, PNG, HEIC, WebP up to 50MB each.
                    </p>
                    <div
                      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border hover:border-indigo-500/50 hover:bg-surface-2 cursor-pointer transition-all py-12 px-6"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = "image/*";
                        input.click();
                      }}
                    >
                      <Laptop className="w-10 h-10 text-muted-foreground/40" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Click to browse files</p>
                        <p className="text-xs text-muted-foreground mt-1">or drag & drop photos here</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      In demo mode, use the Upload tab in the media panel for full upload functionality.
                    </p>
                  </div>
                )}

                {source === "google_drive" && (
                  <DriveBrowser onImport={handleDriveImport} dealId={dealId} />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
