"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_ANALYTICS, MOCK_KPI } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = {
  indigo: "#6366F1",
  violet: "#8B5CF6",
  emerald: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  slate: "#64748B",
  blue: "#3B82F6",
};

const PIE_COLORS = [
  CHART_COLORS.blue,
  CHART_COLORS.violet,
  CHART_COLORS.indigo,
  CHART_COLORS.amber,
  CHART_COLORS.emerald,
  CHART_COLORS.slate,
];

const customTooltipStyle = {
  backgroundColor: "#111318",
  border: "1px solid #2A2D38",
  borderRadius: "8px",
  fontSize: "12px",
};

const DATE_RANGES = ["Last 30 days", "Last 90 days", "Last 6 months", "This year"];

export function AnalyticsContent() {
  const [dateRange, setDateRange] = useState("Last 6 months");

  const metricCards = [
    { label: "Total Active Deals", value: MOCK_KPI.active_deals, suffix: "", trend: "+12%", trendUp: true },
    { label: "Closings This Month", value: MOCK_KPI.closings_this_month, suffix: "", trend: "-8%", trendUp: false },
    { label: "Pipeline Value", value: formatCurrency(24600000, true), suffix: "", trend: "+18%", trendUp: true },
    { label: "Avg Days to Close", value: "30", suffix: " days", trend: "-2d", trendUp: true },
    { label: "On-Time Close Rate", value: "94", suffix: "%", trend: "+3%", trendUp: true },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Analytics</h1>
        </div>
        <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
          {DATE_RANGES.map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                dateRange === range
                  ? "bg-surface-2 text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metricCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-gradient">
                {card.value}{card.suffix}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
              <div className={`text-xs mt-1 font-medium ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                {card.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Deals by month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Deals Opened vs Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_ANALYTICS.deals_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D38" />
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#64748B" }} />
                <Bar dataKey="opened" name="Opened" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="closed" name="Closed" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline value */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Pipeline Value Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_ANALYTICS.pipeline_value_over_time}>
                <defs>
                  <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D38" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={d => {
                    const date = new Date(d);
                    return date.toLocaleDateString("en-US", { month: "short" });
                  }}
                />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(v: number) => [formatCurrency(v), "Pipeline Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.indigo}
                  fill="url(#pipelineGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task completion rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MOCK_ANALYTICS.task_completion_rate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2D38" />
                <XAxis dataKey="week" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => [`${v}%`, "Completion Rate"]} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={CHART_COLORS.violet}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.violet, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pipeline Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={MOCK_ANALYTICS.stage_distribution}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    strokeWidth={2}
                    stroke="#0A0B0F"
                  >
                    {MOCK_ANALYTICS.stage_distribution.map((entry, i) => (
                      <Cell key={entry.stage} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {MOCK_ANALYTICS.stage_distribution.map((item, i) => (
                  <div key={item.stage} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.stage}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Coordinator", "Deals Closed", "Avg Days to Close", "Revenue"].map(h => (
                    <th key={h} className="text-left text-muted-foreground font-medium pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_ANALYTICS.team_performance.map((member, i) => (
                  <tr key={member.name} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-6 font-medium text-foreground">{member.name}</td>
                    <td className="py-3 pr-6 text-indigo-400 font-semibold">{member.deals_closed}</td>
                    <td className="py-3 pr-6 text-muted-foreground">{member.avg_days} days</td>
                    <td className="py-3 pr-6 text-emerald-400 font-semibold">{formatCurrency(member.revenue, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            AI Analytics Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "3 deals are trending toward delayed closing based on current document collection pace.",
              "Task completion rate dropped 9% this week — consider reviewing team workload distribution.",
              "923 Maple Court has the lowest health score in your pipeline and needs immediate attention.",
              "Your pipeline value grew 18% MoM — ahead of the industry average of 12%.",
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                <p className="text-sm text-muted-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
