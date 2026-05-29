import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "My Transaction — CloseTrack",
    template: "%s | CloseTrack",
  },
  description: "Your secure transaction portal powered by CloseTrack.",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
