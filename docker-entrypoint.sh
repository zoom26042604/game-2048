#!/bin/sh
set -e

echo "🔄 Initializing Prisma..."
bunx prisma generate
bunx prisma db push --skip-generate

echo "✅ Prisma initialized successfully"
echo "🚀 Starting application..."
exec node server.js
