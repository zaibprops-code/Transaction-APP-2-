"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image as ImageIcon, X, CheckCircle, Loader2 } from "lucide-react";
import { useMediaStore } from "@/stores/media-store";
import type { MediaItem, MediaCategory } from "@/types/media";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  dealId: string;
  onUploaded?: (items: MediaItem[]) => void;
  compact?: boolean;
}

interface UploadFile {
  name: string;
  size: number;
  preview: string;
  progress: number;
  done: boolean;
}

const CATEGORY_OPTIONS: { value: MediaCategory; label: string }[] = [
  { value: "exterior", label: "Exterior" },
  { value: "kitchen", label: "Kitchen" },
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "backyard", label: "Backyard" },
  { value: "garage", label: "Garage" },
  { value: "inspection", label: "Inspection" },
  { value: "renovation", label: "Renovation" },
  { value: "closing", label: "Closing" },
  { value: "other", label: "Other" },
];

export function UploadZone({ dealId, onUploaded, compact = false }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<MediaCategory>("exterior");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItems } = useMediaStore();

  const processFiles = useCallback(
    (fileList: FileList) => {
      const imageFiles = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      const newFiles: UploadFile[] = imageFiles.map((f) => ({
        name: f.name,
        size: f.size,
        preview: URL.createObjectURL(f),
        progress: 0,
        done: false,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress for each file
      newFiles.forEach((file, idx) => {
        const interval = setInterval(() => {
          setFiles((prev) =>
            prev.map((pf) => {
              if (pf.name !== file.name || pf.done) return pf;
              const next = Math.min(pf.progress + Math.random() * 25 + 10, 100);
              return { ...pf, progress: next, done: next >= 100 };
            })
          );
        }, 200 + idx * 50);

        setTimeout(() => {
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((pf) =>
              pf.name === file.name ? { ...pf, progress: 100, done: true } : pf
            )
          );

          // Add to store
          const newItem: MediaItem = {
            id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            deal_id: dealId,
            name: file.name.replace(/\.[^.]+$/, ""),
            url: file.preview,
            thumbnail_url: file.preview,
            category: defaultCategory,
            type: "photo",
            source: "local",
            is_cover: false,
            is_featured: false,
            width: 900,
            height: 600,
            file_size: file.size,
            uploaded_by: "user-1",
            uploaded_by_name: "You",
            created_at: new Date().toISOString(),
          };
          addItems([newItem]);
          onUploaded?.([newItem]);
        }, 1500 + idx * 300 + Math.random() * 500);
      });
    },
    [dealId, defaultCategory, addItems, onUploaded]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  if (compact) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-xs text-muted-foreground hover:text-indigo-400"
      >
        <Upload className="w-3.5 h-3.5" />
        Upload Photos
        <input ref={inputRef} type="file" className="hidden" multiple accept="image/*" onChange={(e) => e.target.files && processFiles(e.target.files)} />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Category:</span>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDefaultCategory(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs transition-all",
                defaultCategory === opt.value
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-12 px-6",
          dragging
            ? "border-indigo-500 bg-indigo-500/10 shadow-glow-sm"
            : "border-border hover:border-indigo-500/50 hover:bg-surface-2"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />

        <motion.div
          animate={dragging ? { scale: 1.1 } : { scale: 1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center"
        >
          <Upload className={cn("w-7 h-7", dragging ? "text-indigo-400" : "text-muted-foreground")} />
        </motion.div>

        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {dragging ? "Drop photos here" : "Drag & drop property photos"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or <span className="text-indigo-400">click to browse</span> · JPG, PNG, HEIC up to 50MB each
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />Photos</div>
          <div className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" />Camera</div>
        </div>
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground font-medium">
              Uploading {files.length} file{files.length !== 1 ? "s" : ""}
            </p>
            {files.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-border"
              >
                <img
                  src={file.preview}
                  alt=""
                  className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full transition-colors",
                          file.done ? "bg-emerald-500" : "bg-indigo-500"
                        )}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {file.done ? "Done" : `${Math.round(file.progress)}%`}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {file.done ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  )}
                </div>
                {file.done && (
                  <button onClick={() => removeFile(file.name)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
