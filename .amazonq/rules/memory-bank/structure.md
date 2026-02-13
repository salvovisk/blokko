# Project Structure

## Directory Organization

```
blokko/
├── prisma/              # Database layer
│   ├── schema.prisma   # Database schema definition
│   └── seed.ts         # Database seeding script
├── src/
│   ├── app/            # Next.js App Router (pages & API)
│   ├── components/     # React components
│   ├── stores/         # State management
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   ├── types/          # TypeScript type definitions
│   └── middleware.ts   # Next.js middleware for auth
└── public/             # Static assets
```

## Core Directories Explained

### `/prisma` - Database Layer

- **schema.prisma**: Defines database models (User, Quote, QuoteBlock, Template, TemplateBlock)
- **seed.ts**: Populates database with initial templates and demo user
- Manages PostgreSQL schema with Prisma ORM

### `/src/app` - Next.js App Router

- **(auth)/**: Authentication pages (login, register) with route grouping
- **(dashboard)/**: Protected dashboard pages (quotes, templates, settings)
- **api/**: Backend API routes for data operations
  - `auth/[...nextauth]/`: NextAuth.js authentication endpoints
  - `auth/register/`: User registration endpoint
- **layout.tsx**: Root layout with providers
- **page.tsx**: Landing/home page

### `/src/components` - React Components

- **blocks/**: Quote block components (HeaderBlock, PriceTableBlock, TextBlock, TermsBlock)
- **builder/**: Drag-and-drop builder components (BuilderCanvas, BuilderToolbar, BlockWrapper)
- **editors/**: Rich text and specialized editors
- **pdf/**: PDF generation components using @react-pdf/renderer
- **templates/**: Template selection and management UI
- **ui/**: Shared UI components (Providers, ThemeRegistry)

### `/src/stores` - State Management

- **builder-store.ts**: Zustand store for builder state (blocks, drag-drop, undo/redo)

### `/src/hooks` - Custom React Hooks

- Reusable logic for data fetching, mutations, and component behavior

### `/src/lib` - Utilities & Configuration

- **utils/**: Helper functions (block-helpers, currency, quote-number)
- **auth.ts**: NextAuth.js configuration
- **prisma.ts**: Prisma client singleton
- **theme.ts**: Material-UI theme configuration

### `/src/types` - TypeScript Definitions

- **blocks.ts**: Block type definitions
- **quote.ts**: Quote-related types
- **template.ts**: Template types
- **next-auth.d.ts**: NextAuth type extensions

## Architectural Patterns

### Data Flow Architecture

1. **Client → API Routes → Prisma → PostgreSQL**: Standard Next.js API pattern
2. **React Query**: Server state management with caching and optimistic updates
3. **Zustand**: Client-side builder state (ephemeral, not persisted until save)

### Component Architecture

- **Block System**: Polymorphic blocks with type-specific rendering
- **Builder Pattern**: Canvas + Toolbar + Block Wrappers for drag-and-drop
- **Provider Pattern**: Context providers for theme, auth, and query client

### Database Architecture

- **User**: Authentication and ownership
- **Quote**: Main entity with client info and metadata
- **QuoteBlock**: Polymorphic blocks (JSON data field) ordered within quotes
- **Template**: Reusable quote structures (system and user-created)
- **TemplateBlock**: Blocks within templates

### Route Protection

- **middleware.ts**: Protects dashboard routes, redirects unauthenticated users
- **NextAuth.js**: Session-based authentication with JWT

## Key Relationships

### Component Relationships

- BuilderCanvas contains multiple BlockWrappers
- BlockWrapper wraps specific block types (HeaderBlock, PriceTableBlock, etc.)
- BuilderToolbar provides block addition controls

### Data Relationships

- User → Quotes (one-to-many)
- User → Templates (one-to-many)
- Quote → QuoteBlocks (one-to-many, ordered)
- Template → TemplateBlocks (one-to-many, ordered)

### State Relationships

- Zustand store manages active builder session
- React Query caches server data (quotes, templates)
- Auto-save syncs Zustand state to database via API
