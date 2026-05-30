"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, ChevronRight, ChevronLeft, FileText,
  Users, Send, CheckCircle, Loader2, GripVertical
} from "lucide-react";
import type { Document, SignatureParticipant, SignatureField } from "@/types";
import { toast } from "sonner";

interface CreateRequestModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  dealId?: string;
}

const ROLES: { value: SignatureParticipant["role"]; label: string }[] = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "agent", label: "Agent" },
  { value: "lender", label: "Lender" },
  { value: "title_officer", label: "Title Officer" },
  { value: "coordinator", label: "Coordinator" },
  { value: "external", label: "External" },
];

const FIELD_TYPES: { value: SignatureField["field_type"]; label: string; icon: string }[] = [
  { value: "signature", label: "Signature", icon: "✍️" },
  { value: "initials", label: "Initials", icon: "AB" },
  { value: "date", label: "Date", icon: "📅" },
  { value: "full_name", label: "Full Name", icon: "👤" },
  { value: "text", label: "Text Field", icon: "T" },
  { value: "checkbox", label: "Checkbox", icon: "☑️" },
];

interface ParticipantDraft {
  name: string;
  email: string;
  role: SignatureParticipant["role"];
  signing_order: number;
}

interface FieldDraft {
  field_type: SignatureField["field_type"];
  page: number;
  participant_index: number;
  label: string;
}

