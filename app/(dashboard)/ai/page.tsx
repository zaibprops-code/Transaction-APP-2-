import { Metadata } from "next";
import { AIAssistant } from "@/components/ai/ai-assistant";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AIPage() {
  return (
    <div className="h-full flex flex-col">
      <AIAssistant />
    </div>
  );
}
