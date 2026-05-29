import type { Deal, Document } from "@/types";

// In-memory store for demo-mode created data (cleared on server restart)
// This lets newly-created deals be navigable within the same session.
const demoDealStore = new Map<string, Deal>();
const demoDocStore = new Map<string, Document>();

export const demoStore = {
  addDeal(deal: Deal) { demoDealStore.set(deal.id, deal); },
  getDeal(id: string): Deal | undefined { return demoDealStore.get(id); },
  getDeals(): Deal[] { return Array.from(demoDealStore.values()); },

  addDoc(doc: Document) { demoDocStore.set(doc.id, doc); },
  getDocs(): Document[] { return Array.from(demoDocStore.values()); },
};
