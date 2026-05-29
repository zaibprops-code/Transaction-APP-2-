import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "My Transaction — CloseTrack",
    template: "%s | CloseTrack",
  },
  description: "Your secure transaction portal powered by CloseTrack.",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