export function CreateRequestModal({ open, onClose, onCreated, dealId }: CreateRequestModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);

  // Step 2
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    { name: "", email: "", role: "buyer", signing_order: 1 },
  ]);

  // Step 3
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [sendNow, setSendNow] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoadingDocs(true);
    const url = dealId ? `/api/documents?deal_id=${dealId}` : "/api/documents";
    fetch(url)
      .then(r => r.json())
      .then(d => setDocuments(d.documents ?? []))
      .catch(() => {})
      .finally(() => setLoadingDocs(false));
  }, [open, dealId]);

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setSelectedDocId("");
    setExpiresInDays(7);
    setParticipants([{ name: "", email: "", role: "buyer", signing_order: 1 }]);
    setFields([]);
    setSendNow(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addParticipant = () => {
    setParticipants(prev => [
      ...prev,
      { name: "", email: "", role: "external", signing_order: prev.length + 1 },
    ]);
  };

  const removeParticipant = (i: number) => {
    setParticipants(prev => prev.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, signing_order: idx + 1 })));
  };

  const updateParticipant = (i: number, updates: Partial<ParticipantDraft>) => {
    setParticipants(prev => prev.map((p, idx) => idx === i ? { ...p, ...updates } : p));
  };

  const addField = () => {
    setFields(prev => [
      ...prev,
      { field_type: "signature", page: 1, participant_index: 0, label: "" },
    ]);
  };

  const removeField = (i: number) => {
    setFields(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateField = (i: number, updates: Partial<FieldDraft>) => {
    setFields(prev => prev.map((f, idx) => idx === i ? { ...f, ...updates } : f));
  };

  const step1Valid = title.trim() && selectedDocId;
  const step2Valid = participants.every(p => p.name.trim() && p.email.includes("@"));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          document_id: selectedDocId,
          title,
          expires_at: expiresAt,
          participants,
          fields: fields.length > 0 ? fields : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create request");

      const reqId = data.request?.id;

      if (sendNow && reqId) {
        await fetch(`/api/signatures/${reqId}/send`, { method: "POST" });
        toast.success("Signature request sent", { description: `${participants.length} participant${participants.length !== 1 ? "s" : ""} notified.` });
      } else {
        toast.success("Signature request created", { description: "You can send it when ready." });
      }

      onCreated();
      handleClose();
    } catch (e) {
      toast.error("Failed to create request", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <Dialog open={open} onOpenChange={open ? handleClose : undefined}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Send className="w-4 h-4 text-indigo-400" />
            New Signature Request
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {[
            { n: 1, label: "Document", icon: FileText },
            { n: 2, label: "Recipients", icon: Users },
            { n: 3, label: "Fields & Send", icon: CheckCircle },
          ].map(({ n, label, icon: Icon }, idx) => (
            <div key={n} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                step === n ? "bg-indigo-500/20 text-indigo-400" :
                step > n ? "text-emerald-400" : "text-muted-foreground"
              }`}>
                <Icon className="w-3 h-3" />
                {label}
              </div>
              {idx < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step 1: Document & Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Request Title</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Purchase Agreement — 1847 Oakwood Drive"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Document</label>
              {loadingDocs ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading documents…
                </div>
              ) : documents.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No documents available. Upload a document first.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDocId(doc.id); if (!title) setTitle(doc.name); }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                        selectedDocId === doc.id
                          ? "border-indigo-500/50 bg-indigo-500/10"
                          : "border-border hover:border-border/80 bg-surface hover:bg-surface-2"
                      }`}
                    >
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.category.replace("_", " ")}</p>
                      </div>
                      {selectedDocId === doc.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Expires In</label>
              <div className="flex items-center gap-2">
                {[3, 7, 14, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setExpiresInDays(days)}
                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                      expiresInDays === days
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setStep(2)} disabled={!step1Valid}>
                Next: Add Recipients <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Recipients */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Add everyone who needs to sign. They&apos;ll sign in the order listed.</p>

            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Signer {i + 1}</span>
                    </div>
                    {participants.length > 1 && (
                      <button onClick={() => removeParticipant(i)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={p.name}
                      onChange={e => updateParticipant(i, { name: e.target.value })}
                      placeholder="Full Name"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={p.email}
                      onChange={e => updateParticipant(i, { email: e.target.value })}
                      placeholder="Email Address"
                      className="h-8 text-xs"
                      type="email"
                    />
                  </div>
                  <select
                    value={p.role}
                    onChange={e => updateParticipant(i, { role: e.target.value as SignatureParticipant["role"] })}
                    className="w-full h-8 text-xs rounded-md border border-border bg-background px-2 text-foreground"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={addParticipant}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-indigo-400 border border-dashed border-indigo-500/30 rounded-lg hover:bg-indigo-500/5 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Another Signer
            </button>

            <div className="flex justify-between pt-2">
              <Button size="sm" variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <Button size="sm" onClick={() => setStep(3)} disabled={!step2Valid}>
                Next: Fields <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Fields & Send */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Signature Fields</label>
                <span className="text-xs text-muted-foreground">Optional — adds required fields for signers</span>
              </div>

              {fields.length > 0 && (
                <div className="space-y-2">
                  {fields.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border border-border rounded-lg">
                      <select
                        value={f.field_type}
                        onChange={e => updateField(i, { field_type: e.target.value as SignatureField["field_type"] })}
                        className="h-7 text-xs rounded border border-border bg-background px-1 text-foreground"
                      >
                        {FIELD_TYPES.map(ft => (
                          <option key={ft.value} value={ft.value}>{ft.icon} {ft.label}</option>
                        ))}
                      </select>
                      <span className="text-xs text-muted-foreground">pg.</span>
                      <input
                        type="number"
                        min={1}
                        value={f.page}
                        onChange={e => updateField(i, { page: parseInt(e.target.value) || 1 })}
                        className="w-12 h-7 text-xs rounded border border-border bg-background px-1 text-foreground text-center"
                      />
                      <select
                        value={f.participant_index}
                        onChange={e => updateField(i, { participant_index: parseInt(e.target.value) })}
                        className="flex-1 h-7 text-xs rounded border border-border bg-background px-1 text-foreground"
                      >
                        {participants.map((p, pi) => (
                          <option key={pi} value={pi}>{p.name || `Signer ${pi + 1}`}</option>
                        ))}
                      </select>
                      <button onClick={() => removeField(i)} className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addField}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-indigo-400 border border-dashed border-indigo-500/30 rounded-lg hover:bg-indigo-500/5 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Signature Field
              </button>
            </div>

            {/* Summary */}
            <div className="border border-border rounded-lg p-3 space-y-2 bg-surface">
              <p className="text-xs font-medium text-foreground">Summary</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Document</span>
                  <span className="text-foreground truncate max-w-[200px]">{selectedDoc?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="text-foreground">{participants.length} signer{participants.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="text-foreground">In {expiresInDays} days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSendNow(!sendNow)}
                className={`w-4 h-4 rounded border flex items-center justify-center ${sendNow ? "border-indigo-500 bg-indigo-500" : "border-border"}`}
              >
                {sendNow && <CheckCircle className="w-3 h-3 text-white" />}
              </button>
              <span className="text-xs text-foreground">Send invites immediately</span>
            </div>

            <div className="flex justify-between pt-2">
              <Button size="sm" variant="ghost" onClick={() => setStep(2)}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                {sendNow ? "Create & Send" : "Create Request"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
