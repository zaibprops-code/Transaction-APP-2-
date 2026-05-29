"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  MessageSquare,
  PenLine,
  StickyNote,
  Brain,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_TASKS, MOCK_DOCUMENTS, MOCK_AI_INSIGHTS, MOCK_ACTIVITIES } from "@/lib/mock-data";
import { PropertyMediaPanel } from "@/components/media/property-media-panel";
import {
  formatCurrency,
  formatDate,
  getDaysToClose,
  getHealthColor,
  getStageLabel,
  getStageColor,
  getPriorityColor,
  isOverdue,
  generateInitials,
  formatFileSize,
  getDocumentCategoryLabel,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types";

export function DealWorkspace({ deal }: { deal: Deal }) {
  const [activeTab, setActiveTab] = useState("overview");
  const dealTasks = MOCK_TASKS.filter(t => t.deal_id === deal.id);
  const dealDocs = MOCK_DOCUMENTS.filter(d => d.deal_id === deal.id);
  const dealInsights = MOCK_AI_INSIGHTS.filter(i => i.deal_id === deal.id);
  const dealActivities = MOCK_ACTIVITIES.filter(a => a.deal_id === deal.id);
  const daysToClose = getDaysToClose(deal.closing_date);
  const healthColor = getHealthColor(deal.health_score);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 bg-surface/50">
        <div className="flex items-start gap-3 mb-3">
          <Link
            href="/deals"
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground">{deal.address}</h1>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded border",
                getStageColor(deal.stage)
              )}>
                {getStageLabel(deal.stage)}
              </span>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border",
                healthColor === "emerald" && "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                healthColor === "amber" && "text-amber-400 bg-amber-400/10 border-amber-400/20",
                healthColor === "red" && "text-red-400 bg-red-400/10 border-red-400/20"
              )}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                Health: {deal.health_score}/100
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {deal.city}, {deal.state} {deal.zip}
              <span className="mx-1">·</span>
              <Calendar className="w-3 h-3" />
              <span className={daysToClose <= 7 ? "text-amber-400 font-medium" : ""}>
                Closing {formatDate(deal.closing_date)}
                {daysToClose > 0 ? ` (${daysToClose}d)` : " (Today!)"}
              </span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-border px-4 pt-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-none p-0 gap-0 h-auto">
              {[
                { id: "overview", label: "Overview", icon: null },
                { id: "tasks", label: `Tasks (${dealTasks.length})`, icon: null },
                { id: "media", label: "Media", icon: null },
                { id: "documents", label: `Docs (${dealDocs.length})`, icon: null },
                { id: "communications", label: "Messages", icon: null },
                { id: "signatures", label: "Signatures", icon: null },
                { id: "ai", label: "AI Analysis", icon: Sparkles },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "rounded-none border-none bg-transparent px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                      "data-[state=active]:border-indigo-500 data-[state=active]:text-foreground",
                      "data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground hover:text-foreground",
                      "data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="w-3 h-3" />}
                      {tab.label}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="overflow-y-auto flex-1 p-4">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Deal Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Deal Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {[
                        { label: "Purchase Price", value: formatCurrency(deal.purchase_price) },
                        { label: "Earnest Money", value: deal.earnest_money ? formatCurrency(deal.earnest_money) : "—" },
                        { label: "Loan Amount", value: deal.loan_amount ? formatCurrency(deal.loan_amount) : "—" },
                        { label: "Contract Date", value: formatDate(deal.contract_date) },
                        { label: "Closing Date", value: formatDate(deal.closing_date) },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-muted-foreground text-xs">{item.label}</span>
                          <span className="text-foreground text-xs font-medium">{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Parties */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        Parties
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Buyer", name: deal.buyer_name, email: deal.buyer_email, phone: deal.buyer_phone },
                        { label: "Seller", name: deal.seller_name, email: deal.seller_email, phone: deal.seller_phone },
                      ].map(party => (
                        <div key={party.label} className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{party.label}</p>
                          <p className="text-sm font-medium text-foreground">{party.name}</p>
                          {party.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {party.email}
                            </p>
                          )}
                          {party.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {party.phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Health Score */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center",
                          healthColor === "emerald" ? "bg-emerald-400/20" :
                          healthColor === "amber" ? "bg-amber-400/20" : "bg-red-400/20"
                        )}>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            healthColor === "emerald" ? "bg-emerald-400" :
                            healthColor === "amber" ? "bg-amber-400" : "bg-red-400"
                          )} />
                        </div>
                        Deal Health: {deal.health_score}/100
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {deal.health_factors.map(factor => (
                        <div key={factor.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{factor.label}</span>
                            <span className={cn(
                              "font-medium",
                              factor.status === "good" ? "text-emerald-400" :
                              factor.status === "warning" ? "text-amber-400" : "text-red-400"
                            )}>
                              {factor.score}/{factor.max_score}
                            </span>
                          </div>
                          <Progress
                            value={(factor.score / factor.max_score) * 100}
                            color={factor.status === "good" ? "emerald" : factor.status === "warning" ? "amber" : "red"}
                          />
                          <p className="text-[10px] text-muted-foreground mt-0.5">{factor.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Tasks for this deal</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      Generate with AI
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs">
                      <Plus className="w-3 h-3" />
                      Add Task
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {dealTasks.map(task => (
                    <div key={task.id} className="bg-card border border-border rounded-xl p-3.5 flex items-start gap-3 hover:border-indigo-500/20 transition-all">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 rounded border-border bg-surface-2 flex-shrink-0 cursor-pointer"
                        defaultChecked={task.status === "completed"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground")}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant={task.priority === "critical" ? "destructive" : task.priority === "high" ? "warning" : "secondary"}
                            className="text-[10px]"
                          >
                            {task.priority}
                          </Badge>
                          <span className={cn("text-xs", isOverdue(task.due_date) && task.status !== "completed" ? "text-red-400" : "text-muted-foreground")}>
                            {isOverdue(task.due_date) && task.status !== "completed" ? "Overdue · " : ""}
                            Due {formatDate(task.due_date, "MMM d")}
                          </span>
                        </div>
                      </div>
                      {task.assigned_to_name && (
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="text-[9px]">{generateInitials(task.assigned_to_name)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {dealTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No tasks yet</p>
                      <p className="text-xs mt-1">Use AI to generate a complete task list</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="mt-0 h-full">
                <PropertyMediaPanel dealId={deal.id} dealAddress={deal.address} />
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Documents ({dealDocs.length})</h3>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus className="w-3 h-3" />
                    Upload
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {dealDocs.map(doc => (
                    <div key={doc.id} className="bg-card border border-border rounded-xl p-3.5 hover:border-indigo-500/20 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {getDocumentCategoryLabel(doc.category)} · {formatFileSize(doc.file_size)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {doc.is_signed && (
                              <Badge variant="success" className="text-[10px]">Signed</Badge>
                            )}
                            {doc.ai_extracted && (
                              <Badge variant="purple" className="text-[10px]">AI Analyzed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="ai" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-foreground">AI Analysis — {deal.address}</h3>
                    <Badge variant="purple" className="text-[10px]">GPT-4o</Badge>
                  </div>

                  {dealInsights.map(insight => (
                    <Card key={insight.id} className={cn(
                      "border",
                      insight.severity === "critical" && "border-red-500/20 bg-red-500/5",
                      insight.severity === "high" && "border-amber-500/20 bg-amber-500/5",
                      insight.type === "opportunity" && "border-emerald-500/20 bg-emerald-500/5"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn(
                            "w-4 h-4 flex-shrink-0 mt-0.5",
                            insight.severity === "critical" ? "text-red-400" :
                            insight.severity === "high" ? "text-amber-400" : "text-emerald-400"
                          )} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                            {insight.recommended_action && (
                              <div className="mt-2 flex items-start gap-1.5">
                                <ChevronRight className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-400">{insight.recommended_action}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {dealInsights.length === 0 && (
                    <div className="text-center py-12">
                      <Sparkles className="w-8 h-8 text-violet-400/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No AI insights yet</p>
                      <Button className="mt-4" size="sm" variant="outline">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        Run AI Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Other tabs with placeholder content */}
              <TabsContent value="communications" className="mt-0">
                <div className="text-center py-16 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Communications thread coming soon</p>
                  <Button className="mt-4" size="sm" variant="outline">
                    <Plus className="w-3.5 h-3.5" />
                    Send Message
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signatures" className="mt-0">
                <div className="text-center py-16 text-muted-foreground">
                  <PenLine className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Signature requests for this deal</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="w-3.5 h-3.5" />
                    Request Signature
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
