import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "KRAM Marketplace — Преміальний Маркетплейс та Аукціони",
  description: "Елітна гібридна платформа: класичні оголошення, відкриті аукціони, безпечні угоди та вбудована інтеграція з Новою Поштою.",
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
    <html lang="uk" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
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
