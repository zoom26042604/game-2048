import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.gameStats.findUnique({
      where: { id: 'global' },
    });

    if (!stats) {
      return NextResponse.json({
        totalGames: 0,
        averageScore: 0,
        highestScore: 0,
        highestTile: 0,
        totalWins: 0,
        winRate: 0,
      });
    }

    const averageScore = stats.totalGames > 0 
      ? Math.round(Number(stats.totalScore) / stats.totalGames) 
      : 0;

    const winRate = stats.totalGames > 0 
      ? Math.round((stats.totalWins / stats.totalGames) * 100) 
      : 0;

    return NextResponse.json({
      totalGames: stats.totalGames,
      averageScore,
      highestScore: stats.highestScore,
      highestTile: stats.highestTile,
      totalWins: stats.totalWins,
      winRate,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
