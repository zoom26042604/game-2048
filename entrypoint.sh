#!/bin/sh
set -e

echo "Checking database initialization..."

# Check if database needs initialization (empty or missing tables)
DB_PATH="/app/data/game2048.db"
NEEDS_INIT=0

if [ ! -f "$DB_PATH" ]; then
  echo "Database file doesn't exist, will create..."
  NEEDS_INIT=1
else
  # Check if Player table exists
  TABLE_COUNT=$(sqlite3 "$DB_PATH" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='Player';" 2>/dev/null || echo "0")
  if [ "$TABLE_COUNT" = "0" ]; then
    echo "Database exists but tables are missing, will initialize..."
    NEEDS_INIT=1
  else
    echo "Database already initialized"
  fi
fi

if [ "$NEEDS_INIT" = "1" ]; then
  echo "Initializing database schema..."
  
  # Create database schema matching Prisma schema
  sqlite3 "$DB_PATH" << 'EOF'
-- Create Player table
CREATE TABLE IF NOT EXISTS Player (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create Score table
CREATE TABLE IF NOT EXISTS Score (
    id TEXT PRIMARY KEY,
    value INTEGER NOT NULL,
    maxTile INTEGER NOT NULL,
    moves INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    won INTEGER NOT NULL DEFAULT 0,
    playerId TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (playerId) REFERENCES Player(id) ON DELETE CASCADE
);

-- Create GameStats table
CREATE TABLE IF NOT EXISTS GameStats (
    id TEXT PRIMARY KEY DEFAULT 'global',
    totalGames INTEGER NOT NULL DEFAULT 0,
    totalScore INTEGER NOT NULL DEFAULT 0,
    highestScore INTEGER NOT NULL DEFAULT 0,
    highestTile INTEGER NOT NULL DEFAULT 0,
    totalWins INTEGER NOT NULL DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS Score_value_idx ON Score(value);
CREATE INDEX IF NOT EXISTS Score_playerId_idx ON Score(playerId);

-- Insert default GameStats record
INSERT OR IGNORE INTO GameStats (id) VALUES ('global');

EOF
  
  echo "Database schema created successfully!"
else
  echo "Skipping database initialization"
fi

echo "Starting Next.js server..."
# Start the application
exec node server.js
