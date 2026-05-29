import type { Deal } from "@/types";

// In-memory store for demo-mode created data (cleared on server restart)
// This lets newly-created deals be navigable within the same session.
const demoDealStore = new Map<string, Deal>();

export const demoStore = {
  addDeal(deal: Deal) { demoDealStore.set(deal.id, deal); },
  getDeal(id: string): Deal | undefined { return demoDealStore.get(id); },
  getDeals(): Deal[] { return Array.from(demoDealStore.values()); },
};
