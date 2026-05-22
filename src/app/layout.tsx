import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "KRAM.UA — Premium Dark Marketplace",
  description: "Premium dark marketplace and auctions with Google login, demo mode, safe deals and live bidding.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KRAM.UA",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#030712" />
        <meta name="x-kram-design" content="premium-dark-2233cc8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KRAM.UA" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full bg-[#030712] text-[#f3f4f6] flex flex-col selection:bg-brand-primary selection:text-dark-bg font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
