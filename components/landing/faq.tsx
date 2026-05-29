"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What makes Strata different from other TC software?",
    a: "Strata is built AI-first from the ground up. Unlike legacy tools that bolt on AI features, every workflow in Strata is designed around AI assistance — from deal health scoring to automated task generation, contract intelligence, and risk detection. We also offer a beautiful client portal and enterprise-grade multi-tenant architecture that scales from solo coordinators to large brokerages.",
  },
  {
    q: "How does the AI assistant work?",
    a: "Strata's AI assistant is context-aware across your entire portfolio. It understands your active deals, pending tasks, missing documents, and team capacity. You can ask it anything — 'What's at risk this week?', 'Draft a follow-up email for deal X', 'Which deals are likely to miss their closing date?' — and it gives you actionable answers and can take actions on your behalf.",
  },
  {
    q: "Can I migrate my existing transactions from other tools?",
    a: "Yes. Strata offers data import from CSV, as well as native integrations with popular TC platforms like Dotloop, SkySlope, and Glide. Our onboarding team will assist with migration for Growth and Enterprise plans at no additional cost.",
  },
  {
    q: "Is there a client portal included?",
    a: "Every plan includes access to the Strata client portal. Buyers and sellers get a beautiful, branded web experience where they can track deal progress, view and sign documents, and communicate with your team — all with passwordless login so there's no friction.",
  },
  {
    q: "How does e-signature work in Strata?",
    a: "Strata includes built-in e-signature capabilities with legal compliance (E-SIGN Act and UETA compliant). You can create signature requests directly from deals, set up multi-party signing workflows, track status in real-time, and access a full audit trail. Signatures are verified with email and IP tracking.",
  },
  {
    q: "Is Strata RESPA and compliance-ready?",
    a: "Strata is designed with compliance in mind. We maintain full audit logs of all actions, support role-based access controls, and provide data residency options for Enterprise customers. Our security practices align with SOC 2 Type II requirements.",
  },
  {
    q: "What happens after the 14-day trial?",
    a: "Your trial includes all Growth plan features. After 14 days, you can choose any plan that fits your needs — including Starter, Growth, or Enterprise. There's no automatic charge during the trial period, and you'll receive reminders before it ends.",
  },
  {
    q: "Can I use Strata for my entire brokerage?",
    a: "Absolutely. Strata's Enterprise plan is purpose-built for brokerages with custom pricing, SSO/SAML authentication, white-label client portals, custom API integrations, dedicated account management, and multi-office support. Contact our sales team to discuss your specific needs.",
  },
  {
    q: "How does team management work?",
    a: "Growth and Enterprise plans include team management with role-based permissions. You can create roles like Lead Coordinator, Junior Coordinator, Agent, Admin, and Client — each with custom access levels. Deals can be assigned to team members with visibility controls.",
  },
  {
    q: "What integrations does Strata support?",
    a: "Strata integrates with Google Calendar, Outlook, DocuSign (import only), Stripe for billing, Resend for email delivery, and offers a full REST API + webhooks for custom integrations. We're continuously adding new integrations based on customer demand.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions? <span className="text-gradient">We have answers.</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-0">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
