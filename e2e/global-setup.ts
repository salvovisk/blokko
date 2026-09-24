import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

// Fresh database with the demo user + system templates for every run
export default function globalSetup() {
  const db = path.resolve('tests/.tmp/e2e.db');
  mkdirSync(path.dirname(db), { recursive: true });
  rmSync(db, { force: true });
  const env = { ...process.env, DATABASE_URL: `file:${db}` };
  execSync('npx prisma db push --skip-generate', { env, stdio: 'ignore' });
  execSync('npx tsx prisma/seed.ts', { env, stdio: 'ignore' });
}
