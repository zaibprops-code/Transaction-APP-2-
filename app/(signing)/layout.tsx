import type { ReactNode } from "react";

export default function SigningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
