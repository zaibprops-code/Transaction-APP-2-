"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Sparkles,
  Search,
  Calendar,
  ArrowRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  formatDate,
  isOverdue,
  generateInitials,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CopilotBar } from "@/components/ai/copilot-bar";
import { toast } from "sonner";
import type { Task, TaskPriority } from "@/types";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

interface AddTaskForm {
  title: string;
  due_date: string;
  priority: TaskPriority;
  description: string;
}

const DEFAULT_TASK_FORM: AddTaskForm = {
  title: "",
  due_date: "",
  priority: "medium",
  description: "",
};

function AddTaskDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<AddTaskForm>(DEFAULT_TASK_FORM);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof AddTaskForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!form.due_date) {
      toast.error("Due date is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          due_date: form.due_date,
          priority: form.priority,
          description: form.description || undefined,
          status: "pending",
        }),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to create task");
      }
      toast.success("Task created");
      setForm(DEFAULT_TASK_FORM);
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Order title search"
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                required
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Additional details..."
              rows={2}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {submitting ? "Creating..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow({
  task,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, done: boolean) => void;
}) {
  const [done, setDone] = useState(task.status === "completed");
  const [deleting, setDeleting] = useState(false);
  const overdue = isOverdue(task.due_date) && !done;
  const previousDone = useRef(task.status === "completed");

  async function handleCheck(checked: boolean) {
    const previous = done;
    setDone(checked);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: checked ? "completed" : "pending" }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      onStatusChange(task.id, checked);
      previousDone.current = checked;
    } catch {
      setDone(previous);
      toast.error("Failed to update task");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      toast.success("Task deleted");
      onDelete(task.id);
    } catch {
      setDeleting(false);
      toast.error("Failed to delete task");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border transition-all group",
        done ? "opacity-50 bg-surface/30 border-border/50" : "bg-card border-border hover:border-indigo-500/20"
      )}
    >
      <input
        type="checkbox"
        checked={done}
        onChange={e => handleCheck(e.target.checked)}
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
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
        title="Delete task"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </motion.div>
  );
}

export function TasksContent() {
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const json = await res.json() as { tasks: Task[] };
        setTasks(json.tasks ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleStatusChange(id: string, done: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: done ? "completed" : "pending" } : t
      )
    );
  }

  const allTasks = tasks.filter(
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
          <Badge variant="secondary">{tasks.filter(t => t.status !== "completed").length} active</Badge>
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
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowAddTask(true)}>
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 && !search ? (
          <div className="text-center py-20">
            <CheckSquare className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-base font-semibold text-foreground mb-1">No tasks yet</p>
            <p className="text-sm text-muted-foreground mb-4">Add tasks to track what needs to get done across your deals.</p>
            <Button size="sm" className="gap-1.5" onClick={() => setShowAddTask(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add your first task
            </Button>
          </div>
        ) : (
          <>
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
                      <TaskRow
                        key={task.id}
                        task={task}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
            {allTasks.length === 0 && search && (
              <div className="text-center py-20">
                <CheckSquare className="w-10 h-10 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No tasks match &quot;{search}&quot;</p>
              </div>
            )}
          </>
        )}
      </div>

      <AddTaskDialog
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        onCreated={fetchTasks}
      />
    </div>
  );
}
