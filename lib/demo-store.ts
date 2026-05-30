import type { Deal, Document, SignatureRequest } from "@/types";

// In-memory store for demo-mode created data (cleared on server restart)
const demoDealStore = new Map<string, Deal>();
const demoDocStore = new Map<string, Document>();
const demoSigStore = new Map<string, SignatureRequest>();

export const demoStore = {
  addDeal(deal: Deal) { demoDealStore.set(deal.id, deal); },
  getDeal(id: string): Deal | undefined { return demoDealStore.get(id); },
  getDeals(): Deal[] { return Array.from(demoDealStore.values()); },

  addDoc(doc: Document) { demoDocStore.set(doc.id, doc); },
  getDocs(): Document[] { return Array.from(demoDocStore.values()); },

  addSignature(req: SignatureRequest) { demoSigStore.set(req.id, req); },
  getSignature(id: string): SignatureRequest | undefined { return demoSigStore.get(id); },
  getSignatures(): SignatureRequest[] { return Array.from(demoSigStore.values()); },
  updateSignature(id: string, updates: Partial<SignatureRequest>) {
    const existing = demoSigStore.get(id);
    if (existing) demoSigStore.set(id, { ...existing, ...updates, updated_at: new Date().toISOString() });
  },
};
