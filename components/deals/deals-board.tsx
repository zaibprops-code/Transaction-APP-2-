"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  Search,
  Building2,
  Calendar,
  CheckSquare,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRealtimeDeals } from "@/lib/hooks/useRealtimeDeals";
import {
  formatCurrency,
  formatDate,
  getDaysToClose,
  getHealthColor,
  getStageLabel,
  getStageColor,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CopilotBar } from "@/components/ai/copilot-bar";
import { PackageOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Deal, DealStage, PropertyType } from "@/types";

const PIPELINE_STAGES = [
  { id: "new_lead", label: "New Lead", color: "blue" },
  { id: "under_contract", label: "Under Contract", color: "violet" },
  { id: "due_diligence", label: "Due Diligence", color: "indigo" },
  { id: "pending_docs", label: "Pending Docs", color: "amber" },
  { id: "clear_to_close", label: "Clear to Close", color: "emerald" },
] as const;

interface CreateDealForm {
  address: string;
  city: string;
  state: string;
  zip: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  purchase_price: string;
  earnest_money: string;
  loan_amount: string;
  contract_date: string;
  closing_date: string;
  property_type: PropertyType;
  stage: DealStage;
}

const DEFAULT_FORM: CreateDealForm = {
  address: "",
  city: "",
  state: "",
  zip: "",
  buyer_name: "",
  buyer_email: "",
  buyer_phone: "",
  seller_name: "",
  seller_email: "",
  seller_phone: "",
  purchase_price: "",
  earnest_money: "",
  loan_amount: "",
  contract_date: "",
  closing_date: "",
  property_type: "single_family",
  stage: "new_lead",
};

function CreateDealDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateDealForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof CreateDealForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.address.trim() || !form.buyer_name.trim()) {
      toast.error("Address and buyer name are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          buyer_name: form.buyer_name,
          buyer_email: form.buyer_email || undefined,
          buyer_phone: form.buyer_phone || undefined,
          seller_name: form.seller_name,
          seller_email: form.seller_email || undefined,
          seller_phone: form.seller_phone || undefined,
          purchase_price: form.purchase_price ? Number(form.purchase_price) : 0,
          earnest_money: form.earnest_money ? Number(form.earnest_money) : undefined,
          loan_amount: form.loan_amount ? Number(form.loan_amount) : undefined,
          contract_date: form.contract_date || undefined,
          closing_date: form.closing_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          property_type: form.property_type,
          stage: form.stage,
        }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to create deal");
      }
      toast.success("Deal created successfully");
      setForm(DEFAULT_FORM);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create New Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Property Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* City / State / Zip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Austin"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">ZIP</label>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="78701"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Buyer */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Buyer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.buyer_name}
                onChange={(e) => set("buyer_name", e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Buyer Email</label>
              <input
                type="email"
                value={form.buyer_email}
                onChange={(e) => set("buyer_email", e.target.value)}
                placeholder="jane@email.com"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Buyer Phone</label>
              <input
                type="tel"
                value={form.buyer_phone}
                onChange={(e) => set("buyer_phone", e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Seller */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Seller Name</label>
              <input
                type="text"
                value={form.seller_name}
                onChange={(e) => set("seller_name", e.target.value)}
                placeholder="John Smith"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Seller Email</label>
              <input
                type="email"
                value={form.seller_email}
                onChange={(e) => set("seller_email", e.target.value)}
                placeholder="john@email.com"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Seller Phone</label>
              <input
                type="tel"
                value={form.seller_phone}
                onChange={(e) => set("seller_phone", e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Price + Contract Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Purchase Price</label>
              <input
                type="number"
                value={form.purchase_price}
                onChange={(e) => set("purchase_price", e.target.value)}
                placeholder="450000"
                min={0}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contract Date</label>
              <input
                type="date"
                value={form.contract_date}
                onChange={(e) => set("contract_date", e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Earnest Money + Loan Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Earnest Money</label>
              <input
                type="number"
                value={form.earnest_money}
                onChange={(e) => set("earnest_money", e.target.value)}
                placeholder="5000"
                min={0}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Loan Amount</label>
              <input
                type="number"
                value={form.loan_amount}
                onChange={(e) => set("loan_amount", e.target.value)}
                placeholder="360000"
                min={0}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Closing Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Closing Date</label>
            <input
              type="date"
              value={form.closing_date}
              onChange={(e) => set("closing_date", e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Property Type + Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Property Type</label>
              <select
                value={form.property_type}
                onChange={(e) => set("property_type", e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="single_family">Single Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Pipeline Stage</label>
              <select
                value={form.stage}
                onChange={(e) => set("stage", e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="new_lead">New Lead</option>
                <option value="under_contract">Under Contract</option>
                <option value="due_diligence">Due Diligence</option>
                <option value="pending_docs">Pending Docs</option>
                <option value="clear_to_close">Clear to Close</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {submitting ? "Creating..." : "Create Deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const healthColor = getHealthColor(deal.health_score);
  const daysToClose = getDaysToClose(deal.closing_date);

  return (
    <Link href={`/deals/${deal.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-3.5 cursor-pointer hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-glow-sm group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{deal.address}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {deal.city}, {deal.state}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ml-2",
              healthColor === "emerald" && "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
              healthColor === "amber" && "text-amber-400 bg-amber-400/10 border-amber-400/20",
              healthColor === "red" && "text-red-400 bg-red-400/10 border-red-400/20"
            )}
          >
            {deal.health_score}
          </div>
        </div>

        <div className="mb-2">
          <Progress
            value={deal.health_score}
            color={healthColor === "emerald" ? "emerald" : healthColor === "amber" ? "amber" : "red"}
          />
        </div>

        <div className="space-y-1 text-[10px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="truncate">{deal.buyer_name}</span>
            <span className="font-medium text-foreground flex-shrink-0 ml-1">
              {formatCurrency(deal.purchase_price, true)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className={daysToClose <= 7 ? "text-amber-400 font-medium" : ""}>
              {daysToClose <= 0 ? "Closing today" : `${daysToClose}d to close`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-border/50">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CheckSquare className="w-3 h-3" />
            {deal.task_count ?? 0}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <FileText className="w-3 h-3" />
            {deal.doc_count ?? 0}
          </div>
          {/* Portal indicator dot */}
          <div
            className="flex items-center gap-1 text-[10px] text-amber-400 ml-auto"
            title="Client portal: awaiting client"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </Link>
  );
}

export function DealsBoard() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const { deals: activeDeals, loading, refetch } = useRealtimeDeals({ status: "active" });

  const filtered = activeDeals.filter(d =>
    !search ||
    d.address.toLowerCase().includes(search.toLowerCase()) ||
    d.buyer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Deal Pipeline</h1>
          <Badge variant="secondary">{activeDeals.length} active</Badge>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="w-48 h-8 text-xs"
          />
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </Button>
          <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setView("board")}
              className={cn(
                "p-1.5 rounded transition-colors",
                view === "board" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded transition-colors",
                view === "list" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowCreateDeal(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </Button>
        </div>
      </div>

      {/* AI Copilot Bar */}
      <div className="px-4 pb-2 flex-shrink-0">
        <CopilotBar
          message="AI: 3 deals need attention — 923 Maple Court at critical risk (45/100)"
          prompt="Which deals are at risk and what should I prioritize?"
          variant="red"
        />
      </div>

      {/* Loading / Empty state */}
      {loading && (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && activeDeals.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center">
          <PackageOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">No deals yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Create your first deal to start tracking transactions in your pipeline.
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreateDeal(true)}>
            <Plus className="w-3.5 h-3.5" />
            Create your first deal
          </Button>
        </div>
      )}

      {/* Board View */}
      {!loading && activeDeals.length > 0 && view === "board" && (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-max h-full">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = filtered.filter(d => d.stage === stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.purchase_price, 0);

              return (
                <div key={stage.id} className="w-64 flex-shrink-0 flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    {stageValue > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatCurrency(stageValue, true)}
                      </span>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5 flex-1">
                    {stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="border border-dashed border-border rounded-xl p-4 text-center">
                        <p className="text-xs text-muted-foreground">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {!loading && activeDeals.length > 0 && view === "list" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filtered.map((deal) => {
              const daysToClose = getDaysToClose(deal.closing_date);
              const healthColor = getHealthColor(deal.health_score);
              return (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <div className="bg-card border border-border rounded-xl p-4 hover:border-indigo-500/20 hover:bg-surface-2/30 transition-all flex items-center gap-4">
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground truncate">{deal.address}</p>
                        <p className="text-xs text-muted-foreground">{deal.city}, {deal.state}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-xs text-muted-foreground">Buyer</p>
                        <p className="text-sm font-medium text-foreground truncate">{deal.buyer_name}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-medium text-foreground">{formatCurrency(deal.purchase_price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Closing</p>
                        <p className={cn("text-sm font-medium", daysToClose <= 7 ? "text-amber-400" : "text-foreground")}>
                          {formatDate(deal.closing_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border hidden md:flex",
                        getStageColor(deal.stage)
                      )}>
                        {getStageLabel(deal.stage)}
                      </span>
                      <div className={cn(
                        "text-xs font-bold px-2 py-1 rounded border",
                        healthColor === "emerald" && "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                        healthColor === "amber" && "text-amber-400 bg-amber-400/10 border-amber-400/20",
                        healthColor === "red" && "text-red-400 bg-red-400/10 border-red-400/20"
                      )}>
                        {deal.health_score}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <CreateDealDialog
        open={showCreateDeal}
        onClose={() => setShowCreateDeal(false)}
        onCreated={refetch}
      />
    </div>
  );
}
