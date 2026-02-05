#!/bin/sh
set -e

echo "Initializing database with Node script..."
node /app/init-db.js

echo "Starting Next.js server..."
# Start the application (already running as nextjs user via Dockerfile USER directive)
exec node server.js
