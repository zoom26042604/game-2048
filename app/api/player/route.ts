import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get('name');

    if (!playerName) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { name: playerName },
      include: {
        scores: {
          orderBy: { value: 'desc' },
          take: 10,
        },
      },
    });

    if (!player) {
      return NextResponse.json({
        exists: false,
        player: null,
      });
    }

    const bestScore = player.scores[0]?.value || 0;
    const totalGames = player.scores.length;
    const wins = player.scores.filter(s => s.won).length;

    return NextResponse.json({
      exists: true,
      player: {
        id: player.id,
        name: player.name,
        bestScore,
        totalGames,
        wins,
        winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
        recentScores: player.scores.map(s => ({
          score: s.value,
          maxTile: s.maxTile,
          moves: s.moves,
          duration: s.duration,
          won: s.won,
          date: s.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}
