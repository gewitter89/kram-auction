import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "KRAM Marketplace — Премиальный Маркетплейс и Аукционы",
  description: "Элитная гибридная площадка: классические объявления, открытые аукционы, безопасные сделки и встроенная интеграция с Новой Почтой.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased scroll-smooth">
      <body className="min-h-full bg-[#030712] text-[#f3f4f6] flex flex-col selection:bg-brand-primary selection:text-dark-bg font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
