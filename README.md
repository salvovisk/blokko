# BLOKKO

**Status**: 🚧 Pre-Launch Landing Page

A professional quote builder that uses configurable blocks. Build professional quotes block by block with Swiss precision design.

## Current Version

This repository contains the **pre-launch landing page** for BLOKKO. The full quote builder application is under development.

### What's Live

- ✅ Landing page with interactive block demo
- ✅ Bilingual support (English/Italian)
- ✅ Swiss brutalist design system
- ✅ Production-ready deployment
- ✅ Security hardening (rate limiting, bot blocking, security headers)

### Coming Soon

- 🔜 Full drag & drop quote builder
- 🔜 Block system (Header, Prices, Text, Terms)
- 🔜 PDF export functionality
- 🔜 Template system
- 🔜 User authentication
- 🔜 Database integration

## Tech Stack

**Current (Landing Page):**
- Next.js 16 (App Router)
- React 18
- Material-UI (Theme/Typography)
- TypeScript

**Future (Full App):**
- PostgreSQL database
- Prisma ORM
- NextAuth authentication
- PDF generation
- Drag & drop system

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

For the landing page, no environment variables are required. See `.env.example` for future configuration when the full app launches.

## Project Structure

```
preventivo-builder/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── api/health/         # Health check endpoint
│   ├── components/
│   │   ├── landing/            # BlockDemo component
│   │   ├── logo/               # BlokkoLogo component
│   │   ├── ui/                 # Theme & providers
│   │   └── LanguageSwitcher.tsx
│   ├── contexts/
│   │   └── LanguageContext.tsx # i18n context
│   ├── i18n/                   # Translations (en/it)
│   ├── lib/
│   │   └── theme.ts            # MUI theme config
│   └── styles/                 # Global styles
├── middleware.ts               # Security & route protection
├── next.config.js             # Next.js configuration
└── public/                    # Static assets
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for security features and deployment instructions.

### Quick Deploy

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Cloudflare Pages:**
```bash
npx wrangler pages deploy .next
```

## Security Features

- ✅ Rate limiting (30 req/min per IP)
- ✅ Bot blocking (scrapers, malicious crawlers)
- ✅ Route protection (only `/` and `/_next/*` allowed)
- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Health check endpoint (`/api/health`)

## License

MIT
