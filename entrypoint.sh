#!/bin/sh
set -e

echo "⏳ Waiting for MySQL to be ready..."
until node -e "
const { createPool } = require('mariadb');
const pool = createPool('$DATABASE_URL');
pool.getConnection().then(c => { c.release(); pool.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
  echo "   MySQL not ready yet, retrying..."
done
echo "✅ MySQL is ready!"

echo "🔄 Running database migrations..."
npx prisma db push --skip-generate

echo "🚀 Starting Next.js..."
exec node_modules/.bin/next start -p 3000
