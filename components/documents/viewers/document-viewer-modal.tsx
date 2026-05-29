"use client";

import {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, FileText, FileImage,
  File, Building2, Copy, CheckCircle, Search, Pen, Highlighter, Type,
  Square, Circle, Minus, Eraser, Undo2, Redo2, Printer, RotateCw,
  ChevronDown, Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, formatRelativeDate, getDocumentCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerState = "loading" | "ready" | "error" | "unsupported";
type ViewerType = "pdf" | "image" | "office" | "none";
type AnnotationTool = "none" | "pen" | "highlight" | "text" | "rect" | "circle" | "line" | "eraser";

interface Point { x: number; y: number; }

interface Annotation {
  id: string;
  tool: AnnotationTool;
  color: string;
  lineWidth: number;
  points?: Point[];
  rect?: { x: number; y: number; w: number; h: number };
  text?: string;
  textX?: number;
  textY?: number;
}

export interface DocumentViewerModalProps {
  document: Document | null;
  allDocuments?: Document[];
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectViewerType(mime: string, name: string): ViewerType {
  if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("word") || mime.includes("officedocument") || mime.includes("spreadsheet") || /\.(docx?|xlsx?|pptx?)$/i.test(name)) return "office";
  return "none";
}

function fileIconProps(mime: string) {
  if (mime.startsWith("image/")) return { Icon: FileImage, bg: "bg-emerald-500/10", color: "text-emerald-400" };
  if (mime === "application/pdf") return { Icon: FileText, bg: "bg-red-500/10", color: "text-red-400" };
  if (mime.includes("word") || mime.includes("document")) return { Icon: FileText, bg: "bg-blue-500/10", color: "text-blue-400" };
  return { Icon: File, bg: "bg-muted/20", color: "text-muted-foreground" };
}

const ANNOTATION_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#000000", "#ffffff"];

// ─── Canvas annotation layer ──────────────────────────────────────────────────

function AnnotationCanvas({
  tool,
  color,
  lineWidth,
  annotations,
  onAdd,
}: {
  tool: AnnotationTool;
  color: string;
  lineWidth: number;
  annotations: Annotation[];
  onAdd: (a: Annotation) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<Point[]>([]);
  const startPt = useRef<Point>({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

  // Redraw all saved annotations
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    annotations.forEach(ann => drawAnnotation(ctx, ann));
  }, [annotations]);

  useEffect(() => { redraw(); }, [redraw]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const { offsetWidth: w, offsetHeight: h } = canvas.parentElement!;
      canvas.width = w;
      canvas.height = h;
      redraw();
    });
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, [redraw]);

  function drawAnnotation(ctx: CanvasRenderingContext2D, ann: Annotation) {
    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = ann.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (ann.tool === "pen" && ann.points && ann.points.length > 1) {
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      ann.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (ann.tool === "highlight" && ann.rect) {
      ctx.globalAlpha = 0.35;
      ctx.fillRect(ann.rect.x, ann.rect.y, ann.rect.w, ann.rect.h);
    } else if (ann.tool === "rect" && ann.rect) {
      ctx.globalAlpha = 1;
      ctx.strokeRect(ann.rect.x, ann.rect.y, ann.rect.w, ann.rect.h);
    } else if (ann.tool === "circle" && ann.rect) {
      ctx.globalAlpha = 1;
      const cx = ann.rect.x + ann.rect.w / 2;
      const cy = ann.rect.y + ann.rect.h / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(ann.rect.w / 2), Math.abs(ann.rect.h / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (ann.tool === "line" && ann.rect) {
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(ann.rect.x, ann.rect.y);
      ctx.lineTo(ann.rect.x + ann.rect.w, ann.rect.y + ann.rect.h);
      ctx.stroke();
    } else if (ann.tool === "text" && ann.text && ann.textX !== undefined) {
      ctx.globalAlpha = 1;
      ctx.font = `${Math.max(ann.lineWidth * 6, 14)}px Inter, sans-serif`;
      ctx.fillText(ann.text, ann.textX!, ann.textY!);
    }
    ctx.restore();
  }

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (tool === "none") return;
    if (tool === "text") {
      const pos = getPos(e);
      setTextInput({ x: pos.x, y: pos.y, value: "" });
      return;
    }
    isDrawing.current = true;
    const pos = getPos(e);
    startPt.current = pos;
    currentPoints.current = [pos];
  }

  function onPointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current || tool === "none" || tool === "text") return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    if (tool === "pen") {
      currentPoints.current.push(pos);
      // Live preview
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pts = currentPoints.current;
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    } else {
      // Shape preview: redraw + draw current shape
      redraw();
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      const { x: sx, y: sy } = startPt.current;
      const w = pos.x - sx, h = pos.y - sy;
      if (tool === "highlight") {
        ctx.globalAlpha = 0.35;
        ctx.fillRect(sx, sy, w, h);
      } else if (tool === "rect") {
        ctx.strokeRect(sx, sy, w, h);
      } else if (tool === "circle") {
        ctx.beginPath();
        ctx.ellipse(sx + w / 2, sy + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === "eraser") {
        ctx.globalAlpha = 1;
        ctx.clearRect(pos.x - 20, pos.y - 20, 40, 40);
      }
      ctx.restore();
    }
  }

  function onPointerUp(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current || tool === "none" || tool === "text") return;
    isDrawing.current = false;
    const pos = getPos(e);
    const { x: sx, y: sy } = startPt.current;

    if (tool === "pen") {
      onAdd({ id: crypto.randomUUID(), tool, color, lineWidth, points: [...currentPoints.current] });
    } else if (tool !== "eraser") {
      onAdd({ id: crypto.randomUUID(), tool, color, lineWidth, rect: { x: sx, y: sy, w: pos.x - sx, h: pos.y - sy } });
    }
    currentPoints.current = [];
    redraw();
  }

  function submitText() {
    if (!textInput || !textInput.value.trim()) { setTextInput(null); return; }
    onAdd({ id: crypto.randomUUID(), tool: "text", color, lineWidth, text: textInput.value, textX: textInput.x, textY: textInput.y });
    setTextInput(null);
  }

  const isActive = tool !== "none";

  return (
    <div className="absolute inset-0" style={{ pointerEvents: isActive ? "all" : "none", zIndex: 10 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: tool === "eraser" ? "cell" : tool === "text" ? "text" : tool !== "none" ? "crosshair" : "default" }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />
      {textInput && (
        <input
          autoFocus
          value={textInput.value}
          onChange={e => setTextInput(t => t ? { ...t, value: e.target.value } : t)}
          onBlur={submitText}
          onKeyDown={e => { if (e.key === "Enter") submitText(); if (e.key === "Escape") setTextInput(null); }}
          style={{ position: "absolute", left: textInput.x, top: textInput.y - 16, fontSize: Math.max(lineWidth * 6, 14), color, background: "transparent", border: "1px dashed", borderColor: color, outline: "none", minWidth: 120 }}
          className="px-1 rounded"
        />
      )}
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export function DocumentViewerModal({ document: doc, allDocuments, onClose }: DocumentViewerModalProps) {
  const open = !!doc;

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>("loading");
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Navigation
  const docs = useMemo(() => allDocuments ?? (doc ? [doc] : []), [allDocuments, doc]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Annotations
  const [activeTool, setActiveTool] = useState<AnnotationTool>("none");
  const [annotColor, setAnnotColor] = useState("#f59e0b");
  const [annotSize, setAnnotSize] = useState(3);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const currentDoc = docs[currentIdx] ?? doc;
  const viewerType: ViewerType = currentDoc ? detectViewerType(currentDoc.mime_type, currentDoc.name) : "none";
  const { Icon, bg, color } = currentDoc ? fileIconProps(currentDoc.mime_type) : { Icon: File, bg: "bg-muted/20", color: "text-muted-foreground" };

  // Sync index when doc changes
  useEffect(() => {
    if (!doc) return;
    const idx = docs.findIndex(d => d.id === doc.id);
    setCurrentIdx(idx >= 0 ? idx : 0);
  }, [doc?.id]);

  // Fetch signed URL when currentDoc changes
  const fetchSignedUrl = useCallback(async (d: Document) => {
    setViewerState("loading");
    setSignedUrl(null);
    try {
      const res = await fetch("/api/documents/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: d.file_path }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json() as { signed_url: string | null };
      if (json.signed_url) { setSignedUrl(json.signed_url); setViewerState("ready"); }
      else setViewerState("unsupported");
    } catch { setViewerState("error"); }
  }, []);

  useEffect(() => { if (currentDoc && open) fetchSignedUrl(currentDoc); }, [currentDoc?.id, open]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setZoom(100); setFullscreen(false); setSearchOpen(false);
      setSearchQuery(""); setActiveTool("none"); setAnnotations([]); setHistory([[]]); setHistIdx(0);
    }
  }, [open]);

  const navigate = useCallback((dir: -1 | 1) => {
    setCurrentIdx(i => {
      const next = i + dir;
      if (next < 0 || next >= docs.length) return i;
      setAnnotations([]); setZoom(100);
      return next;
    });
  }, [docs.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") { if (searchOpen) setSearchOpen(false); else onClose(); }
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 25, 300));
      if (e.key === "-") setZoom(z => Math.max(z - 25, 25));
      if ((e.metaKey || e.ctrlKey) && e.key === "f") { e.preventDefault(); setSearchOpen(s => !s); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") undo();
      if ((e.metaKey || e.ctrlKey) && e.key === "y") redo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, searchOpen, navigate]);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  // Annotation history
  function addAnnotation(ann: Annotation) {
    const next = [...annotations, ann];
    setAnnotations(next);
    const newHistory = [...history.slice(0, histIdx + 1), next];
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
  }

  function undo() {
    if (histIdx === 0) return;
    const ni = histIdx - 1;
    setHistIdx(ni);
    setAnnotations(history[ni]);
  }

  function redo() {
    if (histIdx >= history.length - 1) return;
    const ni = histIdx + 1;
    setHistIdx(ni);
    setAnnotations(history[ni]);
  }

  async function handleDownload() {
    if (!currentDoc) return;
    const url = signedUrl;
    if (url) {
      const a = window.document.createElement("a");
      a.href = url; a.download = currentDoc.name; a.click();
    } else {
      toast.info("Generating download…");
      await fetchSignedUrl(currentDoc);
    }
  }

  async function handleCopyLink() {
    if (!signedUrl) return;
    await navigator.clipboard.writeText(signedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // PDF URL with zoom (reloads iframe on zoom change — clean approach)
  const pdfSrc = useMemo(() => {
    if (!signedUrl || viewerType !== "pdf") return signedUrl ?? "";
    return `${signedUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=${zoom}`;
  }, [signedUrl, viewerType, zoom]);

  const toolButtons: { id: AnnotationTool; Icon: React.ElementType; label: string }[] = [
    { id: "pen", Icon: Pen, label: "Pen" },
    { id: "highlight", Icon: Highlighter, label: "Highlight" },
    { id: "text", Icon: Type, label: "Text" },
    { id: "rect", Icon: Square, label: "Rectangle" },
    { id: "circle", Icon: Circle, label: "Circle" },
    { id: "line", Icon: Minus, label: "Line" },
    { id: "eraser", Icon: Eraser, label: "Eraser" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="viewer-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            key="viewer-panel"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 flex flex-col bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden",
              fullscreen ? "w-screen h-screen rounded-none" : "w-[92vw] max-w-6xl h-[90vh]"
            )}
          >
            {/* ── Top toolbar ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#1a1a1f] flex-shrink-0">
              {/* File info */}
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                <Icon className={cn("w-3.5 h-3.5", color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">{currentDoc?.name}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                  <span>{currentDoc && getDocumentCategoryLabel(currentDoc.category)}</span>
                  <span>·</span>
                  <span>{currentDoc && formatFileSize(currentDoc.file_size)}</span>
                  {currentDoc?.deal_address && <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-teal-400/80"><Building2 className="w-2.5 h-2.5" />{currentDoc.deal_address}</span>
                  </>}
                </div>
              </div>

              {/* Navigation pills */}
              {docs.length > 1 && (
                <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
                  <button onClick={() => navigate(-1)} disabled={currentIdx === 0} className="p-1 rounded hover:bg-white/10 disabled:opacity-25 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5 text-white/70" />
                  </button>
                  <span className="text-[10px] text-white/50 px-1">{currentIdx + 1}/{docs.length}</span>
                  <button onClick={() => navigate(1)} disabled={currentIdx === docs.length - 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-25 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                  </button>
                </div>
              )}

              {/* Separator */}
              <div className="w-px h-5 bg-white/10" />

              {/* Zoom controls */}
              {viewerState === "ready" && (
                <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
                  <button onClick={() => setZoom(z => Math.max(z - 25, 25))} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Zoom out (-)">
                    <ZoomOut className="w-3 h-3 text-white/70" />
                  </button>
                  <button onClick={() => setZoom(100)} className="text-[10px] text-white/60 hover:text-white px-1.5 min-w-[38px] text-center transition-colors" title="Reset zoom">
                    {zoom}%
                  </button>
                  <button onClick={() => setZoom(z => Math.min(z + 25, 300))} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Zoom in (+)">
                    <ZoomIn className="w-3 h-3 text-white/70" />
                  </button>
                </div>
              )}

              {/* Separator */}
              <div className="w-px h-5 bg-white/10" />

              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(s => !s)}
                className={cn("p-1.5 rounded hover:bg-white/10 transition-colors", searchOpen && "bg-indigo-500/20 text-indigo-400")}
                title="Search (Ctrl+F)"
              >
                <Search className="w-3.5 h-3.5 text-white/70" />
              </button>

              {/* Actions */}
              {signedUrl && (
                <>
                  <button onClick={handleCopyLink} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Copy link">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
                  </button>
                  <a href={signedUrl} target="_blank" rel="noreferrer">
                    <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Open in new tab">
                      <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                    </button>
                  </a>
                </>
              )}
              <button onClick={handleDownload} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Download">
                <Download className="w-3.5 h-3.5 text-white/70" />
              </button>
              <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Toggle fullscreen">
                {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-white/70" /> : <Maximize2 className="w-3.5 h-3.5 text-white/70" />}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors ml-1"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* ── Search bar ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#1e1e24] overflow-hidden flex-shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search in document… (Ctrl+F)"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                    onKeyDown={e => { if (e.key === "Escape") setSearchOpen(false); }}
                  />
                  {searchQuery && (
                    <span className="text-[10px] text-white/40 flex-shrink-0">
                      {viewerType === "pdf" ? "Use browser Ctrl+F inside the PDF for full search" : "Search not available for this file type"}
                    </span>
                  )}
                  <button onClick={() => setSearchOpen(false)} className="p-1 rounded hover:bg-white/10 transition-colors">
                    <X className="w-3 h-3 text-white/40" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Annotation toolbar ──────────────────────────────────────── */}
            {viewerState === "ready" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/10 bg-[#1e1e24] flex-shrink-0 flex-wrap">
                <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Annotate</span>
                <div className="w-px h-4 bg-white/10 mx-1" />

                {toolButtons.map(({ id, Icon: TIcon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTool(t => t === id ? "none" : id)}
                    title={label}
                    className={cn(
                      "p-1.5 rounded transition-all",
                      activeTool === id
                        ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    <TIcon className="w-3.5 h-3.5" />
                  </button>
                ))}

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Color picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(s => !s)}
                    className="flex items-center gap-1 p-1.5 rounded hover:bg-white/5 transition-colors"
                    title="Color"
                  >
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: annotColor }} />
                    <ChevronDown className="w-2.5 h-2.5 text-white/40" />
                  </button>
                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 mt-1 p-2 bg-[#2a2a33] border border-white/10 rounded-xl shadow-xl z-20 flex gap-1.5 flex-wrap w-[120px]"
                      >
                        {ANNOTATION_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => { setAnnotColor(c); setShowColorPicker(false); }}
                            className={cn("w-6 h-6 rounded-full border-2 transition-all hover:scale-110", annotColor === c ? "border-white" : "border-transparent")}
                            style={{ background: c }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Stroke size */}
                <div className="flex items-center gap-1.5">
                  {[2, 4, 6].map(s => (
                    <button
                      key={s}
                      onClick={() => setAnnotSize(s)}
                      className={cn("flex items-center justify-center w-6 h-6 rounded transition-all", annotSize === s ? "bg-indigo-500/20 ring-1 ring-indigo-500/40" : "hover:bg-white/5")}
                    >
                      <div className="rounded-full bg-white/60" style={{ width: s + 2, height: s + 2 }} />
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Undo / Redo */}
                <button onClick={undo} disabled={histIdx === 0} title="Undo (Ctrl+Z)" className="p-1.5 rounded hover:bg-white/5 disabled:opacity-25 transition-colors">
                  <Undo2 className="w-3.5 h-3.5 text-white/50" />
                </button>
                <button onClick={redo} disabled={histIdx >= history.length - 1} title="Redo (Ctrl+Y)" className="p-1.5 rounded hover:bg-white/5 disabled:opacity-25 transition-colors">
                  <Redo2 className="w-3.5 h-3.5 text-white/50" />
                </button>
                {annotations.length > 0 && (
                  <button
                    onClick={() => { setAnnotations([]); setHistory([[]]); setHistIdx(0); }}
                    className="text-[10px] text-red-400/70 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors ml-1"
                  >
                    Clear all
                  </button>
                )}

                {activeTool !== "none" && (
                  <span className="ml-auto text-[10px] text-indigo-400/70 italic">{activeTool} tool active</span>
                )}
              </div>
            )}

            {/* ── Viewer body ─────────────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-hidden relative bg-[#0e0e12]">
              {/* Loading */}
              {viewerState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-sm text-white/40">Generating secure access…</p>
                </div>
              )}

              {/* Error */}
              {viewerState === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-sm text-white font-medium">Preview unavailable</p>
                  <p className="text-xs text-white/40">Could not generate secure access URL.</p>
                  <button onClick={() => currentDoc && fetchSignedUrl(currentDoc)} className="text-xs text-indigo-400 hover:underline mt-1">Retry</button>
                </div>
              )}

              {/* Unsupported / demo */}
              {viewerState === "unsupported" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", bg)}>
                    <Icon className={cn("w-8 h-8", color)} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white mb-1">{currentDoc?.name}</p>
                    <p className="text-xs text-white/40">{viewerType === "office" ? "Office documents preview inline soon." : "No preview available."}</p>
                  </div>
                  <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              )}

              {/* Ready */}
              {viewerState === "ready" && signedUrl && currentDoc && (
                <div className="relative w-full h-full overflow-auto">
                  {/* PDF */}
                  {viewerType === "pdf" && (
                    <div className="relative w-full h-full">
                      <iframe
                        key={pdfSrc}
                        src={pdfSrc}
                        className="w-full h-full border-0"
                        title={currentDoc.name}
                      />
                      <AnnotationCanvas
                        tool={activeTool}
                        color={annotColor}
                        lineWidth={annotSize}
                        annotations={annotations}
                        onAdd={addAnnotation}
                      />
                    </div>
                  )}

                  {/* Image */}
                  {viewerType === "image" && (
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                      <img
                        src={signedUrl}
                        alt={currentDoc.name}
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center", transition: "transform 0.2s ease" }}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      />
                      <AnnotationCanvas
                        tool={activeTool}
                        color={annotColor}
                        lineWidth={annotSize}
                        annotations={annotations}
                        onAdd={addAnnotation}
                      />
                    </div>
                  )}

                  {/* Office / generic */}
                  {(viewerType === "office" || viewerType === "none") && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", bg)}>
                        <Icon className={cn("w-8 h-8", color)} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white mb-1">{currentDoc.name}</p>
                        <p className="text-xs text-white/40">{formatFileSize(currentDoc.file_size)} · {getDocumentCategoryLabel(currentDoc.category)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download File
                        </button>
                        <a href={signedUrl} target="_blank" rel="noreferrer">
                          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg border border-white/10 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> Open in Browser
                          </button>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Status bar ──────────────────────────────────────────────── */}
            {currentDoc && (
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/10 bg-[#1a1a1f] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40 border-white/10">{currentDoc && getDocumentCategoryLabel(currentDoc.category)}</Badge>
                  {currentDoc.is_signed && <Badge variant="success" className="text-[10px]">Signed</Badge>}
                  {currentDoc.ai_extracted && <Badge variant="purple" className="text-[10px]">AI</Badge>}
                  {annotations.length > 0 && <span className="text-[10px] text-amber-400/70">{annotations.length} annotation{annotations.length !== 1 ? "s" : ""}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-white/25">
                    {viewerState === "ready" ? "Secure · expires 1h" : ""}
                  </p>
                  <p className="text-[10px] text-white/25">
                    {currentDoc && formatRelativeDate(currentDoc.created_at)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
