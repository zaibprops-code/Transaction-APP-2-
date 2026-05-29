"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderOpen,
  Search,
  Upload,
  FileText,
  FileImage,
  File,
  LayoutGrid,
  List,
  Sparkles,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/types";
import {
  formatFileSize,
  formatRelativeDate,
  getDocumentCategoryLabel,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CopilotBar } from "@/components/ai/copilot-bar";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Purchase Agreements",
  "Disclosures",
  "Inspection",
  "Title",
  "Financing",
  "Closing",
];

interface UploadItem {
  id: string;
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return { Icon: FileImage, bg: "bg-emerald-500/10", color: "text-emerald-400" };
  if (mime === "application/pdf") return { Icon: FileText, bg: "bg-red-500/10", color: "text-red-400" };
  if (mime.includes("word") || mime.includes("document")) return { Icon: FileText, bg: "bg-blue-500/10", color: "text-blue-400" };
  return { Icon: File, bg: "bg-muted/20", color: "text-muted-foreground" };
}

export function DocumentsContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dealFilter, setDealFilter] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const json = await res.json() as { documents: Document[] };
        setDocuments(json.documents ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // Unique deal addresses for filter pills
  const dealAddresses = Array.from(
    new Set(documents.map(d => d.deal_address).filter(Boolean))
  ) as string[];

  async function uploadFile(file: File) {
    const uploadId = `${Date.now()}-${file.name}`;
    setUploads(prev => [...prev, { id: uploadId, name: file.name, status: "uploading" }]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Upload failed");
      }
      const json = await res.json() as { document?: Document; path?: string };
      const newDoc: Document = json.document ?? {
        id: uploadId,
        deal_id: "",
        org_id: "org-1",
        name: file.name,
        file_path: json.path ?? "",
        file_size: file.size,
        mime_type: file.type,
        category: "other",
        uploaded_by: "",
        created_at: new Date().toISOString(),
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: "done" } : u));
      setTimeout(() => setUploads(prev => prev.filter(u => u.id !== uploadId)), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: "error", error: msg } : u));
      setTimeout(() => setUploads(prev => prev.filter(u => u.id !== uploadId)), 4000);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    // Upload in parallel (up to 3 at a time)
    const chunks: File[][] = [];
    for (let i = 0; i < arr.length; i += 3) chunks.push(arr.slice(i, i + 3));
    for (const chunk of chunks) await Promise.all(chunk.map(uploadFile));
    toast.success(arr.length === 1 ? "Document uploaded" : `${arr.length} documents uploaded`);
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragOver(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  const filtered = documents.filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      doc.name.toLowerCase().includes(q) ||
      (doc.deal_address?.toLowerCase().includes(q) ?? false) ||
      getDocumentCategoryLabel(doc.category).toLowerCase().includes(q);
    const matchCategory = category === "All" ||
      getDocumentCategoryLabel(doc.category).toLowerCase().includes(category.toLowerCase().replace(/s$/, ""));
    const matchDeal = dealFilter === "All" || doc.deal_address === dealFilter;
    return matchSearch && matchCategory && matchDeal;
  });

  const isUploading = uploads.some(u => u.status === "uploading");

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Documents</h1>
          <Badge variant="secondary">{documents.length} {documents.length === 1 ? "file" : "files"}</Badge>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="w-48 h-8 text-xs"
          />
          <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5 border border-border">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded transition-colors", view === "grid" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground")}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded transition-colors", view === "list" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground")}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Category + Deal filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto flex-shrink-0">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn(
            "flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
            category === cat ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
          )}>{cat}</button>
        ))}
        {dealAddresses.length > 0 && (
          <>
            <div className="w-px h-4 bg-border flex-shrink-0" />
            <button onClick={() => setDealFilter("All")} className={cn(
              "flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
              dealFilter === "All" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
            )}><Building2 className="w-3 h-3" /> All Deals</button>
            {dealAddresses.map(addr => (
              <button key={addr} onClick={() => setDealFilter(addr)} className={cn(
                "flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all max-w-[140px] truncate",
                dealFilter === addr ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
              )}>{addr}</button>
            ))}
          </>
        )}
      </div>

      {/* AI Copilot Bar */}
      <div className="px-4 py-2 border-b border-border/50 flex-shrink-0">
        <CopilotBar
          message="AI: 2 documents need review — Missing inspection report for 923 Maple Court"
          prompt="Which deals have missing documents and what's needed?"
          variant="violet"
        />
      </div>

      {/* Upload progress toasts */}
      {uploads.length > 0 && (
        <div className="px-4 pt-3 flex-shrink-0 space-y-1.5">
          {uploads.map(u => (
            <div key={u.id} className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs border",
              u.status === "uploading" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
              u.status === "done" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
              u.status === "error" && "bg-red-500/10 border-red-500/20 text-red-300",
            )}>
              {u.status === "uploading" && <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />}
              {u.status === "done" && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
              {u.status === "error" && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
              <span className="truncate flex-1">{u.name}</span>
              <span className="flex-shrink-0">{u.status === "uploading" ? "Uploading..." : u.status === "done" ? "Done" : u.error}</span>
              <button onClick={() => setUploads(prev => prev.filter(x => x.id !== u.id))}><X className="w-3 h-3 opacity-60 hover:opacity-100" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={cn(
          "mx-4 mt-4 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex-shrink-0",
          isDragOver ? "border-indigo-500/60 bg-indigo-500/10" : "border-border hover:border-indigo-500/40 hover:bg-indigo-500/5"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={cn("w-7 h-7 mx-auto mb-2 transition-colors", isDragOver ? "text-indigo-400" : "text-muted-foreground")} />
        <p className="text-sm text-muted-foreground">
          {isDragOver ? <span className="text-indigo-400 font-medium">Drop to upload</span> : <>Drop files here or <span className="text-indigo-400">browse</span></>}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, PNG, JPG · up to 50MB · multi-file supported</p>
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Upload contracts, disclosures, and other files — or upload from any deal's Docs tab.
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Upload your first document
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
          <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No documents match your filters.</p>
          <button onClick={() => { setSearch(""); setCategory("All"); setDealFilter("All"); }} className="text-xs text-indigo-400 mt-2 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className={cn(
          "flex-1 min-h-0 overflow-y-auto p-4",
          view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start" : "space-y-2"
        )}>
          {view === "grid" ? (
            filtered.map(doc => {
              const { Icon, bg, color } = fileIcon(doc.mime_type);
              return (
                <div key={doc.id} className="bg-card border border-border rounded-xl p-4 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-10 h-12 rounded-lg flex items-center justify-center", bg)}>
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.is_signed && <Badge variant="success" className="text-[10px]">Signed</Badge>}
                      {doc.ai_extracted && <Badge variant="purple" className="text-[10px]">AI</Badge>}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground mb-1.5">
                    {getDocumentCategoryLabel(doc.category)} · {formatFileSize(doc.file_size)}
                  </p>
                  {doc.deal_address && (
                    <div className="flex items-center gap-1 mb-1">
                      <Building2 className="w-2.5 h-2.5 text-teal-400 flex-shrink-0" />
                      <p className="text-[10px] text-teal-400 truncate">{doc.deal_address}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/60">{formatRelativeDate(doc.created_at)}</p>
                </div>
              );
            })
          ) : (
            filtered.map(doc => {
              const { Icon, bg, color } = fileIcon(doc.mime_type);
              return (
                <div key={doc.id} className="bg-card border border-border rounded-xl p-3.5 hover:border-indigo-500/20 transition-all flex items-center gap-4">
                  <div className={cn("w-8 h-10 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span>{getDocumentCategoryLabel(doc.category)}</span>
                      <span>·</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      {doc.deal_address && (
                        <>
                          <span>·</span>
                          <span className="text-teal-400 truncate flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5" />{doc.deal_address}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{formatRelativeDate(doc.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.is_signed && <Badge variant="success" className="text-[10px]">Signed</Badge>}
                    {doc.ai_extracted && <Badge variant="purple" className="text-[10px]">AI</Badge>}
                    <Button variant="ghost" size="icon-sm">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
