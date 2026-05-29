import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { FAQ } from "@/components/landing/faq";

export const metadata: Metadata = {
  title: "Pricing — CloseTrack",
  description: "Simple, transparent pricing for teams of all sizes.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
