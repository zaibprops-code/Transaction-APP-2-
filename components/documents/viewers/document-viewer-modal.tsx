"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, FileText, FileImage,
  File, Building2, Copy, CheckCircle, Search, Pen, Highlighter, Type,
  Square, Circle, Minus, Eraser, Undo2, Redo2, ChevronDown,
  Pin, PinOff, MousePointer2,
} from "lucide-react";
import { formatFileSize, getDocumentCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { toast } from "sonner";
import type { NativePdfViewerHandle, NativePdfViewerProps, PageAnnotation, AnnotTool } from "./native-pdf-viewer";

// Dynamically import to avoid SSR (react-pdf is browser-only)
const NativePdfViewer = dynamic<NativePdfViewerProps>(
  () => import("./native-pdf-viewer").then(m => m.NativePdfViewer as React.ComponentType<NativePdfViewerProps>),
  { ssr: false, loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Loader2 className="w-7 h-7 animate-spin text-indigo-400/80" />
      <p className="text-sm text-white/30">Loading document engine…</p>
    </div>
  )}
);

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerState = "loading" | "ready" | "error" | "unsupported";
type ViewerType  = "pdf" | "image" | "office" | "none";
type SaveState   = "saved" | "saving" | "unsaved" | "error";

// Legacy flat annotation for image viewer (single-layer, not page-aware)
interface FlatAnnotation {
  id: string; tool: AnnotTool; color: string; lineWidth: number;
  points?: { x: number; y: number }[];
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

const COLORS = ["#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#ec4899","#e5e7eb","#1f2937"];

// ─── Portal color picker ──────────────────────────────────────────────────────

function ColorPicker({ color, onChange, anchorRef, onClose }:
  { color: string; onChange(c: string): void; anchorRef: React.RefObject<HTMLButtonElement>; onClose(): void }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left });
  }, [anchorRef]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!(e.target as Element).closest("[data-color-picker]")) onClose(); };
    const id = setTimeout(() => document.addEventListener("mousedown", h), 60);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", h); };
  }, [onClose]);
  return createPortal(
    <motion.div data-color-picker=""
      initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
      transition={{ duration:0.12 }}
      style={{ position:"fixed", top:pos.top, left:pos.left, zIndex:9999 }}
      className="p-2 bg-[#252530] border border-white/10 rounded-xl shadow-2xl flex gap-1.5 flex-wrap w-[116px]"
    >
      {COLORS.map(c => (
        <button key={c} onClick={() => { onChange(c); onClose(); }}
          className={cn("w-6 h-6 rounded-full border-2 transition-all hover:scale-110", color===c?"border-white":"border-transparent")}
          style={{ background:c }} />
      ))}
    </motion.div>,
    document.body
  );
}

// ─── Save state indicator ─────────────────────────────────────────────────────

function SaveIndicator({ state }: { state: SaveState }) {
  if (state==="saved")   return <span className="flex items-center gap-1 text-[10px] text-emerald-400/70"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"/>Saved</span>;
  if (state==="saving")  return <span className="flex items-center gap-1 text-[10px] text-white/40"><Loader2 className="w-2.5 h-2.5 animate-spin"/>Saving…</span>;
  if (state==="unsaved") return <span className="flex items-center gap-1 text-[10px] text-amber-400/80"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"/>Unsaved</span>;
  if (state==="error")   return <span className="flex items-center gap-1 text-[10px] text-red-400/80"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"/>Save failed</span>;
  return null;
}

// ─── Image annotation canvas (flat, non-page-aware) ──────────────────────────

