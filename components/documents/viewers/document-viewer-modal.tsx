"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  FileImage,
  File,
  Building2,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatRelativeDate, getDocumentCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { toast } from "sonner";

type ViewerState = "loading" | "ready" | "error" | "unsupported";

interface DocumentViewerModalProps {
  document: Document | null;
  allDocuments?: Document[];
  onClose: () => void;
}

function detectViewerType(mime: string, name: string): "pdf" | "image" | "office" | "none" {
  if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (
    mime.includes("word") ||
    mime.includes("officedocument") ||
    mime.includes("spreadsheet") ||
    /\.(docx?|xlsx?|pptx?)$/i.test(name)
  ) return "office";
  return "none";
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return { Icon: FileImage, bg: "bg-emerald-500/10", color: "text-emerald-400" };
  if (mime === "application/pdf") return { Icon: FileText, bg: "bg-red-500/10", color: "text-red-400" };
  if (mime.includes("word") || mime.includes("document")) return { Icon: FileText, bg: "bg-blue-500/10", color: "text-blue-400" };
  return { Icon: File, bg: "bg-muted/20", color: "text-muted-foreground" };
}

export function DocumentViewerModal({ document, allDocuments, onClose }: DocumentViewerModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>("loading");
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(document);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const docs = allDocuments ?? (document ? [document] : []);

  useEffect(() => {
    if (!document) return;
    const idx = docs.findIndex(d => d.id === document.id);
    setCurrentIdx(idx >= 0 ? idx : 0);
    setCurrentDoc(document);
  }, [document]);

  const fetchSignedUrl = useCallback(async (doc: Document) => {
    setViewerState("loading");
    setSignedUrl(null);
    try {
      const res = await fetch("/api/documents/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: doc.file_path }),
      });
      if (!res.ok) throw new Error("Failed to generate access URL");
      const json = await res.json() as { signed_url: string | null };
      if (json.signed_url) {
        setSignedUrl(json.signed_url);
        setViewerState("ready");
      } else {
        // Demo mode or no URL available — show download-only
        setViewerState("unsupported");
      }
    } catch {
      setViewerState("error");
    }
  }, []);

  useEffect(() => {
    if (currentDoc) fetchSignedUrl(currentDoc);
  }, [currentDoc, fetchSignedUrl]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 25, 200));
      if (e.key === "-") setZoom(z => Math.max(z - 25, 50));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIdx, docs.length]);

  function navigate(dir: -1 | 1) {
    const next = currentIdx + dir;
    if (next < 0 || next >= docs.length) return;
    setCurrentIdx(next);
    setCurrentDoc(docs[next]);
    setZoom(100);
  }

  async function handleDownload() {
    if (!currentDoc) return;
    if (signedUrl) {
      const a = window.document.createElement("a");
      a.href = signedUrl;
      a.download = currentDoc.name;
      a.click();
    } else {
      toast.info("Generating download link…");
      await fetchSignedUrl(currentDoc);
    }
  }

  async function handleCopyLink() {
    if (!signedUrl) return;
    await navigator.clipboard.writeText(signedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const viewerType = currentDoc ? detectViewerType(currentDoc.mime_type, currentDoc.name) : "none";
  const { Icon, bg, color } = currentDoc ? fileIcon(currentDoc.mime_type) : { Icon: File, bg: "bg-muted/20", color: "text-muted-foreground" };

  if (!currentDoc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "relative z-10 flex flex-col bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden",
            fullscreen ? "w-screen h-screen rounded-none" : "w-[90vw] max-w-5xl h-[88vh]"
          )}
        >
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
            {/* File info */}
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{currentDoc.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{getDocumentCategoryLabel(currentDoc.category)}</span>
                <span>·</span>
                <span>{formatFileSize(currentDoc.file_size)}</span>
                {currentDoc.deal_address && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-teal-400">
                      <Building2 className="w-2.5 h-2.5" />{currentDoc.deal_address}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{formatRelativeDate(currentDoc.created_at)}</span>
              </div>
            </div>

            {/* Navigation */}
            {docs.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <button onClick={() => navigate(-1)} disabled={currentIdx === 0} className="p-1 rounded hover:bg-surface-2 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>{currentIdx + 1} / {docs.length}</span>
                <button onClick={() => navigate(1)} disabled={currentIdx === docs.length - 1} className="p-1 rounded hover:bg-surface-2 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom (PDF / image only) */}
            {(viewerType === "pdf" || viewerType === "image") && viewerState === "ready" && (
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom(z => Math.max(z - 25, 50))} className="p-1.5 rounded hover:bg-surface-2 transition-colors">
                  <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(z + 25, 200))} className="p-1.5 rounded hover:bg-surface-2 transition-colors">
                  <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {signedUrl && (
                <>
                  <Button variant="ghost" size="icon-sm" onClick={handleCopyLink} title="Copy link">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Button>
                  <a href={signedUrl} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon-sm" title="Open in new tab">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </a>
                </>
              )}
              <Button variant="ghost" size="icon-sm" onClick={handleDownload} title="Download">
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setFullscreen(f => !f)} title="Toggle fullscreen">
                {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" /> : <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close (Esc)">
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Viewer body */}
          <div className="flex-1 min-h-0 overflow-hidden relative bg-[#111]">
            {viewerState === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-sm text-muted-foreground">Generating secure access…</p>
              </div>
            )}

            {viewerState === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-foreground font-medium">Preview unavailable</p>
                <p className="text-xs text-muted-foreground">Could not generate access URL.</p>
                <Button size="sm" variant="outline" onClick={() => fetchSignedUrl(currentDoc)}>Retry</Button>
              </div>
            )}

            {viewerState === "unsupported" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", bg)}>
                  <Icon className={cn("w-8 h-8", color)} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">{currentDoc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {viewerType === "office" ? "Office documents cannot be previewed inline." : "Preview not available for this file type."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleDownload} className="gap-2">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
            )}

            {viewerState === "ready" && signedUrl && (
              <>
                {/* PDF viewer */}
                {viewerType === "pdf" && (
                  <iframe
                    ref={iframeRef}
                    src={`${signedUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=${zoom}`}
                    className="w-full h-full border-0"
                    title={currentDoc.name}
                    onLoad={() => setViewerState("ready")}
                    onError={() => setViewerState("error")}
                  />
                )}

                {/* Image viewer */}
                {viewerType === "image" && (
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                    <img
                      src={signedUrl}
                      alt={currentDoc.name}
                      style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center", transition: "transform 0.2s ease" }}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                )}

                {/* Office / generic — trigger download */}
                {(viewerType === "office" || viewerType === "none") && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", bg)}>
                      <Icon className={cn("w-8 h-8", color)} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground mb-1">{currentDoc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(currentDoc.file_size)} · {getDocumentCategoryLabel(currentDoc.category)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleDownload} className="gap-2">
                        <Download className="w-3.5 h-3.5" /> Download File
                      </Button>
                      <a href={signedUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="gap-2">
                          <ExternalLink className="w-3.5 h-3.5" /> Open in Browser
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer status bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface/60 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{getDocumentCategoryLabel(currentDoc.category)}</Badge>
              {currentDoc.is_signed && <Badge variant="success" className="text-[10px]">Signed</Badge>}
              {currentDoc.ai_extracted && <Badge variant="purple" className="text-[10px]">AI Analyzed</Badge>}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {viewerState === "ready" ? "Secure access active · expires in 1h" : viewerState === "loading" ? "Generating secure access…" : ""}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
