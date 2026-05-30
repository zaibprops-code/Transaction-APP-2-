"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, FileText, FileImage,
  File, Building2, Copy, CheckCircle, Search, Pen, Highlighter, Type,
  Square, Circle, Minus, Eraser, Undo2, Redo2, ChevronDown,
} from "lucide-react";
import { formatFileSize, formatRelativeDate, getDocumentCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerState = "loading" | "ready" | "error" | "unsupported";
type ViewerType  = "pdf" | "image" | "office" | "none";
type AnnotTool   = "none" | "pen" | "highlight" | "text" | "rect" | "circle" | "line" | "eraser";

interface Point { x: number; y: number; }
interface Annotation {
  id: string; tool: AnnotTool; color: string; lineWidth: number;
  points?: Point[];
  rect?: { x: number; y: number; w: number; h: number };
  text?: string; textX?: number; textY?: number;
}

export interface DocumentViewerModalProps {
  document: Document | null;
  allDocuments?: Document[];
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectType(mime: string, name: string): ViewerType {
  if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("word") || mime.includes("officedocument") || /\.(docx?|xlsx?|pptx?)$/i.test(name)) return "office";
  return "none";
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return { Icon: FileImage, bg: "bg-emerald-500/10", tc: "text-emerald-400" };
  if (mime === "application/pdf")  return { Icon: FileText,  bg: "bg-red-500/10",     tc: "text-red-400"     };
  if (mime.includes("word"))       return { Icon: FileText,  bg: "bg-blue-500/10",    tc: "text-blue-400"    };
  return { Icon: File, bg: "bg-white/5", tc: "text-white/40" };
}

const COLORS = ["#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#ec4899","#e5e7eb","#111827"];

// ─── Annotation canvas ────────────────────────────────────────────────────────

function AnnotCanvas({ tool, color, lineWidth, annotations, onAdd }:
  { tool: AnnotTool; color: string; lineWidth: number; annotations: Annotation[]; onAdd(a: Annotation): void }) {

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const drawing    = useRef(false);
  const pts        = useRef<Point[]>([]);
  const start      = useRef<Point>({ x: 0, y: 0 });
  const [textPos, setTextPos] = useState<{x:number;y:number;v:string}|null>(null);

  const redraw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    annotations.forEach(a => paint(ctx, a));
  }, [annotations]);

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ro = new ResizeObserver(() => {
      const p = c.parentElement!;
      c.width = p.offsetWidth; c.height = p.offsetHeight;
      redraw();
    });
    ro.observe(c.parentElement!);
    return () => ro.disconnect();
  }, [redraw]);

  // Forward wheel events so the underlying PDF can still scroll
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const onWheel = (e: WheelEvent) => {
      if (!drawing.current) {
        // Pass scroll through to the iframe / parent scroller
        const parent = c.closest(".viewer-scroll") as HTMLElement | null;
        parent?.scrollBy(e.deltaX, e.deltaY);
      }
    };
    c.addEventListener("wheel", onWheel, { passive: true });
    return () => c.removeEventListener("wheel", onWheel);
  }, []);

  function paint(ctx: CanvasRenderingContext2D, a: Annotation) {
    ctx.save();
    ctx.strokeStyle = a.color; ctx.fillStyle = a.color;
    ctx.lineWidth = a.lineWidth; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (a.tool === "pen" && a.points && a.points.length > 1) {
      ctx.beginPath(); ctx.moveTo(a.points[0].x, a.points[0].y);
      a.points.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
    } else if (a.tool === "highlight" && a.rect) {
      ctx.globalAlpha = 0.3; ctx.fillRect(a.rect.x, a.rect.y, a.rect.w, a.rect.h);
    } else if (a.tool === "rect" && a.rect) {
      ctx.strokeRect(a.rect.x, a.rect.y, a.rect.w, a.rect.h);
    } else if (a.tool === "circle" && a.rect) {
      const cx = a.rect.x + a.rect.w / 2, cy = a.rect.y + a.rect.h / 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(a.rect.w/2), Math.abs(a.rect.h/2), 0, 0, Math.PI*2); ctx.stroke();
    } else if (a.tool === "line" && a.rect) {
      ctx.beginPath(); ctx.moveTo(a.rect.x, a.rect.y); ctx.lineTo(a.rect.x+a.rect.w, a.rect.y+a.rect.h); ctx.stroke();
    } else if (a.tool === "text" && a.text && a.textX !== undefined) {
      ctx.font = `${Math.max(a.lineWidth*5,13)}px Inter,sans-serif`;
      ctx.fillText(a.text, a.textX!, a.textY!);
    }
    ctx.restore();
  }

  function pos(e: React.MouseEvent | React.TouchEvent): Point {
    const r = canvasRef.current!.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function down(e: React.MouseEvent | React.TouchEvent) {
    if (tool === "none") return;
    if (tool === "text") { const p = pos(e); setTextPos({ x:p.x, y:p.y, v:"" }); return; }
    drawing.current = true;
    const p = pos(e); start.current = p; pts.current = [p];
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || tool === "none" || tool === "text") return;
    const p = pos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    if (tool === "pen") {
      pts.current.push(p);
      ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=lineWidth; ctx.lineCap="round";
      const prev = pts.current[pts.current.length-2];
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.restore();
    } else {
      redraw();
      const { x:sx, y:sy } = start.current; const w=p.x-sx, h=p.y-sy;
      ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lineWidth; ctx.lineCap="round";
      if (tool==="highlight")  { ctx.globalAlpha=0.3; ctx.fillRect(sx,sy,w,h); }
      else if (tool==="rect")  { ctx.strokeRect(sx,sy,w,h); }
      else if (tool==="circle"){ ctx.beginPath(); ctx.ellipse(sx+w/2,sy+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2); ctx.stroke(); }
      else if (tool==="line")  { ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(p.x,p.y); ctx.stroke(); }
      else if (tool==="eraser"){ ctx.clearRect(p.x-20,p.y-20,40,40); }
      ctx.restore();
    }
  }

  function up(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || tool==="none" || tool==="text") return;
    drawing.current = false;
    const p = pos(e); const {x:sx,y:sy}=start.current;
    if (tool==="pen") onAdd({ id:crypto.randomUUID(), tool, color, lineWidth, points:[...pts.current] });
    else if (tool!=="eraser") onAdd({ id:crypto.randomUUID(), tool, color, lineWidth, rect:{x:sx,y:sy,w:p.x-sx,h:p.y-sy} });
    pts.current = []; redraw();
  }

  function submitText() {
    if (!textPos?.v.trim()) { setTextPos(null); return; }
    onAdd({ id:crypto.randomUUID(), tool:"text", color, lineWidth, text:textPos.v, textX:textPos.x, textY:textPos.y });
    setTextPos(null);
  }

  const active = tool !== "none";
  const cursor = tool==="eraser"?"cell": tool==="text"?"text": active?"crosshair":"default";

  return (
    <div className="absolute inset-0" style={{ pointerEvents: active ? "all" : "none", zIndex: 10 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor }}
        onMouseDown={down} onMouseMove={move} onMouseUp={up}
        onTouchStart={down} onTouchMove={move} onTouchEnd={up}
      />
      {textPos && (
        <input
          autoFocus
          value={textPos.v}
          onChange={e => setTextPos(t => t ? {...t,v:e.target.value} : t)}
          onBlur={submitText}
          onKeyDown={e => { if(e.key==="Enter") submitText(); if(e.key==="Escape") setTextPos(null); }}
          style={{ position:"absolute", left:textPos.x, top:textPos.y-18, color, fontSize:Math.max(lineWidth*5,13), background:"transparent", border:"1px dashed", borderColor:color, outline:"none", minWidth:120, padding:"2px 4px" }}
        />
      )}
    </div>
  );
}