function ImageAnnotCanvas({ tool, color, lineWidth, annotations, onAdd }:
  { tool: AnnotTool; color: string; lineWidth: number; annotations: FlatAnnotation[]; onAdd(a: FlatAnnotation): void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const pts = useRef<{x:number;y:number}[]>([]);
  const st  = useRef<{x:number;y:number}>({x:0,y:0});

  const redraw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const p = c.parentElement!;
    c.width = p.offsetWidth; c.height = p.offsetHeight;
    ctx.clearRect(0,0,c.width,c.height);
    for (const a of annotations) {
      ctx.save(); ctx.strokeStyle=a.color; ctx.fillStyle=a.color; ctx.lineWidth=a.lineWidth; ctx.lineCap="round"; ctx.lineJoin="round";
      if (a.tool==="pen"&&a.points&&a.points.length>1){ ctx.beginPath(); ctx.moveTo(a.points[0].x,a.points[0].y); for(const pp of a.points) ctx.lineTo(pp.x,pp.y); ctx.stroke(); }
      else if(a.tool==="highlight"&&a.rect){ ctx.globalAlpha=0.3; ctx.fillRect(a.rect.x,a.rect.y,a.rect.w,a.rect.h); }
      else if(a.tool==="rect"&&a.rect){ ctx.strokeRect(a.rect.x,a.rect.y,a.rect.w,a.rect.h); }
      else if(a.tool==="circle"&&a.rect){ ctx.beginPath(); ctx.ellipse(a.rect.x+a.rect.w/2,a.rect.y+a.rect.h/2,Math.abs(a.rect.w/2),Math.abs(a.rect.h/2),0,0,Math.PI*2); ctx.stroke(); }
      else if(a.tool==="line"&&a.rect){ ctx.beginPath(); ctx.moveTo(a.rect.x,a.rect.y); ctx.lineTo(a.rect.x+a.rect.w,a.rect.y+a.rect.h); ctx.stroke(); }
      else if(a.tool==="text"&&a.text&&a.textX!==undefined){ ctx.font=`${Math.max(a.lineWidth*5,13)}px Inter,sans-serif`; ctx.fillText(a.text,a.textX!,a.textY!); }
      ctx.restore();
    }
  }, [annotations]);

  useEffect(()=>{redraw();},[redraw]);
  useEffect(()=>{
    const c=canvasRef.current; if(!c) return;
    const ro=new ResizeObserver(()=>redraw());
    ro.observe(c.parentElement!); return()=>ro.disconnect();
  },[redraw]);

  const active = tool !== "pointer";
  const cursor = tool==="eraser"?"cell":tool==="text"?"text":active?"crosshair":"default";

  function pos(e: React.MouseEvent){ const r=canvasRef.current!.getBoundingClientRect(); return{x:e.clientX-r.left,y:e.clientY-r.top}; }
  function down(e: React.MouseEvent){ if(!active)return; drawing.current=true; const p=pos(e); st.current=p; pts.current=[p]; }
  function move(e: React.MouseEvent){
    if(!drawing.current||!active)return;
    const c=canvasRef.current!; const ctx=c.getContext("2d")!; const p=pos(e);
    if(tool==="pen"){ pts.current.push(p); ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=lineWidth; ctx.lineCap="round"; const prev=pts.current[pts.current.length-2]; ctx.beginPath(); ctx.moveTo(prev.x,prev.y); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.restore(); }
    else{ redraw(); const{x:sx,y:sy}=st.current; const dw=p.x-sx,dh=p.y-sy; ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=lineWidth; ctx.lineCap="round";
      if(tool==="highlight"){ctx.globalAlpha=0.3;ctx.fillRect(sx,sy,dw,dh);}
      else if(tool==="rect"){ctx.strokeRect(sx,sy,dw,dh);}
      else if(tool==="circle"){ctx.beginPath();ctx.ellipse(sx+dw/2,sy+dh/2,Math.abs(dw/2),Math.abs(dh/2),0,0,Math.PI*2);ctx.stroke();}
      else if(tool==="line"){ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(p.x,p.y);ctx.stroke();}
      else if(tool==="eraser"){ctx.clearRect(p.x-20,p.y-20,40,40);}
      ctx.restore(); }
  }
  function up(e: React.MouseEvent){
    if(!drawing.current||!active)return; drawing.current=false;
    const p=pos(e); const{x:sx,y:sy}=st.current;
    if(tool==="pen") onAdd({id:crypto.randomUUID(),tool,color,lineWidth,points:[...pts.current]});
    else if(tool!=="eraser"&&tool!=="text") onAdd({id:crypto.randomUUID(),tool,color,lineWidth,rect:{x:sx,y:sy,w:p.x-sx,h:p.y-sy}});
    pts.current=[]; redraw();
  }

  return (
    <div className="absolute inset-0" style={{pointerEvents:active?"all":"none",zIndex:10}}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{cursor}}
        onMouseDown={down} onMouseMove={move} onMouseUp={up}/>
    </div>
  );
}

