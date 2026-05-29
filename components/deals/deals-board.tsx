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
import { MOCK_DEALS } from "@/lib/mock-data";
import {
  formatCurrency,
  formatDate,
  getDaysToClose,
  getHealthColor,
  getStageLabel,
  getStageColor,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types";

const PIPELINE_STAGES = [
  { id: "new_lead", label: "New Lead", color: "blue" },
  { id: "under_contract", label: "Under Contract", color: "violet" },
  { id: "due_diligence", label: "Due Diligence", color: "indigo" },
  { id: "pending_docs", label: "Pending Docs", color: "amber" },
  { id: "clear_to_close", label: "Clear to Close", color: "emerald" },
] as const;

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
          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </div>
      </motion.div>
    </Link>
  );
}

export function DealsBoard() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");

  const activeDeals = MOCK_DEALS.filter(d => d.status === "active");
  const filtered = activeDeals.filter(d =>
    !search ||
    d.address.toLowerCase().includes(search.toLowerCase()) ||
    d.buyer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
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
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Board View */}
      {view === "board" && (
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
      {view === "list" && (
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
    </div>
  );
}
