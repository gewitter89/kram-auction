import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getBadgeInfo(rank: number) {
  if (rank === 1) return { badge: "Активний учасник", badgeIcon: "🌟" };
  if (rank <= 3) return { badge: "Надійний профіль", badgeIcon: "✅" };
  if (rank <= 6) return { badge: "Корисний учасник", badgeIcon: "🤝" };
  return { badge: "Учасник спільноти", badgeIcon: "•" };
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        verified: true,
        _count: { select: { bids: true, listings: true } },
      },
    });

    const leaderboard = users
      .map((user) => {
        const points = user._count.bids + user._count.listings * 3;
        return {
          id: user.id,
          username: `@${user.name.toLowerCase().replace(/\s+/g, "_")}`,
          avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
          totalBids: user._count.bids,
          totalLots: user._count.listings,
          points,
          verified: user.verified,
        };
      })
      .filter((u) => u.points > 0)
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => {
        const rank = index + 1;
        return { ...entry, rank, ...getBadgeInfo(rank) };
      });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.warn("Leaderboard DB unavailable; returning empty real state:", error);
    return NextResponse.json({ leaderboard: [], source: "empty-no-database" });
  }
}
