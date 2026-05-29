import { Metadata } from "next";
import { AnalyticsContent } from "@/components/charts/analytics-content";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
