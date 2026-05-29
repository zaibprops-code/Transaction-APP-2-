import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const footerLinks = {
  Product: ["Features", "Pricing", "Security", "Changelog", "Roadmap"],
  Solutions: ["Transaction Coordinators", "Real Estate Agents", "Brokerages", "Enterprise"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-closetrack flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="2" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.35"/>
              <line x1="2" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.65"/>
              <line x1="2" y1="12.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="15.8" cy="12.5" r="1.7" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-foreground">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The AI operating system for modern real estate transaction coordination.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CloseTrack Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>SOC 2 Type II</span>
            <span>·</span>
            <span>GDPR Compliant</span>
            <span>·</span>
            <span>E-SIGN Act</span>
            <span>·</span>
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
