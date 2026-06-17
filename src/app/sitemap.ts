import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://kram-auction.vercel.app";

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${base}/catalog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${base}/sell`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/leaderboard`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/info/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/info/rules`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/info/safety`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/info/delivery`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/info/payment`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  let lotPages: MetadataRoute.Sitemap = [];
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
    lotPages = listings.map((l) => ({
      url: `${base}/lot/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not available — return static only
  }

  return [...staticPages, ...lotPages];
}
