"use client";

import {
  useCallback, useEffect, useImperativeHandle,
  useRef, useState, forwardRef,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Worker ───────────────────────────────────────────────────────────────────
// Worker copied to /public at install time (see scripts/copy-pdf-worker.sh)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnnotTool =
  | "pointer" | "pen" | "highlight" | "text"
  | "rect" | "circle" | "line" | "eraser";

export interface PageAnnotation {
  id: string;
  tool: AnnotTool;
  color: string;
  lineWidth: number;
  pageIndex: number;
  /** Normalized coordinates (0–1) relative to rendered page dimensions */
  points?: { x: number; y: number }[];
  rect?: { x: number; y: number; w: number; h: number };
  text?: string;
  textX?: number;
  textY?: number;
}

interface PageTextItem {
  text: string;
  normX: number; normY: number; normW: number; normH: number;
}

interface PageTextData {
  pageIndex: number;
  items: PageTextItem[];
}

interface SearchMatch {
  id: string;
  pageIndex: number;
  rect: { x: number; y: number; w: number; h: number };
}

export interface NativePdfViewerHandle {
  searchNext(): void;
  searchPrev(): void;
  goToPage(pageNum: number): void;
}

export interface NativePdfViewerProps {
  url: string;
  zoomPct: number;
  activeTool: AnnotTool;
  annotColor: string;
  annotSize: number;
  annotations: PageAnnotation[];
  searchQuery: string;
  onAnnotationAdd(ann: PageAnnotation): void;
  onSearchStateChange(total: number, current: number): void;
  onPageChange(page: number): void;
  onNumPagesReady(n: number): void;
  onControlsReady(handle: NativePdfViewerHandle): void;
}

// ─── Text extraction & search ─────────────────────────────────────────────────

async function buildTextIndex(pdf: PDFDocumentProxy): Promise<PageTextData[]> {
  const pages: PageTextData[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const vp = page.getViewport({ scale: 1 });
    const { items } = await page.getTextContent();
    const textItems: PageTextItem[] = [];
    for (const raw of items) {
      // TextItem has `str`; TextMarkedContent does not
      if (!("str" in raw)) continue;
      const item = raw as { str: string; transform: number[]; width: number; height: number };
      if (!item.str.trim()) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      const h = Math.abs(item.height) || Math.abs(item.transform[3]) || 12;
      const w = item.width || Math.abs(item.transform[0]) * item.str.length * 0.55;
      textItems.push({
        text: item.str,
        normX: Math.max(0, x / vp.width),
        normY: Math.max(0, 1 - (y + h) / vp.height),
        normW: Math.min(1, w / vp.width),
        normH: Math.min(0.2, h / vp.height),
      });
    }
    pages.push({ pageIndex: i, items: textItems });
  }
  return pages;
}

function runSearch(index: PageTextData[], query: string): SearchMatch[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const matches: SearchMatch[] = [];
  for (const page of index) {
    for (const item of page.items) {
      if (item.text.toLowerCase().includes(q)) {
        matches.push({
          id: crypto.randomUUID(),
          pageIndex: page.pageIndex,
          rect: { x: item.normX, y: item.normY, w: item.normW, h: item.normH },
        });
      }
    }
  }
  return matches;
}

// ─── Per-page annotation canvas ───────────────────────────────────────────────

interface PageAnnotCanvasProps {
  pageIndex: number;
  width: number;
  height: number;
  tool: AnnotTool;
  color: string;
  lineWidth: number;
  annotations: PageAnnotation[];
  onAdd(a: PageAnnotation): void;
}

function PageAnnotCanvas({ pageIndex, width, height, tool, color, lineWidth, annotations, onAdd }: PageAnnotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const pts       = useRef<{ x: number; y: number }[]>([]);
  const startPt   = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const redraw = useCallback(() => {
    const c = canvasRef.current; if (!c || !width || !height) return;
    c.width = width; c.height = height;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (const ann of annotations) {
      const W = width, H = height;
      ctx.save();
      ctx.strokeStyle = ann.color; ctx.fillStyle = ann.color;
      ctx.lineWidth = ann.lineWidth; ctx.lineCap = "round"; ctx.lineJoin = "round";

      if (ann.tool === "pen" && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x * W, ann.points[0].y * H);
        for (const p of ann.points) ctx.lineTo(p.x * W, p.y * H);
        ctx.stroke();
      } else if (ann.tool === "highlight" && ann.rect) {
        ctx.globalAlpha = 0.32;
        ctx.fillRect(ann.rect.x * W, ann.rect.y * H, ann.rect.w * W, ann.rect.h * H);
      } else if (ann.tool === "rect" && ann.rect) {
        ctx.strokeRect(ann.rect.x * W, ann.rect.y * H, ann.rect.w * W, ann.rect.h * H);
      } else if (ann.tool === "circle" && ann.rect) {
        const rx = ann.rect.x * W, ry = ann.rect.y * H;
        const rw = ann.rect.w * W, rh = ann.rect.h * H;
        ctx.beginPath();
        ctx.ellipse(rx + rw / 2, ry + rh / 2, Math.abs(rw / 2), Math.abs(rh / 2), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ann.tool === "line" && ann.rect) {
        ctx.beginPath();
        ctx.moveTo(ann.rect.x * W, ann.rect.y * H);
        ctx.lineTo((ann.rect.x + ann.rect.w) * W, (ann.rect.y + ann.rect.h) * H);
        ctx.stroke();
      } else if (ann.tool === "text" && ann.text && ann.textX !== undefined && ann.textY !== undefined) {
        ctx.font = `${Math.max(ann.lineWidth * 5, 13)}px Inter, sans-serif`;
        ctx.fillText(ann.text, ann.textX * W, ann.textY * H);
      }
      ctx.restore();
    }
  }, [annotations, width, height]);

  useEffect(() => { redraw(); }, [redraw]);

  const active = tool !== "pointer";
  const cursor = tool === "eraser" ? "cell" : tool === "text" ? "text" : active ? "crosshair" : "default";

  function normPos(e: React.MouseEvent): { x: number; y: number } {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }

  function onDown(e: React.MouseEvent) {
    if (!active) return;
    e.preventDefault();
    drawing.current = true;
    const p = normPos(e); startPt.current = p; pts.current = [p];
  }

  function onMove(e: React.MouseEvent) {
    if (!drawing.current || !active) return;
    const c = canvasRef.current; const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const p = normPos(e);
    if (tool === "pen") {
      pts.current.push(p);
      const prev = pts.current[pts.current.length - 2];
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prev.x * c.width, prev.y * c.height);
      ctx.lineTo(p.x * c.width, p.y * c.height);
      ctx.stroke(); ctx.restore();
    } else {
      redraw();
      const { x: sx, y: sy } = startPt.current;
      const dw = (p.x - sx) * c.width, dh = (p.y - sy) * c.height;
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lineWidth; ctx.lineCap = "round";
      if (tool === "highlight") { ctx.globalAlpha = 0.32; ctx.fillRect(sx * c.width, sy * c.height, dw, dh); }
      else if (tool === "rect")  { ctx.strokeRect(sx * c.width, sy * c.height, dw, dh); }
      else if (tool === "circle") { ctx.beginPath(); ctx.ellipse(sx * c.width + dw / 2, sy * c.height + dh / 2, Math.abs(dw / 2), Math.abs(dh / 2), 0, 0, Math.PI * 2); ctx.stroke(); }
      else if (tool === "line")   { ctx.beginPath(); ctx.moveTo(sx * c.width, sy * c.height); ctx.lineTo(p.x * c.width, p.y * c.height); ctx.stroke(); }
      else if (tool === "eraser") { ctx.clearRect(p.x * c.width - 20, p.y * c.height - 20, 40, 40); }
      ctx.restore();
    }
  }

  function onUp(e: React.MouseEvent) {
    if (!drawing.current || !active) return;
    drawing.current = false;
    const p = normPos(e); const { x: sx, y: sy } = startPt.current;
    if (tool === "pen") {
      onAdd({ id: crypto.randomUUID(), tool, color, lineWidth, pageIndex, points: [...pts.current] });
    } else if (tool !== "eraser" && tool !== "text") {
      onAdd({ id: crypto.randomUUID(), tool, color, lineWidth, pageIndex, rect: { x: sx, y: sy, w: p.x - sx, h: p.y - sy } });
    }
    pts.current = []; redraw();
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: active ? "all" : "none", cursor, zIndex: 10 }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
    />
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export const NativePdfViewer = forwardRef<NativePdfViewerHandle, NativePdfViewerProps>(
  function NativePdfViewer(
    { url, zoomPct, activeTool, annotColor, annotSize, annotations, searchQuery,
      onAnnotationAdd, onSearchStateChange, onPageChange, onNumPagesReady, onControlsReady },
    _ref
  ) {
    const [numPages, setNumPages]           = useState(0);
    const [textIndex, setTextIndex]         = useState<PageTextData[]>([]);
    const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
    const [activeMatch, setActiveMatch]     = useState(0);
    const [pageDims, setPageDims]           = useState<Map<number, { w: number; h: number }>>(new Map());
    const [indexing, setIndexing]           = useState(false);

    const pageEls    = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerW, setContainerW] = useState(800);

    useEffect(() => {
      const ro = new ResizeObserver(entries => {
        for (const e of entries) setContainerW(e.contentRect.width);
      });
      if (containerRef.current) ro.observe(containerRef.current);
      return () => ro.disconnect();
    }, []);

    // Page width = container minus padding, scaled by zoom
    const pageWidth = Math.max(200, Math.floor((containerW - 48) * (zoomPct / 100)));

    // On PDF load: set page count + build text index
    const onDocumentLoad = useCallback(async (pdf: PDFDocumentProxy) => {
      setNumPages(pdf.numPages);
      onNumPagesReady(pdf.numPages);
      setIndexing(true);
      try {
        const idx = await buildTextIndex(pdf);
        setTextIndex(idx);
      } finally {
        setIndexing(false);
      }
    }, [onNumPagesReady]);

    // Search
    useEffect(() => {
      if (!searchQuery.trim()) {
        setSearchMatches([]); setActiveMatch(0); onSearchStateChange(0, 0);
        return;
      }
      const matches = runSearch(textIndex, searchQuery);
      setSearchMatches(matches); setActiveMatch(0);
      onSearchStateChange(matches.length, 0);
    }, [searchQuery, textIndex, onSearchStateChange]);

    // Scroll to current match
    useEffect(() => {
      if (searchMatches.length === 0) return;
      const m = searchMatches[activeMatch]; if (!m) return;
      pageEls.current.get(m.pageIndex)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      onSearchStateChange(searchMatches.length, activeMatch);
    }, [activeMatch, searchMatches, onSearchStateChange]);

    // Current page tracking
    useEffect(() => {
      if (!containerRef.current || numPages === 0) return;
      const obs = new IntersectionObserver(
        entries => {
          const vis = entries.filter(e => e.isIntersecting);
          if (!vis.length) return;
          const best = vis.reduce((a, b) => a.intersectionRatio > b.intersectionRatio ? a : b);
          const idx = parseInt(best.target.getAttribute("data-page-idx") ?? "0", 10);
          onPageChange(idx + 1);
        },
        { root: containerRef.current, threshold: [0.1, 0.5] }
      );
      pageEls.current.forEach(el => { if (el) obs.observe(el); });
      return () => obs.disconnect();
    }, [numPages, onPageChange]);

    // Expose controls to parent
    useEffect(() => {
      onControlsReady({
        searchNext: () => setActiveMatch(i => Math.min(i + 1, searchMatches.length - 1)),
        searchPrev: () => setActiveMatch(i => Math.max(i - 1, 0)),
        goToPage:   (p: number) => pageEls.current.get(p - 1)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      });
    }, [onControlsReady, searchMatches.length]);

    // Unused ref (controls passed via onControlsReady instead)
    useImperativeHandle(_ref, () => ({
      searchNext: () => setActiveMatch(i => Math.min(i + 1, searchMatches.length - 1)),
      searchPrev: () => setActiveMatch(i => Math.max(i - 1, 0)),
      goToPage:   (p: number) => pageEls.current.get(p - 1)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    }));

    return (
      <div ref={containerRef} className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#0a0a0f] viewer-scroll">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoad}
          loading={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400/70" />
              <p className="text-sm text-white/30">Loading document…</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="w-8 h-8 text-red-400/70" />
              <p className="text-sm text-white/60">Failed to load document</p>
            </div>
          }
          className={cn("flex flex-col items-center py-5 gap-4 min-h-full")}
        >
          {Array.from({ length: numPages }, (_, i) => {
            const dims       = pageDims.get(i);
            const pageAnns   = annotations.filter(a => a.pageIndex === i);
            const pageMatches = searchMatches.filter(m => m.pageIndex === i);
            // Global index of first match on this page
            const matchStart = searchMatches.findIndex(m => m.pageIndex === i);

            return (
              <div
                key={i}
                ref={el => { pageEls.current.set(i, el); }}
                data-page-idx={i}
                className="relative flex-shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              >
                <Page
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderTextLayer
                  renderAnnotationLayer={false}
                  onLoadSuccess={page => {
                    setPageDims(prev => {
                      const n = new Map(prev);
                      n.set(i, { w: page.width, h: page.height });
                      return n;
                    });
                  }}
                  className="block select-text"
                />

                {/* Search highlight overlay */}
                {pageMatches.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                    {pageMatches.map((match, j) => {
                      const isActive = matchStart + j === activeMatch;
                      return (
                        <div
                          key={match.id}
                          style={{
                            position: "absolute",
                            left:   `${match.rect.x * 100}%`,
                            top:    `${match.rect.y * 100}%`,
                            width:  `${match.rect.w * 100}%`,
                            height: `${match.rect.h * 100}%`,
                            background: isActive
                              ? "rgba(251,146,60,0.55)"
                              : "rgba(253,224,71,0.40)",
                            borderRadius: "2px",
                            outline: isActive ? "2px solid rgba(251,146,60,0.8)" : "none",
                            transition: "background 0.15s",
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Annotation canvas */}
                {dims && (
                  <div className="absolute inset-0" style={{ zIndex: 10 }}>
                    <PageAnnotCanvas
                      pageIndex={i}
                      width={dims.w}
                      height={dims.h}
                      tool={activeTool}
                      color={annotColor}
                      lineWidth={annotSize}
                      annotations={pageAnns}
                      onAdd={onAnnotationAdd}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Document>

        {/* Indexing indicator */}
        {indexing && (
          <div
            className="fixed bottom-6 right-6 bg-[#1c1c24]/95 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-white/50 shadow-xl"
            style={{ zIndex: 200 }}
          >
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            Indexing text for search…
          </div>
        )}
      </div>
    );
  }
);
