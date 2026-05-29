import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-closetrack flex items-center justify-center shadow-glow-sm">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="5.5" x2="7" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.35"/>
              <line x1="2" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.65"/>
              <line x1="2" y1="12.5" x2="14" y2="12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="15.8" cy="12.5" r="1.7" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-foreground">CloseTrack</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CloseTrack Inc. ·{" "}
        <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
        {" · "}
        <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
