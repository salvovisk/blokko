import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

// Fresh SQLite database for every test run
export default function setup() {
  const dir = path.resolve(__dirname, '../.tmp');
  mkdirSync(dir, { recursive: true });
  rmSync(path.join(dir, 'test.db'), { force: true });
  execSync('npx prisma db push --skip-generate', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: `file:${path.join(dir, 'test.db')}` },
  });
}
