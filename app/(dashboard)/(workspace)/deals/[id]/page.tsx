"use client";

import { use, useEffect, useState } from "react";
import { DealWorkspace } from "@/components/deals/deal-workspace";
import { Loader2, ArrowLeft, PackageOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Deal } from "@/types";

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json() as { deal: Deal };
        setDeal(data.deal);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !deal) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <PackageOpen className="w-12 h-12 text-muted-foreground/30" />
        <div>
          <p className="text-base font-semibold text-foreground">Deal not found</p>
          <p className="text-sm text-muted-foreground mt-1">This deal may have been removed or does not exist.</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/deals">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Deals
          </Link>
        </Button>
      </div>
    );
  }

  return <DealWorkspace deal={deal} />;
}