// ─── Unsaved dialog ───────────────────────────────────────────────────────────

function UnsavedDialog({ onSave, onDiscard, onCancel }:
  { onSave(): void; onDiscard(): void; onCancel(): void }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}/>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        className="relative z-10 bg-[#1e1e26] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <h3 className="text-base font-semibold text-white mb-1">Unsaved annotations</h3>
        <p className="text-sm text-white/50 mb-5">You have unsaved annotation changes.</p>
        <div className="flex flex-col gap-2">
          <button onClick={onSave} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">Save & Close</button>
          <button onClick={onDiscard} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-xl border border-white/10 transition-colors">Discard Changes</button>
          <button onClick={onCancel} className="w-full py-2 text-white/40 hover:text-white/60 text-sm transition-colors">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main viewer modal ────────────────────────────────────────────────────────

export function DocumentViewerModal({ document: doc, allDocuments, onClose }: DocumentViewerModalProps) {
  const open = !!doc;

  const [signedUrl, setSignedUrl]     = useState<string|null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>("loading");
  const [zoom, setZoom]               = useState(100);
  const [fullscreen, setFullscreen]   = useState(false);
  const [copied, setCopied]           = useState(false);

  const docs = useMemo(() => allDocuments ?? (doc ? [doc] : []), [allDocuments, doc]);
  const [currentIdx, setCurrentIdx]   = useState(0);

  // PDF page state
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages]       = useState(0);
  const viewerControls                = useRef<NativePdfViewerHandle | null>(null);

  // Search
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQ, setSearchQ]             = useState("");
  const [searchMatchInfo, setSearchMatchInfo] = useState({ total: 0, current: 0 });
  const searchInputRef                    = useRef<HTMLInputElement>(null);

  // Annotations (PDF: page-aware; image: flat)
  const [activeTool, setActiveTool]     = useState<AnnotTool>("pointer");
  const [annotColor, setAnnotColor]     = useState("#f59e0b");
  const [annotSize, setAnnotSize]       = useState(3);
  const [pdfAnnotations, setPdfAnnotations]   = useState<PageAnnotation[]>([]);
  const [imgAnnotations, setImgAnnotations]   = useState<FlatAnnotation[]>([]);
  const [pdfHistory, setPdfHistory]           = useState<PageAnnotation[][]>([[]]);
  const [imgHistory, setImgHistory]           = useState<FlatAnnotation[][]>([[]]);
  const [histIdx, setHistIdx]           = useState(0);
  const [showColors, setShowColors]     = useState(false);
  const [showAnnotBar, setShowAnnotBar] = useState(false);
  const colorBtnRef                     = useRef<HTMLButtonElement>(null);

  const [saveState, setSaveState]       = useState<SaveState>("saved");
  const savedCountRef                   = useRef(0);
  const [showUnsaved, setShowUnsaved]   = useState(false);

  // Auto-hide toolbar
  const [toolbarPinned, setToolbarPinned]   = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const panelRef     = useRef<HTMLDivElement>(null);

  const currentDoc = docs[currentIdx] ?? doc;
  const vType: ViewerType = currentDoc ? detectType(currentDoc.mime_type, currentDoc.name) : "none";
  const { Icon, bg, tc } = currentDoc ? fileIcon(currentDoc.mime_type) : { Icon: File, bg:"bg-white/5", tc:"text-white/40" };

  const annotBarOpen = showAnnotBar && viewerState === "ready";
  const topPad = toolbarVisible ? (annotBarOpen ? 88 : 44) : 0;

  // Sync doc index
  useEffect(() => {
    if (!doc) return;
    const i = docs.findIndex(d => d.id === doc.id);
    setCurrentIdx(i >= 0 ? i : 0);
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => { if (currentDoc && open) fetchUrl(currentDoc); }, [currentDoc?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on close / doc change
  useEffect(() => {
    if (!open) {
      setZoom(100); setFullscreen(false); setSearchOpen(false); setSearchQ(""); setSearchMatchInfo({total:0,current:0});
      setActiveTool("pointer"); setPdfAnnotations([]); setImgAnnotations([]);
      setPdfHistory([[]]); setImgHistory([[]]); setHistIdx(0);
      setSaveState("saved"); setShowAnnotBar(false); savedCountRef.current = 0;
      setCurrentPage(1); setNumPages(0);
    }
  }, [open]);

  // Also reset annotations when switching documents
  useEffect(() => {
    setPdfAnnotations([]); setImgAnnotations([]);
    setPdfHistory([[]]); setImgHistory([[]]); setHistIdx(0);
    setSaveState("saved"); savedCountRef.current = 0;
    setCurrentPage(1); setNumPages(0);
  }, [currentIdx]);

  // Browser unload guard
  useEffect(() => {
    if (saveState !== "unsaved") return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [saveState]);

  // Toolbar auto-hide
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
  }, []);
  const scheduleHide = useCallback(() => {
    if (toolbarPinned) return;
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 2500);
  }, [toolbarPinned, clearHideTimer]);
  const revealToolbar = useCallback(() => { clearHideTimer(); setToolbarVisible(true); }, [clearHideTimer]);

  useEffect(() => { if (toolbarPinned) { clearHideTimer(); setToolbarVisible(true); } }, [toolbarPinned, clearHideTimer]);
  useEffect(() => { if (!toolbarPinned && toolbarVisible && open) scheduleHide(); }, [toolbarPinned, toolbarVisible, open, scheduleHide]);

  // Annotation helpers (PDF)
  function addPdfAnnotation(ann: PageAnnotation) {
    const next = [...pdfAnnotations, ann];
    setPdfAnnotations(next);
    const nh = [...pdfHistory.slice(0, histIdx+1), next];
    setPdfHistory(nh); setHistIdx(nh.length-1); setSaveState("unsaved");
  }
  // Annotation helpers (image)
  function addImgAnnotation(ann: FlatAnnotation) {
    const next = [...imgAnnotations, ann];
    setImgAnnotations(next);
    const nh = [...imgHistory.slice(0, histIdx+1), next];
    setImgHistory(nh); setHistIdx(nh.length-1); setSaveState("unsaved");
  }

  const undo = useCallback(() => {
    if (histIdx === 0) return;
    const ni = histIdx - 1; setHistIdx(ni);
    if (vType === "pdf") setPdfAnnotations(pdfHistory[ni]);
    else setImgAnnotations(imgHistory[ni]);
    setSaveState(ni === savedCountRef.current ? "saved" : "unsaved");
  }, [histIdx, pdfHistory, imgHistory, vType]);

  const redo = useCallback(() => {
    const maxIdx = vType === "pdf" ? pdfHistory.length - 1 : imgHistory.length - 1;
    if (histIdx >= maxIdx) return;
    const ni = histIdx + 1; setHistIdx(ni);
    if (vType === "pdf") setPdfAnnotations(pdfHistory[ni]);
    else setImgAnnotations(imgHistory[ni]);
    setSaveState(ni === savedCountRef.current ? "saved" : "unsaved");
  }, [histIdx, pdfHistory, imgHistory, vType]);

  function handleSaveAnnotations() {
    setSaveState("saving");
    savedCountRef.current = histIdx;
    setTimeout(() => setSaveState("saved"), 350);
    toast.success("Annotations saved");
  }

  const attemptClose = useCallback(() => {
    if (saveState === "unsaved") setShowUnsaved(true); else onClose();
  }, [saveState, onClose]);

  // Navigation
  const navigate = useCallback((dir: -1|1) => {
    if (saveState === "unsaved") { setShowUnsaved(true); return; }
    setCurrentIdx(i => {
      const n = i + dir;
      if (n < 0 || n >= docs.length) return i;
      setZoom(100); return n;
    });
  }, [docs.length, saveState]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (activeTool !== "pointer") { setActiveTool("pointer"); return; }
        if (searchOpen) { setSearchOpen(false); setSearchQ(""); return; }
        attemptClose(); return;
      }
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key==="+"||e.key==="=") setZoom(z=>Math.min(z+25,300));
      if (e.key==="-") setZoom(z=>Math.max(z-25,25));
      if ((e.metaKey||e.ctrlKey)&&e.key==="f") { e.preventDefault(); setSearchOpen(s=>!s); }
      if ((e.metaKey||e.ctrlKey)&&e.key==="z") undo();
      if ((e.metaKey||e.ctrlKey)&&e.key==="y") redo();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, searchOpen, navigate, activeTool, attemptClose, undo, redo]);

  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);

  async function handleDownload() {
    if (!currentDoc) return;
    if (signedUrl) { const a = window.document.createElement("a"); a.href=signedUrl; a.download=currentDoc.name; a.click(); }
    else { await fetchUrl(currentDoc); }
  }

  async function handleCopyLink() {
    if (!signedUrl) return;
    await navigator.clipboard.writeText(signedUrl);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  }

  const ANNOT_TOOLS: { id: AnnotTool; Icon: React.ElementType; label: string }[] = [
    { id:"pointer",   Icon:MousePointer2, label:"Pointer (ESC)" },
    { id:"pen",       Icon:Pen,           label:"Pen"           },
    { id:"highlight", Icon:Highlighter,   label:"Highlight"     },
    { id:"text",      Icon:Type,          label:"Text"          },
    { id:"rect",      Icon:Square,        label:"Rectangle"     },
    { id:"circle",    Icon:Circle,        label:"Circle"        },
    { id:"line",      Icon:Minus,         label:"Line"          },
    { id:"eraser",    Icon:Eraser,        label:"Eraser"        },
  ];

  const handlePanelMouseMove = useCallback((e: React.MouseEvent) => {
    if (toolbarPinned || toolbarVisible) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect && e.clientY - rect.top < 80) revealToolbar();
  }, [toolbarPinned, toolbarVisible, revealToolbar]);

  const annotCount = vType === "pdf" ? pdfAnnotations.length : imgAnnotations.length;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div key="viewer-overlay"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:0.15}}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onMouseDown={e => { if (e.target===e.currentTarget) attemptClose(); }}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md"/>

            <motion.div ref={panelRef} key="viewer-panel"
              initial={{opacity:0,scale:0.97,y:8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:8}}
              transition={{duration:0.18,ease:"easeOut"}}
              className={cn(
                "relative z-10 overflow-hidden",
                "bg-[#0d0d11] border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.7)]",
                fullscreen ? "w-screen h-screen rounded-none" : "w-[95vw] max-w-7xl h-[93vh] rounded-2xl"
              )}
              onMouseMove={handlePanelMouseMove}
              onMouseLeave={() => { if (!toolbarPinned) scheduleHide(); }}
            >
              {/* ── Top chrome ──────────────────────────────────────────────── */}
              <div
                className="absolute top-0 left-0 right-0 z-[70]"
                style={{ transform: toolbarVisible?"translateY(0)":"translateY(-100%)", transition:"transform 200ms ease-out" }}
                onMouseEnter={revealToolbar}
                onMouseLeave={() => { if (!toolbarPinned) scheduleHide(); }}
              >
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-3 h-11 border-b border-white/[0.06] bg-[#1c1c24]">
                  {/* LEFT */}
                  <div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0", bg)}>
                    <Icon className={cn("w-3 h-3", tc)}/>
                  </div>
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-white/90 truncate max-w-[180px]">{currentDoc?.name}</p>
                    {currentDoc?.deal_address && (
                      <span className="hidden lg:flex items-center gap-1 text-[10px] text-teal-400/70 flex-shrink-0">
                        <Building2 className="w-2.5 h-2.5"/>{currentDoc.deal_address}
                      </span>
                    )}
                    <div className="flex-shrink-0"><SaveIndicator state={saveState}/></div>
                  </div>

                  {/* CENTER */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Doc navigation */}
                    {docs.length > 1 && (
                      <>
                        <button onClick={()=>navigate(-1)} disabled={currentIdx===0} className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-20 transition-colors">
                          <ChevronLeft className="w-3.5 h-3.5 text-white/60"/>
                        </button>
                        <span className="text-[10px] text-white/40 px-0.5">{currentIdx+1}/{docs.length}</span>
                        <button onClick={()=>navigate(1)} disabled={currentIdx===docs.length-1} className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-20 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 text-white/60"/>
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-0.5"/>
                      </>
                    )}

                    {/* Page counter (PDF only) */}
                    {vType === "pdf" && numPages > 0 && (
                      <>
                        <span className="text-[10px] text-white/40 font-mono">p.{currentPage}/{numPages}</span>
                        <div className="w-px h-4 bg-white/10 mx-0.5"/>
                      </>
                    )}

                    {/* Zoom */}
                    {viewerState === "ready" && (
                      <>
                        <button onClick={()=>setZoom(z=>Math.max(z-25,25))} className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Zoom out (-)">
                          <ZoomOut className="w-3.5 h-3.5 text-white/60"/>
                        </button>
                        <button onClick={()=>setZoom(100)} className="text-[11px] text-white/50 hover:text-white/80 w-10 text-center transition-colors font-mono" title="Reset zoom">
                          {zoom}%
                        </button>
                        <button onClick={()=>setZoom(z=>Math.min(z+25,300))} className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Zoom in (+)">
                          <ZoomIn className="w-3.5 h-3.5 text-white/60"/>
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-0.5"/>
                      </>
                    )}

                    {/* Search (PDF only) */}
                    {vType === "pdf" && (
                      <AnimatePresence>
                        {searchOpen ? (
                          <motion.div
                            initial={{width:0,opacity:0}} animate={{width:"auto",opacity:1}} exit={{width:0,opacity:0}}
                            className="flex items-center gap-1 bg-white/[0.06] rounded-lg px-2 py-1 border border-white/10 overflow-hidden"
                          >
                            <Search className="w-3 h-3 text-white/40 flex-shrink-0"/>
                            <input ref={searchInputRef} value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                              placeholder="Search document…"
                              className="w-36 bg-transparent text-xs text-white/90 placeholder:text-white/30 outline-none"
                              onKeyDown={e=>{
                                if(e.key==="Escape"){setSearchOpen(false);setSearchQ("");}
                                if(e.key==="Enter") viewerControls.current?.searchNext();
                              }}
                            />
                            {searchMatchInfo.total > 0 && (
                              <span className="text-[10px] text-white/40 font-mono flex-shrink-0">
                                {searchMatchInfo.current+1}/{searchMatchInfo.total}
                              </span>
                            )}
                            {searchQ && searchMatchInfo.total === 0 && (
                              <span className="text-[10px] text-red-400/70 flex-shrink-0">0 results</span>
                            )}
                            <button onClick={()=>viewerControls.current?.searchPrev()} className="p-0.5 hover:text-white/60 text-white/30" title="Previous">
                              <ChevronLeft className="w-3 h-3"/>
                            </button>
                            <button onClick={()=>viewerControls.current?.searchNext()} className="p-0.5 hover:text-white/60 text-white/30" title="Next">
                              <ChevronRight className="w-3 h-3"/>
                            </button>
                            <button onClick={()=>{setSearchOpen(false);setSearchQ("");}} className="p-0.5 hover:text-white/60 text-white/30">
                              <X className="w-2.5 h-2.5"/>
                            </button>
                          </motion.div>
                        ) : (
                          <button onClick={()=>setSearchOpen(true)} className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Search (Ctrl+F)">
                            <Search className="w-3.5 h-3.5 text-white/50"/>
                          </button>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  <div className="w-px h-4 bg-white/10"/>

                  {/* RIGHT */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={()=>setShowAnnotBar(s=>!s)}
                      className={cn("p-1.5 rounded transition-colors", showAnnotBar?"bg-indigo-500/20 text-indigo-400":"text-white/50 hover:text-white/80 hover:bg-white/[0.08]")}
                      title="Annotations">
                      <Pen className="w-3.5 h-3.5"/>
                    </button>
                    {saveState==="unsaved" && (
                      <button onClick={handleSaveAnnotations} className="px-2 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors">Save</button>
                    )}
                    <button onClick={handleDownload} className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Download">
                      <Download className="w-3.5 h-3.5 text-white/50"/>
                    </button>
                    {signedUrl && (
                      <>
                        <button onClick={handleCopyLink} className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Copy link">
                          {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5 text-white/50"/>}
                        </button>
                        <a href={signedUrl} target="_blank" rel="noreferrer">
                          <button className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Open in new tab">
                            <ExternalLink className="w-3.5 h-3.5 text-white/50"/>
                          </button>
                        </a>
                      </>
                    )}
                    <button onClick={()=>setFullscreen(f=>!f)} className="p-1.5 rounded hover:bg-white/[0.08] transition-colors" title="Fullscreen">
                      {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-white/50"/> : <Maximize2 className="w-3.5 h-3.5 text-white/50"/>}
                    </button>
                    <button onClick={()=>setToolbarPinned(p=>!p)}
                      className={cn("p-1.5 rounded transition-colors", toolbarPinned?"text-indigo-400/80 hover:bg-white/[0.08]":"text-white/30 hover:text-white/60 hover:bg-white/[0.08]")}
                      title={toolbarPinned?"Unpin toolbar":"Pin toolbar"}>
                      {toolbarPinned ? <Pin className="w-3.5 h-3.5"/> : <PinOff className="w-3.5 h-3.5"/>}
                    </button>
                    <button onClick={attemptClose} className="p-1.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors ml-0.5" title="Close (Esc)">
                      <X className="w-4 h-4 text-white/60"/>
                    </button>
                  </div>
                </div>

                {/* Annotation bar */}
                <AnimatePresence>
                  {annotBarOpen && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.15}}
                      className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-[#1a1a21] overflow-hidden">
                      {ANNOT_TOOLS.map(({id,Icon:TIcon,label})=>(
                        <button key={id} onClick={()=>setActiveTool(t=>t===id?"pointer":id)} title={label}
                          className={cn("p-1.5 rounded-lg transition-all", activeTool===id?"bg-indigo-500/25 text-indigo-400 ring-1 ring-indigo-500/40":"text-white/40 hover:text-white/70 hover:bg-white/5")}>
                          <TIcon className="w-3.5 h-3.5"/>
                        </button>
                      ))}
                      <div className="w-px h-4 bg-white/10 mx-1"/>
                      {/* Color picker */}
                      <div className="relative">
                        <button ref={colorBtnRef} onClick={()=>setShowColors(s=>!s)}
                          className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Color">
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{background:annotColor}}/>
                          <ChevronDown className="w-2.5 h-2.5 text-white/30"/>
                        </button>
                        <AnimatePresence>
                          {showColors && (
                            <ColorPicker color={annotColor} onChange={setAnnotColor}
                              anchorRef={colorBtnRef as React.RefObject<HTMLButtonElement>}
                              onClose={()=>setShowColors(false)}/>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Stroke size */}
                      {[2,4,6].map(s=>(
                        <button key={s} onClick={()=>setAnnotSize(s)}
                          className={cn("flex items-center justify-center w-6 h-6 rounded-lg transition-all", annotSize===s?"bg-indigo-500/20 ring-1 ring-indigo-500/40":"hover:bg-white/5")}>
                          <div className="rounded-full bg-white/60" style={{width:s+2,height:s+2}}/>
                        </button>
                      ))}
                      <div className="w-px h-4 bg-white/10 mx-1"/>
                      <button onClick={undo} disabled={histIdx===0} title="Undo" className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-25 transition-colors">
                        <Undo2 className="w-3.5 h-3.5 text-white/50"/>
                      </button>
                      <button onClick={redo} disabled={
                        histIdx>=(vType==="pdf"?pdfHistory.length-1:imgHistory.length-1)
                      } title="Redo" className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-25 transition-colors">
                        <Redo2 className="w-3.5 h-3.5 text-white/50"/>
                      </button>
                      {annotCount > 0 && (
                        <button onClick={()=>{
                          if(vType==="pdf"){setPdfAnnotations([]);setPdfHistory([[]]);} else{setImgAnnotations([]);setImgHistory([[]]);}
                          setHistIdx(0);setSaveState("saved");savedCountRef.current=0;
                        }} className="text-[10px] text-red-400/60 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                          Clear
                        </button>
                      )}
                      {activeTool !== "pointer" && (
                        <span className="ml-auto text-[10px] text-indigo-400/60 italic">{activeTool} · ESC to cancel</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hover-reveal strip */}
              {!toolbarPinned && !toolbarVisible && (
                <div className="absolute top-0 left-0 right-0 h-4 z-[75]" onMouseEnter={revealToolbar}/>
              )}

              {/* Content */}
              <div className="absolute inset-0 flex flex-col"
                style={{ paddingTop:topPad, transition:"padding-top 200ms ease-out" }}>

                {/* Viewer */}
                <div className="flex-1 min-h-0 relative overflow-hidden bg-[#0d0d11]">

                  {viewerState === "loading" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-400/80"/>
                      <p className="text-sm text-white/30">Generating secure access…</p>
                    </div>
                  )}
                  {viewerState === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-7 h-7 text-red-400/80"/>
                      <p className="text-sm text-white/80 font-medium">Preview unavailable</p>
                      <button onClick={()=>currentDoc&&fetchUrl(currentDoc)} className="text-xs text-indigo-400 hover:underline">Retry</button>
                    </div>
                  )}
                  {viewerState === "unsupported" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center",bg)}>
                        <Icon className={cn("w-7 h-7",tc)}/>
                      </div>
                      <p className="text-sm font-semibold text-white">{currentDoc?.name}</p>
                      <p className="text-xs text-white/40">{currentDoc&&formatFileSize(currentDoc.file_size)}</p>
                      <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                        <Download className="w-3.5 h-3.5"/> Download
                      </button>
                    </div>
                  )}

                  {viewerState === "ready" && signedUrl && currentDoc && (
                    <>
                      {/* Native PDF viewer */}
                      {vType === "pdf" && (
                        <NativePdfViewer
                          url={signedUrl}
                          zoomPct={zoom}
                          activeTool={activeTool}
                          annotColor={annotColor}
                          annotSize={annotSize}
                          annotations={pdfAnnotations}
                          searchQuery={searchOpen ? searchQ : ""}
                          onAnnotationAdd={addPdfAnnotation}
                          onSearchStateChange={(total, current) => setSearchMatchInfo({total,current})}
                          onPageChange={setCurrentPage}
                          onNumPagesReady={setNumPages}
                          onControlsReady={h => { viewerControls.current = h; }}
                        />
                      )}

                      {/* Image viewer */}
                      {vType === "image" && (
                        <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                          <img src={signedUrl} alt={currentDoc.name}
                            style={{ transform:`scale(${zoom/100})`, transformOrigin:"center", transition:"transform 0.2s ease" }}
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"/>
                          <ImageAnnotCanvas
                            tool={activeTool} color={annotColor} lineWidth={annotSize}
                            annotations={imgAnnotations} onAdd={addImgAnnotation}/>
                        </div>
                      )}

                      {/* Office / unsupported with URL */}
                      {(vType === "office" || vType === "none") && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center",bg)}>
                            <Icon className={cn("w-7 h-7",tc)}/>
                          </div>
                          <p className="text-sm font-semibold text-white">{currentDoc.name}</p>
                          <div className="flex gap-2">
                            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                              <Download className="w-3.5 h-3.5"/> Download
                            </button>
                            <a href={signedUrl} target="_blank" rel="noreferrer">
                              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-xl border border-white/10 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5"/> Open
                              </button>
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Status bar */}
                {currentDoc && (
                  <div className="flex items-center justify-between px-4 py-1 border-t border-white/[0.05] bg-[#16161d] flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/25">{getDocumentCategoryLabel(currentDoc.category)}</span>
                      <span className="text-[10px] text-white/20">·</span>
                      <span className="text-[10px] text-white/25">{formatFileSize(currentDoc.file_size)}</span>
                      {annotCount > 0 && (
                        <><span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-amber-400/60">{annotCount} annotation{annotCount!==1?"s":""}</span></>
                      )}
                    </div>
                    <span className="text-[10px] text-white/20">
                      {viewerState==="ready" && vType==="pdf" ? "Native PDF engine" : viewerState==="ready" ? "Secure · 1h" : ""}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnsaved && (
          <UnsavedDialog
            onSave={()=>{ handleSaveAnnotations(); setShowUnsaved(false); onClose(); }}
            onDiscard={()=>{ setSaveState("saved"); setShowUnsaved(false); onClose(); }}
            onCancel={()=>setShowUnsaved(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
