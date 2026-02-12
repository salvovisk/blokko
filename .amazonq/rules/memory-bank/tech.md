# Technology Stack

## Programming Languages
- **TypeScript 5.3+**: Primary language for type-safe development
- **JavaScript (ES2017+)**: Target compilation level
- **SQL**: PostgreSQL database queries via Prisma

## Core Framework
- **Next.js 14.1+**: React framework with App Router
  - Server Components and Client Components
  - API Routes for backend
  - File-based routing
  - Middleware for authentication
- **React 18.2+**: UI library with hooks and concurrent features

## Frontend Technologies

### UI Framework
- **Material-UI (MUI) 5.15+**: Component library
  - @mui/material: Core components
  - @mui/icons-material: Icon set
  - @emotion/react & @emotion/styled: CSS-in-JS styling

### Drag & Drop
- **@dnd-kit 6.1+**: Modern drag-and-drop toolkit
  - @dnd-kit/core: Core functionality
  - @dnd-kit/sortable: Sortable lists
  - @dnd-kit/utilities: Helper utilities

### Rich Text Editing
- **Tiptap 2.1+**: Headless editor framework
  - @tiptap/react: React integration
  - @tiptap/starter-kit: Essential extensions

### PDF Generation
- **@react-pdf/renderer 3.4+**: React-based PDF creation

## Backend Technologies

### Database
- **PostgreSQL**: Primary database
- **Prisma 5.8+**: ORM and database toolkit
  - @prisma/client: Type-safe database client
  - Prisma CLI: Schema management and migrations

### Authentication
- **NextAuth.js 4.24+**: Authentication solution
  - Credentials provider
  - Session management
  - JWT tokens

### Security
- **bcryptjs 2.4+**: Password hashing

## State Management
- **Zustand 4.5+**: Lightweight state management for builder
- **@tanstack/react-query 5.17+**: Server state management
  - Data fetching and caching
  - Optimistic updates
  - Background refetching

## Utilities
- **Zod 3.22+**: Schema validation
- **date-fns 3.0+**: Date manipulation
- **nanoid 5.1+**: Unique ID generation

## Development Tools

### Build System
- **Next.js Compiler**: Built-in SWC-based compiler
- **TypeScript Compiler**: Type checking
- **ESLint**: Code linting with Next.js config

### Development Dependencies
- **tsx 4.21+**: TypeScript execution for scripts
- **@types/***: TypeScript type definitions

## Configuration Files
- **tsconfig.json**: TypeScript configuration
  - Target: ES2017
  - Module: ESNext with bundler resolution
  - Strict mode enabled
  - Path aliases: @/* → ./src/*
- **next.config.js**: Next.js configuration
- **.eslintrc.json**: ESLint rules
- **prisma/schema.prisma**: Database schema

## Development Commands

### Server Management
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build production bundle
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint checks
```

### Database Operations
```bash
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Package Management
```bash
npm install          # Install dependencies
npm run postinstall  # Auto-runs: prisma generate
```

## Environment Variables
Required in `.env` file:
- **DATABASE_URL**: PostgreSQL connection string
- **NEXTAUTH_URL**: Application URL (e.g., http://localhost:3000)
- **NEXTAUTH_SECRET**: Secret key for NextAuth.js

## Browser Compatibility
- Modern browsers supporting ES2017+
- DOM and DOM.iterable APIs required

## Node.js Requirements
- **Node.js 18+**: Minimum version required
- **npm or yarn**: Package manager
