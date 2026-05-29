import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_DEALS } from "@/lib/mock-data";
import { DealWorkspace } from "@/components/deals/deal-workspace";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const deal = MOCK_DEALS.find(d => d.id === id);
  return { title: deal ? `${deal.address} — Deal` : "Deal" };
}

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const deal = MOCK_DEALS.find(d => d.id === id);
  if (!deal) notFound();
  return <DealWorkspace deal={deal} />;
}
