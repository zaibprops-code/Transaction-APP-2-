import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { FloatingAssistant } from "@/components/ai/floating-assistant";
import { AINotifications } from "@/components/ai/ai-notifications";
import { isDemo } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = isDemo();

  return (
    <ThemeProvider>
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {demo && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-400 text-center flex-shrink-0">
            Demo mode — showing sample data. Add Supabase credentials to connect your real data.
          </div>
        )}

        {children}
      </div>

      <MobileNav />

      {/* AI Floating Assistant */}
      <FloatingAssistant />
      <AINotifications />
    </div>
    </ThemeProvider>
  );
}
