"use client";

import React from "react";
import { use } from "react";
import { useRef, useState, useCallback } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Upload, AlertCircle, Search, FolderOpen, Loader2 } from "lucide-react";
import { usePortalData } from "@/lib/hooks/usePortalData";
import { PortalNav } from "@/components/portal/portal-nav";
import { DocumentCard } from "@/components/portal/document-card";
import { AIHelpWidget } from "@/components/portal/ai-help-widget";
import { Button } from "@/components/ui/button";
import { cn, isDemo } from "@/lib/utils";
import type { PortalDocCategory } from "@/types/portal";
import { toast } from "sonner";

const CATEGORIES: { value: "all" | PortalDocCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "contract", label: "Contracts" },
  { value: "disclosure", label: "Disclosures" },
  { value: "inspection", label: "Inspection" },
  { value: "financing", label: "Financing" },
  { value: "closing", label: "Closing" },
  { value: "other", label: "Other" },
];

export default function DocumentsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { portal, loading } = usePortalData(token);
  const [activeCategory, setActiveCategory] = useState<"all" | PortalDocCategory>("all");
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const daysToClose = portal ? differenceInDays(parseISO(portal.closingDate), new Date()) : 0;
  const documents = portal?.documents ?? [];

  const filtered = documents.filter((doc: import("@/types/portal").PortalDocument) => {
    const matchCat = activeCategory === "all" || doc.category === activeCategory;
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const actionRequired = documents.filter(
    (d: import("@/types/portal").PortalDocument) => d.status === "action_required"
  ).length;

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (isDemo() || token === "demo-token-2024") {
        toast.success("Upload simulated in demo mode");
        return;
      }

      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      formData.append("token", token);

      try {
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          toast.success("Document uploaded successfully");
        } else {
          toast.error("Upload failed. Please try again.");
        }
      } catch {
        toast.error("Upload failed. Please check your connection.");
      } finally {
        setUploading(false);
      }
    },
    [token]
  );

  return (
    <div className="min-h-screen bg-background">
      <PortalNav
        token={token}
        clientName={portal?.clientName ?? ""}
        clientInitials={portal?.clientInitials ?? ""}
        propertyAddress={portal?.propertyAddress ?? ""}
        daysToClose={daysToClose}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Documents</h1>
              <p className="text-muted-foreground mt-1">
                {portal ? (
                  <>
                    {portal.docsComplete} of {portal.docsTotal} complete
                    {actionRequired > 0 && (
                      <span className="ml-2 text-red-400 font-medium">
                        · {actionRequired} need your attention
                      </span>
                    )}
                  </>
                ) : (
                  "Loading…"
                )}
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2 flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e.target.files)}
            />
          </div>
        </motion.div>

        {/* Upload dropzone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed p-6 text-center mb-6 transition-all duration-200 cursor-pointer",
            dragOver
              ? "border-indigo-400 bg-indigo-500/10"
              : "border-border hover:border-indigo-500/40 hover:bg-surface-2"
          )}
        >
          <Upload
            className={cn("w-6 h-6 mx-auto mb-2", dragOver ? "text-indigo-400" : "text-muted-foreground")}
          />
          <p className="text-sm font-medium text-foreground">Drop files here to upload</p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse — PDF, JPG, PNG up to 25MB
          </p>
        </motion.div>

        {/* Action required alert */}
        {actionRequired > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-semibold text-red-400">
                {actionRequired} document{actionRequired > 1 ? "s" : ""}
              </span>{" "}
              require your action to keep the transaction on track.
            </p>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full pl-9 pr-4 h-10 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeCategory === cat.value
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent"
              )}
            >
              {cat.label}
              <span className="ml-1.5 text-[10px] opacity-60">
                {cat.value === "all"
                  ? documents.length
                  : documents.filter((d) => d.category === cat.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Document list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search || activeCategory !== "all"
                ? "No documents match your filter."
                : "No documents have been shared yet. Your coordinator will add them as the transaction progresses."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc, i) => (
              <DocumentCard key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        )}
      </main>

      <AIHelpWidget />
    </div>
  );
}
