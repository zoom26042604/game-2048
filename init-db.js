#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || '/app/data/game2048.db';
const dbDir = path.dirname(DB_PATH);

console.log('Prisma database initialization');
console.log('Database path:', DB_PATH);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  console.log('Creating database directory...');
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create Prisma client
const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    
    // Check if Player table exists
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='Player'`;
    
    if (tables.length === 0) {
      console.log('Creating database tables with Prisma-compatible schema...');
      
      // Create tables using SQL that Prisma expects
      // For SQLite, DateTime is stored as BIGINT (Unix timestamp in milliseconds)
      // Note: BIGINT is required because JavaScript timestamps can exceed INT range
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Player (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL UNIQUE,
          createdAt BIGINT NOT NULL,
          updatedAt BIGINT NOT NULL
        )
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Score (
          id TEXT PRIMARY KEY NOT NULL,
          value INTEGER NOT NULL,
          maxTile INTEGER NOT NULL,
          moves INTEGER NOT NULL,
          duration INTEGER NOT NULL,
          won INTEGER NOT NULL DEFAULT 0,
          playerId TEXT NOT NULL,
          createdAt BIGINT NOT NULL,
          FOREIGN KEY (playerId) REFERENCES Player(id) ON DELETE CASCADE
        )
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS GameStats (
          id TEXT PRIMARY KEY NOT NULL DEFAULT 'global',
          totalGames INTEGER NOT NULL DEFAULT 0,
          totalScore INTEGER NOT NULL DEFAULT 0,
          highestScore INTEGER NOT NULL DEFAULT 0,
          highestTile INTEGER NOT NULL DEFAULT 0,
          totalWins INTEGER NOT NULL DEFAULT 0
        )
      `);
      
      // Create indexes
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Score_value_idx ON Score(value)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS Score_playerId_idx ON Score(playerId)`);
      
      console.log('✓ Database tables created');
    } else {
      console.log('✓ Database tables already exist');
    }
    
    // Ensure GameStats record exists
    const stats = await prisma.gameStats.findUnique({
      where: { id: 'global' }
    }).catch(() => null);
    
    if (!stats) {
      console.log('Creating default GameStats...');
      await prisma.gameStats.create({
        data: {
          id: 'global',
        }
      });
    }
    
    console.log('✓ Database initialized successfully');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error initializing database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

initializeDatabase();
