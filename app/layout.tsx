import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Strata — The AI Operating System for Real Estate Transactions",
    template: "%s | Strata",
  },
  description:
    "Strata is the AI-native transaction coordination platform built for modern real estate teams. Automate workflows, close deals faster, and eliminate missed deadlines — all in one intelligent operating system.",
  keywords: [
    "transaction coordination",
    "real estate software",
    "TC software",
    "closing management",
    "real estate AI",
    "deal management",
    "workflow automation",
    "e-signature",
    "real estate operations",
  ],
  authors: [{ name: "Strata Inc." }],
  creator: "Strata Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getstrata.io",
    title: "Strata — The AI Operating System for Real Estate Transactions",
    description:
      "Close more deals. Coordinate everything. AI does the rest. The modern TC platform for elite real estate teams.",
    siteName: "Strata",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Strata — AI Transaction Coordination Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Strata — The AI Operating System for Real Estate Transactions",
    description:
      "Close more deals. Coordinate everything. AI does the rest.",
    images: ["/og-image.png"],
    creator: "@getstrata",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://getstrata.io"
  ),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0F" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
