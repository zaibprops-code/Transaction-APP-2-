import type { MediaProvider, DriveFile, MediaItem } from "@/types/media";

// Extensible provider architecture — add new providers here
export const MEDIA_PROVIDERS: MediaProvider[] = [
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Import photos directly from Google Drive folders",
    connected: false, // Set to true when OAuth is configured
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Connect your Dropbox account to import media",
    connected: false,
    comingSoon: true,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Import from Microsoft OneDrive",
    connected: false,
    comingSoon: true,
  },
  {
    id: "mls",
    name: "MLS / IDX",
    description: "Pull listing photos directly from your MLS",
    connected: false,
    comingSoon: true,
  },
];

// Mock Google Drive folder structure
export const MOCK_DRIVE_ROOT: DriveFile[] = [
  { id: "folder-properties", name: "Properties", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-10T10:00:00Z", kind: "folder", itemCount: 4 },
  { id: "folder-clients", name: "Client Documents", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-08T14:00:00Z", kind: "folder", itemCount: 12 },
  { id: "folder-marketing", name: "Marketing Assets", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-05T09:00:00Z", kind: "folder", itemCount: 8 },
  { id: "folder-shared", name: "Shared Drives", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-12T16:00:00Z", kind: "folder", itemCount: 3 },
];

export const MOCK_DRIVE_FOLDERS: Record<string, DriveFile[]> = {
  "folder-properties": [
    { id: "folder-oakwood", name: "1847 Oakwood Drive", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-04T10:00:00Z", kind: "folder", itemCount: 14 },
    { id: "folder-riverside", name: "4520 Riverside Blvd", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-10T11:00:00Z", kind: "folder", itemCount: 8 },
    { id: "folder-maple", name: "923 Maple Court", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-14T09:00:00Z", kind: "folder", itemCount: 5 },
    { id: "folder-summit", name: "7801 Summit Ridge Rd", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2024-11-16T08:00:00Z", kind: "folder", itemCount: 3 },
  ],
  "folder-oakwood": [
    { id: "drive-file-101", name: "Side Yard View.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/oakwood-ext2/120/90", size: 2100000, modifiedTime: "2024-11-02T10:30:00Z", kind: "file" },
    { id: "drive-file-102", name: "Backyard Deck.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/oakwood-yard1/120/90", size: 2600000, modifiedTime: "2024-11-03T09:00:00Z", kind: "file" },
    { id: "drive-file-103", name: "Aerial Drone Shot.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/oakwood-drone1/120/90", size: 3100000, modifiedTime: "2024-11-03T09:30:00Z", kind: "file" },
    { id: "drive-file-104", name: "Dining Room.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/oakwood-dining1/120/90", size: 2050000, modifiedTime: "2024-11-02T14:00:00Z", kind: "file" },
    { id: "drive-file-105", name: "Home Office.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/oakwood-office1/120/90", size: 1900000, modifiedTime: "2024-11-02T14:30:00Z", kind: "file" },
    { id: "drive-file-106", name: "Floor Plan.pdf", mimeType: "application/pdf", size: 850000, modifiedTime: "2024-11-01T09:00:00Z", kind: "file" },
    { id: "drive-file-107", name: "Laundry Room.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/oakwood-laundry1/120/90", size: 1700000, modifiedTime: "2024-11-02T15:00:00Z", kind: "file" },
  ],
  "folder-riverside": [
    { id: "drive-file-201", name: "Kitchen.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/riverside-kitchen1/120/90", size: 2000000, modifiedTime: "2024-11-10T10:00:00Z", kind: "file" },
    { id: "drive-file-202", name: "Balcony View.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/riverside-balcony1/120/90", size: 2800000, modifiedTime: "2024-11-10T10:30:00Z", kind: "file" },
    { id: "drive-file-203", name: "Pool Area.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/riverside-pool1/120/90", size: 3200000, modifiedTime: "2024-11-10T11:00:00Z", kind: "file" },
    { id: "drive-file-204", name: "Second Bedroom.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/riverside-bed2/120/90", size: 1850000, modifiedTime: "2024-11-10T11:30:00Z", kind: "file" },
  ],
  "folder-maple": [
    { id: "drive-file-301", name: "Inspection Report Photos.zip", mimeType: "application/zip", size: 15000000, modifiedTime: "2024-11-14T12:00:00Z", kind: "file" },
    { id: "drive-file-302", name: "Roof Damage Detail.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/maple-roof1/120/90", size: 1900000, modifiedTime: "2024-11-14T11:30:00Z", kind: "file" },
    { id: "drive-file-303", name: "Interior Before.jpg", mimeType: "image/jpeg", thumbnailLink: "https://picsum.photos/seed/maple-int1/120/90", size: 2100000, modifiedTime: "2024-11-14T10:00:00Z", kind: "file" },
  ],
};

export function mockBrowseDrive(folderId?: string): DriveFile[] {
  if (!folderId) return MOCK_DRIVE_ROOT;
  return MOCK_DRIVE_FOLDERS[folderId] ?? [];
}

export function mockImportFiles(fileIds: string[], dealId: string): MediaItem[] {
  const allFiles = Object.values(MOCK_DRIVE_FOLDERS).flat();
  return fileIds
    .map((id) => {
      const file = allFiles.find((f) => f.id === id);
      if (!file || file.kind === "folder") return null;
      const isImage = file.mimeType.startsWith("image/");
      if (!isImage) return null;
      return {
        id: `imported-${id}-${Date.now()}`,
        deal_id: dealId,
        name: file.name.replace(/\.[^.]+$/, ""),
        url: file.thumbnailLink?.replace("120/90", "900/600") ?? `https://picsum.photos/seed/${id}/900/600`,
        thumbnail_url: file.thumbnailLink ?? `https://picsum.photos/seed/${id}/400/267`,
        category: "other" as const,
        type: "photo" as const,
        source: "google_drive" as const,
        drive_file_id: id,
        drive_sync_status: "synced" as const,
        is_cover: false,
        is_featured: false,
        width: 900,
        height: 600,
        file_size: file.size ?? 2000000,
        uploaded_by: "user-1",
        uploaded_by_name: "Sarah Mitchell",
        created_at: new Date().toISOString(),
        ai_analysis: {
          room_type: "Unknown",
          detected_features: ["Analyzing..."],
          quality_score: 0,
          issues: [],
          tags: ["imported", "pending-analysis"],
          description: "AI analysis in progress...",
          marketing_caption: "Generating caption...",
        },
      } satisfies MediaItem;
    })
    .filter(Boolean) as MediaItem[];
}
