"use client";

import { create } from "zustand";
import { MOCK_MEDIA } from "@/lib/media/mock-media-data";
import type { MediaItem, MediaCategory } from "@/types/media";

interface MediaStore {
  // Items per deal (seeded from mock data)
  items: MediaItem[];
  // Lightbox state
  lightboxOpen: boolean;
  lightboxIndex: number;
  lightboxItems: MediaItem[];
  // Upload state
  uploading: boolean;
  uploadProgress: Record<string, number>; // filename -> 0-100
  // Filter
  activeCategory: MediaCategory | "all";

  // Actions
  getItemsByDeal: (dealId: string) => MediaItem[];
  addItems: (items: MediaItem[]) => void;
  setCover: (id: string) => void;
  setFeatured: (id: string, featured: boolean) => void;
  removeItem: (id: string) => void;
  openLightbox: (items: MediaItem[], index: number) => void;
  closeLightbox: () => void;
  lightboxNext: () => void;
  lightboxPrev: () => void;
  setActiveCategory: (cat: MediaCategory | "all") => void;
  setUploadProgress: (filename: string, progress: number) => void;
  clearUploadProgress: (filename: string) => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  items: MOCK_MEDIA,
  lightboxOpen: false,
  lightboxIndex: 0,
  lightboxItems: [],
  uploading: false,
  uploadProgress: {},
  activeCategory: "all",

  getItemsByDeal: (dealId) => get().items.filter((i) => i.deal_id === dealId),

  addItems: (newItems) =>
    set((s) => ({ items: [...s.items, ...newItems] })),

  setCover: (id) =>
    set((s) => {
      const target = s.items.find((i) => i.id === id);
      if (!target) return s;
      return {
        items: s.items.map((i) =>
          i.deal_id === target.deal_id
            ? { ...i, is_cover: i.id === id }
            : i
        ),
      };
    }),

  setFeatured: (id, featured) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, is_featured: featured } : i)),
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  openLightbox: (items, index) =>
    set({ lightboxOpen: true, lightboxItems: items, lightboxIndex: index }),

  closeLightbox: () => set({ lightboxOpen: false }),

  lightboxNext: () =>
    set((s) => ({
      lightboxIndex: (s.lightboxIndex + 1) % s.lightboxItems.length,
    })),

  lightboxPrev: () =>
    set((s) => ({
      lightboxIndex:
        s.lightboxIndex === 0 ? s.lightboxItems.length - 1 : s.lightboxIndex - 1,
    })),

  setActiveCategory: (cat) => set({ activeCategory: cat }),

  setUploadProgress: (filename, progress) =>
    set((s) => ({
      uploadProgress: { ...s.uploadProgress, [filename]: progress },
      uploading: true,
    })),

  clearUploadProgress: (filename) =>
    set((s) => {
      const next = { ...s.uploadProgress };
      delete next[filename];
      return { uploadProgress: next, uploading: Object.keys(next).length > 0 };
    }),
}));
