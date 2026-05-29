import { Metadata } from "next";
import { DealsBoard } from "@/components/deals/deals-board";

export const metadata: Metadata = { title: "Deals Pipeline" };

export default function DealsPage() {
  return <DealsBoard />;
}
