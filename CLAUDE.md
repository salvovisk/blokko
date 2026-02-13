# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BLOKKO is a quote builder application built with Next.js 16 (App Router), Material-UI, Zustand, Prisma (PostgreSQL), and NextAuth. It features a drag-and-drop block-based editor for creating professional quotes, with bilingual support (English/Italian).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint (next lint)
npm run db:push      # Sync Prisma schema to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed demo data (tsx prisma/seed.ts)
```

After installing dependencies, `prisma generate` runs automatically via the `postinstall` script.

## Environment Variables

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. See `.env.example`.

## Architecture

### Routing

Next.js App Router with route groups:
- `(auth)` — login/register pages
- `(dashboard)` — protected pages (builder, quotes, templates, settings, dashboard)
- `api/` — auth (NextAuth + registration), quotes CRUD, health check

### State Management

Zustand store at `src/stores/builder-store.ts` manages all builder state: blocks, active block, quote metadata, and auto-save (1-second debounce with visual save-state feedback: idle/saving/saved/error).

### Block System

Four block types: `HEADER`, `PRICES`, `TEXT`, `TERMS`. Each has a dedicated component in `src/components/blocks/` with inline editing and auto-save. Type definitions are in `src/types/blocks.ts`.

### Design System

Swiss brutalist aesthetic defined in `src/styles/swiss-theme.ts` — monochromatic palette, bold 3px borders, uppercase typography, no rounded corners. MUI theme in `src/lib/theme.ts`.

### i18n

Context-based (`src/contexts/LanguageContext.tsx`) with JSON translation files in `src/i18n/`. Auto-detects browser language, persists to localStorage key `blokko-locale`.

### Auth

NextAuth with credentials provider, JWT sessions, bcryptjs password hashing. Config in `src/lib/auth.ts`.

### Middleware

`middleware.ts` at project root handles rate limiting (30 req/min per IP), bot blocking, route protection, and security headers.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