// ─── Unsaved changes dialog ───────────────────────────────────────────────────

function UnsavedDialog({ onSave, onDiscard, onCancel }:
  { onSave(): void; onDiscard(): void; onCancel(): void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
        className="relative z-10 bg-[#1e1e26] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
      >
        <h3 className="text-base font-semibold text-white mb-1">Unsaved annotations</h3>
        <p className="text-sm text-white/50 mb-5">You have unsaved annotations. What would you like to do?</p>
        <div className="flex flex-col gap-2">
          <button onClick={onSave} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
            Save & Close
          </button>
          <button onClick={onDiscard} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-xl transition-colors border border-white/10">
            Discard Changes
          </button>
          <button onClick={onCancel} className="w-full py-2 text-white/40 hover:text-white/60 text-sm transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export function DocumentViewerModal({ document: doc, allDocuments, onClose }: DocumentViewerModalProps) {
  const open = !!doc;

  // Viewer state
  const [signedUrl, setSignedUrl]     = useState<string|null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>("loading");
  const [zoom, setZoom]               = useState(100);
  const [fullscreen, setFullscreen]   = useState(false);
  const [copied, setCopied]           = useState(false);

  // Navigation
  const docs = useMemo(() => allDocuments ?? (doc ? [doc] : []), [allDocuments, doc]);
  const [currentIdx, setCurrentIdx]   = useState(0);

  // Search
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQ, setSearchQ]         = useState("");
  const searchInputRef                = useRef<HTMLInputElement>(null);

  // Annotations
  const [activeTool, setActiveTool]   = useState<AnnotTool>("none");
  const [annotColor, setAnnotColor]   = useState("#f59e0b");
  const [annotSize, setAnnotSize]     = useState(3);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory]         = useState<Annotation[][]>([[]]);
  const [histIdx, setHistIdx]         = useState(0);
  const [showColors, setShowColors]   = useState(false);
  const [showAnnotBar, setShowAnnotBar] = useState(false);

  // Unsaved changes
  const [isDirty, setIsDirty]         = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const savedCount                    = useRef(0);

  const currentDoc = docs[currentIdx] ?? doc;
  const vType: ViewerType = currentDoc ? detectType(currentDoc.mime_type, currentDoc.name) : "none";
  const { Icon, bg, tc } = currentDoc ? fileIcon(currentDoc.mime_type) : { Icon: File, bg:"bg-white/5", tc:"text-white/40" };

  // Sync index
  useEffect(() => {
    if (!doc) return;
    const i = docs.findIndex(d => d.id === doc.id);
    setCurrentIdx(i >= 0 ? i : 0);
  }, [doc?.id]);

  // Fetch signed URL
  const fetchUrl = useCallback(async (d: Document) => {
    setViewerState("loading"); setSignedUrl(null);
    try {
      const res = await fetch("/api/documents/signed-url", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ file_path: d.file_path }),
      });
      if (!res.ok) throw new Error();
      const { signed_url } = await res.json() as { signed_url: string|null };
      if (signed_url) { setSignedUrl(signed_url); setViewerState("ready"); }
      else setViewerState("unsupported");
    } catch { setViewerState("error"); }
  }, []);

  useEffect(() => { if (currentDoc && open) fetchUrl(currentDoc); }, [currentDoc?.id, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setZoom(100); setFullscreen(false); setSearchOpen(false); setSearchQ("");
      setActiveTool("none"); setAnnotations([]); setHistory([[]]); setHistIdx(0);
      setIsDirty(false); setShowAnnotBar(false);
    }
  }, [open]);

  // Browser unload warning when dirty
  useEffect(() => {
    if (!isDirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [isDirty]);

  const navigate = useCallback((dir: -1|1) => {
    if (isDirty) { setShowUnsaved(true); return; }
    setCurrentIdx(i => {
      const n = i + dir;
      if (n < 0 || n >= docs.length) return i;
      setAnnotations([]); setHistory([[]]); setHistIdx(0); setIsDirty(false); setZoom(100);
      return n;
    });
  }, [docs.length, isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") { if (searchOpen) setSearchOpen(false); else attemptClose(); }
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z+25, 300));
      if (e.key === "-") setZoom(z => Math.max(z-25, 25));
      if ((e.metaKey||e.ctrlKey) && e.key==="f") { e.preventDefault(); setSearchOpen(s=>!s); }
      if ((e.metaKey||e.ctrlKey) && e.key==="z") undo();
      if ((e.metaKey||e.ctrlKey) && e.key==="y") redo();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, searchOpen, navigate, isDirty]);

  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);

  function addAnnotation(ann: Annotation) {
    const next = [...annotations, ann];
    setAnnotations(next);
    const nh = [...history.slice(0, histIdx+1), next];
    setHistory(nh); setHistIdx(nh.length-1);
    setIsDirty(true);
  }

  function undo() {
    if (histIdx === 0) return;
    const i = histIdx-1; setHistIdx(i); setAnnotations(history[i]);
    setIsDirty(history[i].length !== savedCount.current);
  }

  function redo() {
    if (histIdx >= history.length-1) return;
    const i = histIdx+1; setHistIdx(i); setAnnotations(history[i]);
    setIsDirty(history[i].length !== savedCount.current);
  }

  function handleSaveAnnotations() {
    savedCount.current = annotations.length;
    setIsDirty(false);
    toast.success("Annotations saved");
  }

  function attemptClose() {
    if (isDirty) { setShowUnsaved(true); } else { onClose(); }
  }

  async function handleDownload() {
    if (!currentDoc) return;
    if (signedUrl) {
      const a = window.document.createElement("a");
      a.href = signedUrl; a.download = currentDoc.name; a.click();
    } else { await fetchUrl(currentDoc); }
  }

  async function handleCopyLink() {
    if (!signedUrl) return;
    await navigator.clipboard.writeText(signedUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const pdfSrc = useMemo(() =>
    signedUrl && vType === "pdf" ? `${signedUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=${zoom}` : (signedUrl ?? ""),
  [signedUrl, vType, zoom]);

  const TOOLS: { id: AnnotTool; Icon: React.ElementType; label: string }[] = [
    { id:"pen",       Icon:Pen,        label:"Pen"       },
    { id:"highlight", Icon:Highlighter,label:"Highlight" },
    { id:"text",      Icon:Type,       label:"Text"      },
    { id:"rect",      Icon:Square,     label:"Rectangle" },
    { id:"circle",    Icon:Circle,     label:"Circle"    },
    { id:"line",      Icon:Minus,      label:"Line"      },
    { id:"eraser",    Icon:Eraser,     label:"Eraser"    },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="viewer-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onMouseDown={(e) => { if (e.target === e.currentTarget) attemptClose(); }}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

            <motion.div
              key="viewer-panel"
              initial={{ opacity:0, scale:0.97, y:8 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.97, y:8 }}
              transition={{ duration:0.18, ease:"easeOut" }}
              className={cn(
                "relative z-10 flex flex-col overflow-hidden",
                "bg-[#16161d] border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.7)]",
                fullscreen ? "w-screen h-screen rounded-none" : "w-[95vw] max-w-7xl h-[93vh] rounded-2xl"
              )}
            >
              {/* ── Single compact toolbar ─────────────────────────────── */}
              <div className="flex items-center gap-2 px-3 h-11 border-b border-white/[0.06] bg-[#1c1c24] flex-shrink-0">
                {/* Left: file info */}
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-3 h-3", tc)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-white/90 truncate max-w-[280px]">{currentDoc?.name}</p>
                    {currentDoc?.deal_address && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] text-teal-400/70 flex-shrink-0">
                        <Building2 className="w-2.5 h-2.5" />{currentDoc.deal_address}
                      </span>
                    )}
                    {isDirty && <span className="text-[10px] text-amber-400/80 flex-shrink-0">● unsaved</span>}
                  </div>
                </div>

                {/* Center: zoom + search + nav */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Doc navigation */}
                  {docs.length > 1 && (
                    <>
                      <button onClick={() => navigate(-1)} disabled={currentIdx===0} className="p-1 rounded hover:bg-white/8 disabled:opacity-20 transition-colors">
                        <ChevronLeft className="w-3.5 h-3.5 text-white/60" />
                      </button>
                      <span className="text-[10px] text-white/40 px-0.5">{currentIdx+1}/{docs.length}</span>
                      <button onClick={() => navigate(1)} disabled={currentIdx===docs.length-1} className="p-1 rounded hover:bg-white/8 disabled:opacity-20 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-0.5" />
                    </>
                  )}

                  {/* Zoom */}
                  {viewerState === "ready" && (
                    <>
                      <button onClick={() => setZoom(z => Math.max(z-25, 25))} className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Zoom out (-)">
                        <ZoomOut className="w-3.5 h-3.5 text-white/60" />
                      </button>
                      <button onClick={() => setZoom(100)} className="text-[11px] text-white/50 hover:text-white/80 w-10 text-center transition-colors font-mono" title="Reset zoom">
                        {zoom}%
                      </button>
                      <button onClick={() => setZoom(z => Math.min(z+25, 300))} className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Zoom in (+)">
                        <ZoomIn className="w-3.5 h-3.5 text-white/60" />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-0.5" />
                    </>
                  )}

                  {/* Inline search */}
                  <AnimatePresence>
                    {searchOpen ? (
                      <motion.div
                        initial={{ width:0, opacity:0 }} animate={{ width:"auto", opacity:1 }} exit={{ width:0, opacity:0 }}
                        className="flex items-center gap-1 bg-white/[0.06] rounded-lg px-2 py-1 border border-white/10 overflow-hidden"
                      >
                        <Search className="w-3 h-3 text-white/40 flex-shrink-0" />
                        <input
                          ref={searchInputRef}
                          value={searchQ}
                          onChange={e => setSearchQ(e.target.value)}
                          placeholder="Search…"
                          className="w-32 bg-transparent text-xs text-white/90 placeholder:text-white/30 outline-none"
                          onKeyDown={e => { if(e.key==="Escape") { setSearchOpen(false); setSearchQ(""); }}}
                        />
                        {searchQ && <span className="text-[10px] text-white/30 flex-shrink-0">Ctrl+F in PDF</span>}
                        <button onClick={() => { setSearchOpen(false); setSearchQ(""); }} className="p-0.5 hover:text-white/60 text-white/30">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </motion.div>
                    ) : (
                      <button onClick={() => setSearchOpen(true)} className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Search (Ctrl+F)">
                        <Search className="w-3.5 h-3.5 text-white/50" />
                      </button>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-white/10" />

                {/* Right: actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {/* Annotate toggle */}
                  <button
                    onClick={() => setShowAnnotBar(s => !s)}
                    className={cn("p-1.5 rounded transition-colors text-[10px] font-medium flex items-center gap-1", showAnnotBar ? "bg-indigo-500/20 text-indigo-400" : "text-white/50 hover:text-white/80 hover:bg-white/8")}
                    title="Annotation tools"
                  >
                    <Pen className="w-3.5 h-3.5" />
                  </button>

                  {isDirty && (
                    <button onClick={handleSaveAnnotations} className="px-2 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors">
                      Save
                    </button>
                  )}

                  {signedUrl && (
                    <>
                      <button onClick={handleCopyLink} className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Copy link">
                        {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/50" />}
                      </button>
                      <a href={signedUrl} target="_blank" rel="noreferrer">
                        <button className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Open in new tab">
                          <ExternalLink className="w-3.5 h-3.5 text-white/50" />
                        </button>
                      </a>
                    </>
                  )}
                  <button onClick={handleDownload} className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5 text-white/50" />
                  </button>
                  <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded hover:bg-white/8 transition-colors" title="Fullscreen">
                    {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-white/50" /> : <Maximize2 className="w-3.5 h-3.5 text-white/50" />}
                  </button>
                  <button onClick={attemptClose} className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors ml-0.5" title="Close (Esc)">
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* ── Annotation toolbar (collapsible) ────────────────────── */}
              <AnimatePresence>
                {showAnnotBar && viewerState === "ready" && (
                  <motion.div
                    initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                    transition={{ duration:0.15 }}
                    className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-[#1a1a21] flex-shrink-0 overflow-hidden"
                  >
                    {TOOLS.map(({ id, Icon: TIcon, label }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTool(t => t===id ? "none" : id)}
                        title={label}
                        className={cn("p-1.5 rounded-lg transition-all",
                          activeTool===id ? "bg-indigo-500/25 text-indigo-400 ring-1 ring-indigo-500/40" : "text-white/40 hover:text-white/70 hover:bg-white/5")}
                      >
                        <TIcon className="w-3.5 h-3.5" />
                      </button>
                    ))}

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Color */}
                    <div className="relative">
                      <button onClick={() => setShowColors(s => !s)} className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Color">
                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: annotColor }} />
                        <ChevronDown className="w-2.5 h-2.5 text-white/30" />
                      </button>
                      <AnimatePresence>
                        {showColors && (
                          <motion.div
                            initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                            className="absolute top-full left-0 mt-1 p-2 bg-[#252530] border border-white/10 rounded-xl shadow-xl z-20 flex gap-1.5 flex-wrap w-[116px]"
                          >
                            {COLORS.map(c => (
                              <button key={c} onClick={() => { setAnnotColor(c); setShowColors(false); }}
                                className={cn("w-6 h-6 rounded-full border-2 transition-all hover:scale-110", annotColor===c?"border-white":"border-transparent")}
                                style={{ background:c }} />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Size */}
                    {[2,4,6].map(s => (
                      <button key={s} onClick={() => setAnnotSize(s)}
                        className={cn("flex items-center justify-center w-6 h-6 rounded-lg transition-all", annotSize===s?"bg-indigo-500/20 ring-1 ring-indigo-500/40":"hover:bg-white/5")}>
                        <div className="rounded-full bg-white/60" style={{ width:s+2, height:s+2 }} />
                      </button>
                    ))}

                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={undo} disabled={histIdx===0} title="Undo" className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-25 transition-colors">
                      <Undo2 className="w-3.5 h-3.5 text-white/50" />
                    </button>
                    <button onClick={redo} disabled={histIdx>=history.length-1} title="Redo" className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-25 transition-colors">
                      <Redo2 className="w-3.5 h-3.5 text-white/50" />
                    </button>
                    {annotations.length > 0 && (
                      <button onClick={() => { setAnnotations([]); setHistory([[]]); setHistIdx(0); setIsDirty(false); }}
                        className="text-[10px] text-red-400/60 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                        Clear
                      </button>
                    )}
                    {activeTool !== "none" && (
                      <span className="ml-auto text-[10px] text-indigo-400/60 italic">{activeTool} active</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Viewer body ─────────────────────────────────────────── */}
              <div className="flex-1 min-h-0 overflow-hidden relative bg-[#0d0d11] viewer-scroll">
                {viewerState === "loading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-400/80" />
                    <p className="text-sm text-white/30">Generating secure access…</p>
                  </div>
                )}

                {viewerState === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-7 h-7 text-red-400/80" />
                    <p className="text-sm text-white/80 font-medium">Preview unavailable</p>
                    <button onClick={() => currentDoc && fetchUrl(currentDoc)} className="text-xs text-indigo-400 hover:underline">Retry</button>
                  </div>
                )}

                {viewerState === "unsupported" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", bg)}>
                      <Icon className={cn("w-7 h-7", tc)} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white mb-1">{currentDoc?.name}</p>
                      <p className="text-xs text-white/40">{currentDoc && formatFileSize(currentDoc.file_size)}</p>
                    </div>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                )}

                {viewerState === "ready" && signedUrl && currentDoc && (
                  <>
                    {vType === "pdf" && (
                      <div className="relative w-full h-full">
                        <iframe key={pdfSrc} src={pdfSrc} className="w-full h-full border-0" title={currentDoc.name} />
                        <AnnotCanvas tool={activeTool} color={annotColor} lineWidth={annotSize} annotations={annotations} onAdd={addAnnotation} />
                      </div>
                    )}
                    {vType === "image" && (
                      <div className="relative w-full h-full flex items-center justify-center p-8 overflow-auto">
                        <img
                          src={signedUrl} alt={currentDoc.name}
                          style={{ transform:`scale(${zoom/100})`, transformOrigin:"center", transition:"transform 0.2s ease" }}
                          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        />
                        <AnnotCanvas tool={activeTool} color={annotColor} lineWidth={annotSize} annotations={annotations} onAdd={addAnnotation} />
                      </div>
                    )}
                    {(vType === "office" || vType === "none") && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", bg)}>
                          <Icon className={cn("w-7 h-7", tc)} />
                        </div>
                        <p className="text-sm font-semibold text-white">{currentDoc.name}</p>
                        <div className="flex gap-2">
                          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                          <a href={signedUrl} target="_blank" rel="noreferrer">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-xl border border-white/10 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" /> Open
                            </button>
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Slim status bar ──────────────────────────────────────── */}
              {currentDoc && (
                <div className="flex items-center justify-between px-4 py-1 border-t border-white/[0.05] bg-[#16161d] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25">{getDocumentCategoryLabel(currentDoc.category)}</span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/25">{formatFileSize(currentDoc.file_size)}</span>
                    {annotations.length > 0 && <>
                      <span className="text-[10px] text-white/20">·</span>
                      <span className="text-[10px] text-amber-400/60">{annotations.length} annotation{annotations.length!==1?"s":""}</span>
                    </>}
                  </div>
                  <span className="text-[10px] text-white/20">
                    {viewerState==="ready" ? "Secure access · 1h" : ""}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved changes dialog */}
      <AnimatePresence>
        {showUnsaved && (
          <UnsavedDialog
            onSave={() => { handleSaveAnnotations(); setShowUnsaved(false); onClose(); }}
            onDiscard={() => { setIsDirty(false); setShowUnsaved(false); onClose(); }}
            onCancel={() => setShowUnsaved(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
