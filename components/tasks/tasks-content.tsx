"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Sparkles,
  Search,
  Filter,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_TASKS } from "@/lib/mock-data";
import {
  formatDate,
  isOverdue,
  generateInitials,
  getPriorityColor,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CopilotBar } from "@/components/ai/copilot-bar";
import type { Task } from "@/types";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function TaskRow({ task }: { task: Task }) {
  const [done, setDone] = useState(task.status === "completed");
  const overdue = isOverdue(task.due_date) && !done;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border transition-all",
        done ? "opacity-50 bg-surface/30 border-border/50" : "bg-card border-border hover:border-indigo-500/20"
      )}
    >
      <input
        type="checkbox"
        checked={done}
        onChange={e => setDone(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-border bg-surface-2 flex-shrink-0 cursor-pointer accent-indigo-500"
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", done ? "line-through text-muted-foreground" : "text-foreground")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.deal_address && (
            <Link
              href={`/deals/${task.deal_id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              {task.deal_address}
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          )}
          <Badge
            variant={
              task.priority === "critical" ? "destructive" :
              task.priority === "high" ? "warning" : "secondary"
            }
            className="text-[10px]"
          >
            {task.priority}
          </Badge>
          <span className={cn("text-xs", overdue ? "text-red-400 font-medium" : "text-muted-foreground")}>
            <Calendar className="w-2.5 h-2.5 inline mr-0.5" />
            {overdue ? "Overdue · " : ""}{formatDate(task.due_date, "MMM d")}
          </span>
          {task.status === "blocked" && (
            <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
          )}
        </div>
      </div>
      {task.assigned_to_name && (
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarFallback className="text-[9px]">{generateInitials(task.assigned_to_name)}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

export function TasksContent() {
  const [search, setSearch] = useState("");

  const allTasks = MOCK_TASKS.filter(
    t => !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.deal_address?.toLowerCase().includes(search.toLowerCase())
  );

  const overdueTasks = allTasks.filter(t => isOverdue(t.due_date) && t.status !== "completed");
  const todayTasks = allTasks.filter(t => {
    const d = new Date(t.due_date);
    const now = new Date();
    return d.toDateString() === now.toDateString() && t.status !== "completed" && !isOverdue(t.due_date);
  });
  const upcomingTasks = allTasks.filter(t => {
    const d = new Date(t.due_date);
    const now = new Date();
    return d > now && t.status !== "completed" && !isOverdue(t.due_date);
  });
  const completedTasks = allTasks.filter(t => t.status === "completed");

  const sections = [
    { label: "Overdue", tasks: overdueTasks, color: "text-red-400", empty: "No overdue tasks" },
    { label: "Due Today", tasks: todayTasks, color: "text-amber-400", empty: "Nothing due today" },
    { label: "Upcoming", tasks: upcomingTasks, color: "text-foreground", empty: "No upcoming tasks" },
    { label: "Completed", tasks: completedTasks, color: "text-muted-foreground", empty: "No completed tasks" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-base font-semibold text-foreground">Tasks</h1>
          <Badge variant="secondary">{MOCK_TASKS.filter(t => t.status !== "completed").length} active</Badge>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            className="w-48 h-8 text-xs"
          />
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            AI Generate
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* AI Copilot Bar */}
      <div className="px-4 py-2 border-b border-border/50 flex-shrink-0">
        <CopilotBar
          message={`AI: ${overdueTasks.length} overdue task${overdueTasks.length !== 1 ? "s" : ""} — Generate priorities and suggested assignments`}
          prompt="Show me all overdue tasks and suggest how to prioritize and reassign them"
          variant="amber"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        {sections.map(section => (
          section.tasks.length > 0 && (
            <div key={section.label}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className={cn("text-xs font-semibold uppercase tracking-wide", section.color)}>
                  {section.label}
                </h2>
                <Badge variant="secondary" className="text-[10px]">{section.tasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {section.tasks.map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </div>
          )
        ))}

        {allTasks.length === 0 && (
          <div className="text-center py-20">
            <CheckSquare className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}

