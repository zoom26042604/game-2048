import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CORS headers for cross-origin requests (portfolio)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const bestOnly = searchParams.get('bestOnly') === 'true';

    let leaderboard;
    let total;

    if (bestOnly) {
      // Get only the best score per player using raw query
      const bestScores = await prisma.$queryRaw<Array<{
        id: string;
        value: number;
        maxTile: number;
        moves: number;
        duration: number;
        won: boolean;
        createdAt: Date;
        playerName: string;
      }>>`
        SELECT s.id, s.value, s.maxTile, s.moves, s.duration, s.won, s.createdAt, p.name as playerName
        FROM Score s
        INNER JOIN Player p ON s.playerId = p.id
        WHERE s.value = (
          SELECT MAX(s2.value) FROM Score s2 WHERE s2.playerId = s.playerId
        )
        GROUP BY s.playerId
        ORDER BY s.value DESC
        LIMIT ${limit} OFFSET ${skip}
      `;

      const totalResult = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT playerId) as count FROM Score
      `;
      total = Number(totalResult[0]?.count || 0);

      leaderboard = bestScores.map((score, index) => ({
        rank: skip + index + 1,
        playerName: score.playerName,
        score: score.value,
        maxTile: score.maxTile,
        moves: score.moves,
        duration: score.duration,
        won: Boolean(score.won),
        date: score.createdAt,
      }));
    } else {
      // Original behavior: all scores
      const [scores, count] = await Promise.all([
        prisma.score.findMany({
          take: limit,
          skip,
          orderBy: { value: 'desc' },
          include: {
            player: {
              select: { name: true },
            },
          },
        }),
        prisma.score.count(),
      ]);

      total = count;
      leaderboard = scores.map((score, index) => ({
        rank: skip + index + 1,
        playerName: score.player.name,
        score: score.value,
        maxTile: score.maxTile,
        moves: score.moves,
        duration: score.duration,
        won: score.won,
        date: score.createdAt,
      }));
    }

    return NextResponse.json({
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, score, maxTile, moves, duration, won } = body;

    if (!playerName || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Player name and score are required' },
        { status: 400 }
      );
    }

    // Find or create player
    let player = await prisma.player.findUnique({
      where: { name: playerName },
    });

    if (!player) {
      player = await prisma.player.create({
        data: { name: playerName },
      });
    }

    // Check if this score is better than the player's current best
    const currentBest = await prisma.score.findFirst({
      where: { playerId: player.id },
      orderBy: { value: 'desc' },
    });

    // If player already has a better or equal score, don't save
    if (currentBest && currentBest.value >= score) {
      // Get rank based on best scores
      const rankResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM (
          SELECT MAX(value) as bestScore FROM Score GROUP BY playerId
        ) AS best WHERE best.bestScore > ${currentBest.value}
      `;
      const rank = Number(rankResult[0]?.count || 0) + 1;

      return NextResponse.json({
        success: true,
        rank,
        scoreId: currentBest.id,
        message: 'Score not saved - not higher than your best',
        isNewBest: false,
      }, { headers: corsHeaders });
    }

    // Delete player's old scores since this one is better
    if (currentBest) {
      await prisma.score.deleteMany({
        where: { playerId: player.id },
      });
    }

    // Create the new best score entry
    const newScore = await prisma.score.create({
      data: {
        value: score,
        maxTile: maxTile || 0,
        moves: moves || 0,
        duration: duration || 0,
        won: won || false,
        playerId: player.id,
      },
    });

    // Update global stats
    await prisma.gameStats.upsert({
      where: { id: 'global' },
      create: {
        id: 'global',
        totalGames: 1,
        totalScore: BigInt(score),
        highestScore: score,
        highestTile: maxTile || 0,
        totalWins: won ? 1 : 0,
      },
      update: {
        totalGames: { increment: 1 },
        totalScore: { increment: score },
        highestScore: score > 0 ? { increment: 0 } : undefined,
        totalWins: won ? { increment: 1 } : undefined,
      },
    });

    // Get rank - count only best scores per player that are higher
    const rankResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM (
        SELECT MAX(value) as bestScore FROM Score GROUP BY playerId
      ) AS best WHERE best.bestScore > ${score}
    `;
    const rank = Number(rankResult[0]?.count || 0) + 1;

    return NextResponse.json({
      success: true,
      rank,
      scoreId: newScore.id,
      isNewBest: true,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500, headers: corsHeaders }
    );
  }
}
