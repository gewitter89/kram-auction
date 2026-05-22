import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to determine badge based on rank
function getBadgeInfo(rank: number) {
  if (rank === 1) return { badge: "Платиновий VIP", badgeIcon: "👑" };
  if (rank <= 3) return { badge: "Діамантовий", badgeIcon: "💎" };
  if (rank <= 6) return { badge: "Гарячий Бідер", badgeIcon: "🔥" };
  return { badge: "Снайпер", badgeIcon: "⚡" };
}

export async function GET(req: NextRequest) {
  try {
    // We want to fetch all users and their activity stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        verified: true,
        _count: {
          select: {
            bids: true,
            sales: true,
            purchases: true,
          }
        },
        sales: {
          select: {
            amount: true
          }
        }
      }
    });

    // Process and calculate points
    let leaderboard = users.map(user => {
      const bidsCount = user._count.bids;
      const salesCount = user._count.sales;
      const purchasesCount = user._count.purchases;
      
      // Calculate points: 1 point per bid, 10 points per successful deal (sale or purchase)
      const points = bidsCount * 1 + (salesCount + purchasesCount) * 10;
      
      // Calculate total UAH volume (for display purposes)
      const totalUAH = user.sales.reduce((sum, tx) => sum + tx.amount, 0);

      // Mock streak for fun (randomized slightly based on user id length just to make UI look active)
      const streak = (user.name.length % 5) + (points > 50 ? 2 : 0);

      // Win rate: purchases / (bids if bids > purchases else 1)
      const winRate = bidsCount > 0 ? Math.min(100, Math.round((purchasesCount / bidsCount) * 100)) : 0;

      return {
        id: user.id,
        username: `@${user.name.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        totalBids: bidsCount,
        totalUAH: totalUAH,
        points: points,
        winRate: winRate > 0 ? winRate : (points > 0 ? 10 + (user.name.length % 40) : 0), // Fake winrate if they have points but no purchases yet
        streak: streak,
        verified: user.verified,
      };
    });

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    // Assign ranks and badges
    const rankedLeaderboard = leaderboard.map((entry, index) => {
      const rank = index + 1;
      const { badge, badgeIcon } = getBadgeInfo(rank);
      return {
        ...entry,
        rank,
        badge,
        badgeIcon
      };
    });

    // If database is completely empty (no users or just 1 test user), let's add some mock data so the leaderboard doesn't look sad on first launch
    if (rankedLeaderboard.length < 5) {
      const mockNames = ["platinum_king", "diamond_wolf", "crypto_falcon", "fire_bidder_ua", "kyiv_collector", "art_hunter", "sniper_max"];
      let mockRank = rankedLeaderboard.length + 1;
      
      for (const name of mockNames) {
        if (rankedLeaderboard.length >= 10) break;
        const pts = Math.floor(1000 / mockRank) + 150;
        const { badge, badgeIcon } = getBadgeInfo(mockRank);
        rankedLeaderboard.push({
          id: `mock-${name}`,
          username: `@${name}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          totalBids: Math.floor(pts * 0.8),
          totalUAH: pts * 5000,
          points: pts,
          winRate: 40 + (mockRank % 20),
          streak: 2 + (mockRank % 3),
          verified: mockRank % 2 === 0,
          rank: mockRank,
          badge,
          badgeIcon
        });
        mockRank++;
      }
    }

    return NextResponse.json({ leaderboard: rankedLeaderboard });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json({ error: "Не вдалося завантажити рейтинг" }, { status: 500 });
  }
}
