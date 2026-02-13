# BLOKKO

A professional quote builder that uses configurable blocks. Build professional quotes block by block with Swiss precision design.

## Features

- ✅ Drag & drop quote builder
- ✅ Block system (Header, Prices, Text, Terms)
- ✅ PDF export functionality
- ✅ Template system with system templates
- ✅ User authentication (NextAuth)
- ✅ Bilingual support (English/Italian)
- ✅ Swiss brutalist design system
- ✅ Security hardening (CSRF, rate limiting, input validation)
- ✅ Auto-save functionality

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 18, Material-UI, TypeScript
- **State Management**: Zustand
- **Database**: SQLite (development), PostgreSQL (production recommended for scale)
- **ORM**: Prisma
- **Authentication**: NextAuth (JWT sessions, bcryptjs)
- **PDF Generation**: jsPDF
- **Security**: CSRF protection, Zod validation, rate limiting

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd blokko

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:push

# Seed demo data (optional)
npm run db:seed

# Start development server
npm run dev
```

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint (next lint)
npm run db:push      # Sync Prisma schema to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed demo data (tsx prisma/seed.ts)
```

### Environment Variables

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. See `.env.example`.

## Production Deployment

### Prerequisites
- Docker and Docker Compose
- Domain with SSL certificate
- Nginx (for reverse proxy)

### Quick Deploy

1. **Clone and setup**:
   ```bash
   git clone <repo-url>
   cd blokko
   git checkout auth-enabled
   ```

2. **Configure environment**:
   ```bash
   cp .env.production.example .env.production
   # Edit with production values:
   # - NEXTAUTH_URL (your domain)
   # - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
   ```

3. **Build and run**:
   ```bash
   docker-compose --env-file .env.production up -d --build
   ```

4. **Initialize database**:
   ```bash
   docker-compose exec blokko npx prisma db push
   docker-compose exec blokko npm run db:seed  # Optional: demo templates
   ```

See [PRODUCTION-DEPLOY.md](./PRODUCTION-DEPLOY.md) for detailed deployment guide.

## Project Structure

```
blokko/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages (login, register)
│   │   ├── (dashboard)/         # Protected pages
│   │   │   ├── builder/         # Quote builder
│   │   │   ├── dashboard/       # Dashboard
│   │   │   ├── quotes/          # Quotes list
│   │   │   ├── settings/        # User settings
│   │   │   └── templates/       # Templates
│   │   └── api/                 # API routes
│   │       ├── auth/            # NextAuth + registration
│   │       ├── csrf/            # CSRF token
│   │       ├── health/          # Health check
│   │       ├── quotes/          # Quotes CRUD
│   │       └── templates/       # Templates CRUD
│   ├── components/
│   │   ├── blocks/              # Block components
│   │   ├── landing/             # Landing page
│   │   ├── logo/                # Logo component
│   │   └── ui/                  # UI components
│   ├── contexts/
│   │   └── LanguageContext.tsx  # i18n context
│   ├── i18n/                    # Translations (en/it)
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config
│   │   ├── logger.ts            # Logging utility
│   │   ├── prisma.ts            # Prisma client
│   │   ├── theme.ts             # MUI theme
│   │   └── validations.ts       # Zod schemas
│   ├── stores/
│   │   └── builder-store.ts     # Zustand store
│   ├── styles/                  # Global styles
│   └── types/                   # TypeScript types
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed script
├── middleware.ts                # Rate limiting, auth, security
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # Docker build
└── next.config.js              # Next.js config
```

## Security Features

- ✅ CSRF protection for all mutations
- ✅ Rate limiting (30 req/min per IP)
- ✅ Comprehensive input validation (Zod schemas)
- ✅ Bot blocking (malicious user agents)
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Strong password requirements (8+ chars, complexity)
- ✅ Email normalization (case-insensitive)
- ✅ Session timeout (7 days with refresh)
- ✅ Database indexes for performance
- ✅ Structured logging with sensitive data sanitization

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Developer guidance for Claude Code
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment best practices
- [DOCKER.md](./DOCKER.md) - Docker deployment guide
- [PRODUCTION-DEPLOY.md](./PRODUCTION-DEPLOY.md) - Comprehensive production deployment
- [SECURITY-IMPROVEMENTS.md](./SECURITY-IMPROVEMENTS.md) - Security documentation
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - API changes documentation

## License

MIT
