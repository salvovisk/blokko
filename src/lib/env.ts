/**
 * Environment variable validation
 * Validates required environment variables at application startup
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
] as const;

const optionalEnvVars = [
  'NODE_ENV',
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

interface ValidatedEnv {
  DATABASE_URL: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  NODE_ENV: string;
}

/**
 * Validate environment variables
 * Throws an error if required variables are missing
 */
export function validateEnv(): ValidatedEnv {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate NEXTAUTH_SECRET length
  const secret = process.env.NEXTAUTH_SECRET!;
  if (secret.length < 32) {
    throw new Error(
      'NEXTAUTH_SECRET must be at least 32 characters long.\n' +
      'Generate a secure secret with: openssl rand -base64 32'
    );
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl.startsWith('file:') && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    throw new Error(
      'DATABASE_URL must be a valid database connection string.\n' +
      'Examples:\n' +
      '  - SQLite: file:./dev.db\n' +
      '  - PostgreSQL: postgresql://user:password@localhost:5432/dbname'
    );
  }

  // Validate NEXTAUTH_URL format
  const authUrl = process.env.NEXTAUTH_URL!;
  try {
    new URL(authUrl);
  } catch {
    throw new Error(
      'NEXTAUTH_URL must be a valid URL.\n' +
      'Examples:\n' +
      '  - Development: http://localhost:3000\n' +
      '  - Production: https://yourdomain.com'
    );
  }

  // Warn about insecure development secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (secret.includes('dev-secret') || secret.includes('development')) {
      console.warn(
        '\n⚠️  WARNING: Using a development secret in production!\n' +
        'Generate a secure secret with: openssl rand -base64 32\n'
      );
    }
  }

  return {
    DATABASE_URL: dbUrl,
    NEXTAUTH_URL: authUrl,
    NEXTAUTH_SECRET: secret,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

// Validate on module load
let env: ValidatedEnv;
try {
  env = validateEnv();
} catch (error) {
  console.error('\n❌ Environment validation failed:\n');
  console.error(error instanceof Error ? error.message : String(error));
  console.error('\nApplication cannot start without valid environment configuration.\n');
  process.exit(1);
}

export { env };
