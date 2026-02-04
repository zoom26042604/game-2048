import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestPlayers() {
  const testNames = ['test', 'test1', 'test2'];
  
  for (const name of testNames) {
    const player = await prisma.player.findUnique({ where: { name } });
    if (player) {
      await prisma.score.deleteMany({ where: { playerId: player.id } });
      await prisma.player.delete({ where: { id: player.id } });
      console.log('🗑️  Deleted player:', name);
    }
  }
  
  const remaining = await prisma.player.findMany({ include: { scores: true } });
  console.log('\n📊 Remaining players:');
  remaining.forEach(p => console.log('  -', p.name, ':', p.scores[0]?.value || 'no score'));
  
  await prisma.$disconnect();
}

deleteTestPlayers();
