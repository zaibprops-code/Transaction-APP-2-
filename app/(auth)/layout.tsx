import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-strata flex items-center justify-center shadow-glow-sm">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15.5 6V12L9 16L2.5 12V6L9 2Z" fill="white" fillOpacity="0.9" />
              <path d="M9 6L12.5 8V12L9 14L5.5 12V8L9 6Z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="font-bold text-foreground">Strata</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Strata Inc. ·{" "}
        <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
        {" · "}
        <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
