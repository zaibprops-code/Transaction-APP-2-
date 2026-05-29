import { Metadata } from "next";
import { TasksContent } from "@/components/tasks/tasks-content";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return <TasksContent />;
}
