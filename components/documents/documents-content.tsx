"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Search,
  Upload,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  Loader2,
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

const CATEGORIES = [
  "All",
  "Purchase Agreements",
  "Disclosures",
  "Inspection",
  "Title",
  "Financing",
  "Closing",
];

export function DocumentsContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filtered = documents.filter(doc => {
    const matchSearch =
      !search ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.deal_address?.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === "All" ||
      getDocumentCategoryLabel(doc.category).toLowerCase().includes(category.toLowerCase().replace("s", ""));
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Documents</h1>
          <Badge variant="secondary">{documents.length} files</Badge>
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
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto flex-shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
              category === cat
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI Copilot Bar */}
      <div className="px-4 py-2 border-b border-border/50 flex-shrink-0">
        <CopilotBar
          message="AI: 2 documents need review — Missing inspection report for 923 Maple Court"
          prompt="Which deals have missing documents and what's needed?"
          variant="violet"
        />
      </div>

      {/* Upload Zone */}
      <div className="mx-4 mt-4 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer">
        <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Drop files here or <span className="text-indigo-400">browse</span>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOCX, PNG up to 50MB</p>
      </div>

      {/* Documents */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Upload contracts, disclosures, and other files to keep your deals organized.
          </p>
          <Button size="sm" className="gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload your first document
          </Button>
        </div>
      ) : (
        <div className={cn("flex-1 min-h-0 overflow-y-auto p-4", view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start" : "space-y-2")}>
          {view === "grid" ? (
            filtered.map(doc => (
              <div key={doc.id} className="bg-card border border-border rounded-xl p-4 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  {doc.is_signed && (
                    <Badge variant="success" className="text-[10px]">Signed</Badge>
                  )}
                  {!doc.is_signed && doc.ai_extracted && (
                    <Badge variant="purple" className="text-[10px]">AI</Badge>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">{doc.name}</p>
                <p className="text-[10px] text-muted-foreground mb-2">
                  {getDocumentCategoryLabel(doc.category)} · {formatFileSize(doc.file_size)}
                </p>
                {doc.deal_address && (
                  <p className="text-[10px] text-indigo-400 truncate">{doc.deal_address}</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeDate(doc.created_at)}</p>
              </div>
            ))
          ) : (
            filtered.map(doc => (
              <div key={doc.id} className="bg-card border border-border rounded-xl p-3.5 hover:border-indigo-500/20 transition-all flex items-center gap-4">
                <div className="w-8 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{getDocumentCategoryLabel(doc.category)}</span>
                    <span>·</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    {doc.deal_address && (
                      <>
                        <span>·</span>
                        <span className="text-indigo-400 truncate">{doc.deal_address}</span>
                      </>
                    )}
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
