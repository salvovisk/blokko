# BLOKKO - Auth-Enabled Branch

This branch includes full authentication and private dashboard functionality.

## Features

- ✅ User registration with password hashing (bcrypt)
- ✅ Login with NextAuth.js
- ✅ Protected dashboard area
- ✅ Session management with JWT
- ✅ PostgreSQL database with Prisma ORM
- ✅ Secure password storage
- ✅ Quote model for future builder integration

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and update `.env`:

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your database URL
DATABASE_URL="postgresql://user:password@localhost:5432/blokko?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Usage

### Register a New Account

1. Go to http://localhost:3000/register
2. Enter your name, email, and password (min 6 characters)
3. Click "Create Account"
4. You'll be redirected to login

### Login

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the dashboard

### Dashboard

After login, you'll have access to:
- Protected dashboard area at `/dashboard`
- User session information
- Logout functionality

## Database Management

```bash
# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Login (NextAuth)
- `GET /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/health` - Health check

## Security Features

### Password Security
- Passwords hashed with bcrypt (12 rounds)
- Never stored in plain text
- Minimum 6 characters required

### Session Security
- JWT-based sessions
- HTTP-only cookies
- Secure session storage
- Auto-expire on inactivity

### Route Protection
- Middleware enforces authentication
- Unauthenticated users redirected to /login
- Dashboard routes require valid session

## Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  quotes        Quote[]
}
```

### Quote Model
```prisma
model Quote {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String?
  content     Json     // Block structure
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET` - Secret key for JWT signing

Optional:
- `NODE_ENV` - Environment (development/production)

## Deployment

### Docker

Docker support included! See `DOCKER.md` for details.

You'll need to add database environment variables:

```yaml
# docker-compose.yml
environment:
  - DATABASE_URL=postgresql://user:pass@db:5432/blokko
  - NEXTAUTH_URL=https://yourdomain.com
  - NEXTAUTH_SECRET=your-secret-here
```

### Production Setup

1. Set up PostgreSQL database
2. Set environment variables
3. Run database migrations: `npm run db:push`
4. Build: `npm run build`
5. Start: `npm start`

## Differences from Main Branch

**Main branch** (landing only):
- ❌ No authentication
- ❌ No database
- ❌ No private areas
- ✅ Minimal dependencies
- ✅ Static landing page only

**Auth-enabled branch** (this branch):
- ✅ Full authentication system
- ✅ PostgreSQL database
- ✅ Protected dashboard
- ✅ User management
- ✅ Quote model (for future builder)
- Additional dependencies: Prisma, NextAuth, bcrypt

## Troubleshooting

### Database Connection Failed
```bash
# Make sure PostgreSQL is running
# Check DATABASE_URL in .env
# Test connection
npm run db:studio
```

### Prisma Client Not Generated
```bash
# Manually generate Prisma client
npx prisma generate
```

### Session Not Persisting
- Check NEXTAUTH_SECRET is set
- Clear browser cookies
- Restart dev server

### Can't Access Dashboard
- Make sure you're logged in
- Check middleware allows /dashboard route
- Verify session in Network tab

## Next Steps

To add the quote builder functionality:
1. Create builder components (blocks, editors, canvas)
2. Add quote API routes (CRUD operations)
3. Implement PDF generation
4. Add template system
5. Build drag-and-drop interface

The Quote model is already set up in the database schema!

## Support

For issues:
- Check logs in terminal
- Use Prisma Studio to inspect database
- Verify environment variables are set
- Test API routes with curl or Postman

---

**Ready to build!** The authentication foundation is complete. Start by registering an account at http://localhost:3000/register
