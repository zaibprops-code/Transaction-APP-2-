export type MediaCategory =
  | "exterior"
  | "kitchen"
  | "living_room"
  | "bedroom"
  | "bathroom"
  | "backyard"
  | "garage"
  | "inspection"
  | "renovation"
  | "closing"
  | "floor_plan"
  | "drone"
  | "other";

export type MediaSource = "local" | "google_drive" | "dropbox" | "onedrive" | "mls";
export type MediaType = "photo" | "video" | "floor_plan" | "document";

export interface AIMediaAnalysis {
  room_type: string;
  detected_features: string[];
  quality_score: number;
  issues: string[];
  tags: string[];
  description: string;
  marketing_caption: string;
}

export interface MediaItem {
  id: string;
  deal_id: string;
  name: string;
  url: string;
  thumbnail_url: string;
  category: MediaCategory;
  type: MediaType;
  source: MediaSource;
  source_path?: string;
  ai_analysis?: AIMediaAnalysis;
  is_cover: boolean;
  is_featured: boolean;
  width: number;
  height: number;
  file_size: number;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
  notes?: string;
  drive_file_id?: string;
  drive_sync_status?: "synced" | "pending" | "error";
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: number;
  modifiedTime: string;
  kind: "file" | "folder";
  itemCount?: number;
}

export interface MediaProvider {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  comingSoon?: boolean;
}

export interface MediaStats {
  total: number;
  by_category: Partial<Record<MediaCategory, number>>;
  completeness_score: number;
  missing_rooms: string[];
  cover_photo?: MediaItem;
}
