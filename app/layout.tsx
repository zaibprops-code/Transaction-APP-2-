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
    default: "CloseTrack — Close More Deals. Track Every Step.",
    template: "%s | CloseTrack",
  },
  description:
    "CloseTrack is the AI-native transaction coordination platform for modern real estate teams. Close more deals, track every step, and automate your entire workflow — at closetrack.co",
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
  authors: [{ name: "CloseTrack Inc." }],
  creator: "CloseTrack Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://closetrack.co",
    title: "CloseTrack — Close More Deals. Track Every Step.",
    description:
      "The AI-native transaction coordination platform. Close more deals, track every step, automate the rest.",
    siteName: "CloseTrack",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CloseTrack — AI Transaction Coordination Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloseTrack — Close More Deals. Track Every Step.",
    description:
      "The AI-native transaction coordination platform. Close more deals, track every step.",
    images: ["/og-image.png"],
    creator: "@closetrack",
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
    process.env.NEXT_PUBLIC_APP_URL || "https://closetrack.co"
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
    <html lang="en" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('closetrack-theme');var d=document.documentElement;var r=t==='light'?'light':t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):'dark';d.setAttribute('data-theme',r);if(r==='dark'){d.classList.add('dark');d.classList.remove('light');}else{d.classList.add('light');d.classList.remove('dark');}}catch(e){}})();`,
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
