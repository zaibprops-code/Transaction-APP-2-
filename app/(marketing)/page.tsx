import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { AIShowcase } from "@/components/landing/ai-showcase";
import { WorkflowSection } from "@/components/landing/workflow";
import { EnterpriseSection } from "@/components/landing/enterprise";
import { CTASection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "CloseTrack — The AI Operating System for Real Estate Transactions",
  description:
    "Close more deals. Coordinate everything. AI does the rest. CloseTrack is the AI-native transaction coordination platform built for modern real estate teams.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AIShowcase />
        <WorkflowSection />
        <Testimonials />
        <Pricing />
        <EnterpriseSection />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
