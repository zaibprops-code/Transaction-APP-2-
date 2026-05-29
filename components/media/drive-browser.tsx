"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Folder,
  FolderOpen,
  FileImage,
  ChevronRight,
  Check,
  Search,
  Cloud,
  Loader2,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { mockBrowseDrive } from "@/lib/media/providers";
import type { DriveFile } from "@/types/media";
import { cn } from "@/lib/utils";

interface DriveBrowserProps {
  onImport: (fileIds: string[]) => void;
  dealId: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DriveBrowser({ onImport, dealId }: DriveBrowserProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | undefined; name: string }>>([
    { id: undefined, name: "My Drive" },
  ]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);

  const files = mockBrowseDrive(folderId);
  const filtered = search
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1800);
  };

  const openFolder = (file: DriveFile) => {
    if (file.kind !== "folder") return;
    setBreadcrumb((prev) => [...prev, { id: file.id, name: file.name }]);
    setFolderId(file.id);
    setSelected(new Set());
    setSearch("");
  };

  const navigateTo = (index: number) => {
    const crumb = breadcrumb[index];
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    setFolderId(crumb.id);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const images = filtered.filter((f) => f.kind === "file" && f.mimeType.startsWith("image/"));
    setSelected(new Set(images.map((f) => f.id)));
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      onImport(Array.from(selected));
      setSelected(new Set());
      setImporting(false);
    }, 1200);
  };

  // Not connected state
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
          <Cloud className="w-10 h-10 text-blue-400" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground">Connect Google Drive</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Import property photos directly from your Google Drive folders
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 max-w-xs w-full space-y-2.5 text-xs text-muted-foreground">
          {["Browse Drive folders and files", "Select and import multiple photos", "Two-way sync support", "Team Drive access"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 shadow-lg"
        >
          {connecting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Connecting to Google Drive...</>
          ) : (
            <><Cloud className="w-4 h-4" /> Connect Google Drive</>
          )}
        </button>
        <p className="text-[11px] text-muted-foreground text-center max-w-xs">
          Demo mode: Clicking connect simulates the Google OAuth flow. In production, configure Google Cloud Console credentials in .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Drive header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-foreground">Google Drive</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
            Connected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setConnected(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Disconnect
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-3 text-xs flex-wrap">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <button
              onClick={() => navigateTo(i)}
              className={cn(
                "transition-colors",
                i === breadcrumb.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {i === 0 && <HardDrive className="w-3 h-3 inline mr-1" />}
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* File grid */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            No files found
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map((file) => {
              const isImage = file.kind === "file" && file.mimeType.startsWith("image/");
              const isFolder = file.kind === "folder";
              const isSelected = selected.has(file.id);

              return (
                <motion.div
                  key={file.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isFolder) openFolder(file);
                    else if (isImage) toggleSelect(file.id);
                  }}
                  className={cn(
                    "relative rounded-xl border cursor-pointer transition-all overflow-hidden",
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 shadow-glow-sm"
                      : "border-border bg-surface hover:border-indigo-500/30 hover:bg-surface-2"
                  )}
                >
                  {/* Thumbnail or folder icon */}
                  <div className="aspect-[4/3] relative flex items-center justify-center bg-surface-2">
                    {file.thumbnailLink ? (
                      <img
                        src={file.thumbnailLink}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : isFolder ? (
                      <FolderOpen className="w-10 h-10 text-blue-400/60" />
                    ) : (
                      <FileImage className="w-10 h-10 text-muted-foreground/40" />
                    )}

                    {/* Selection checkbox */}
                    {isImage && (
                      <div className={cn(
                        "absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-indigo-500 border-indigo-500"
                          : "border-white/60 bg-black/30"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    )}

                    {/* Folder item count */}
                    {isFolder && file.itemCount !== undefined && (
                      <span className="absolute bottom-1 right-1.5 text-[10px] text-white/60 bg-black/30 rounded px-1">
                        {file.itemCount}
                      </span>
                    )}
                  </div>

                  {/* File info */}
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(file.modifiedTime)}
                      {file.size ? ` · ${formatBytes(file.size)}` : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Import bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-3 flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-300">{selected.size} photo{selected.size !== 1 ? "s" : ""} selected</span>
            <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Select all images
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors disabled:opacity-70"
            >
              {importing ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</>
              ) : (
                <><Cloud className="w-3.5 h-3.5" /> Import to Deal</>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
