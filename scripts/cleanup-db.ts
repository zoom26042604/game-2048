import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  // Get all players
  const players = await prisma.player.findMany();
  console.log(`Found ${players.length} players\n`);

  let deletedScores = 0;
  let keptScores = 0;

  for (const player of players) {
    // Get all scores for this player, ordered by value descending
    const scores = await prisma.score.findMany({
      where: { playerId: player.id },
      orderBy: { value: 'desc' },
    });

    if (scores.length === 0) {
      // Player has no scores, delete the player
      await prisma.player.delete({ where: { id: player.id } });
      console.log(`🗑️  Deleted player "${player.name}" (no scores)`);
      continue;
    }

    // Keep only the best score (first one after ordering)
    const bestScore = scores[0];
    const scoresToDelete = scores.slice(1);

    if (scoresToDelete.length > 0) {
      await prisma.score.deleteMany({
        where: {
          id: { in: scoresToDelete.map(s => s.id) },
        },
      });
      deletedScores += scoresToDelete.length;
    }

    keptScores++;
    console.log(`✅ ${player.name}: kept best score ${bestScore.value}, deleted ${scoresToDelete.length} lower scores`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Cleanup complete!`);
  console.log(`   - Kept: ${keptScores} best scores`);
  console.log(`   - Deleted: ${deletedScores} duplicate/lower scores`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

cleanupDatabase().catch((e) => {
  console.error('Error during cleanup:', e);
  prisma.$disconnect();
  process.exit(1);
});
