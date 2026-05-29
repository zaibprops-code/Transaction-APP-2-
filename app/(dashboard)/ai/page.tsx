import { Metadata } from "next";
import { AIAssistantContent } from "@/components/ai/ai-assistant";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AIPage() {
  return <AIAssistantContent />;
}
