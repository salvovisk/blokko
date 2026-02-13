# BLOKKO Auth-Enabled - Quick Setup

## Step 1: Configure Database

Create a `.env` file:

```bash
cat > .env << 'EOF'
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/blokko?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
EOF
```

**Or use a free cloud database (Neon):**
- Sign up at https://neon.tech
- Create a new project "blokko"
- Copy the connection string to DATABASE_URL in .env

## Step 2: Create Database Tables

```bash
npm run db:push
```

## Step 3: Seed Demo Account

```bash
npm run db:seed
```

This creates:
- **Email**: `demo@blokko.com`
- **Password**: `demo123`
- Sample quote with blocks

## Step 4: Start Dev Server

```bash
npm run dev
```

## Step 5: Login

Go to http://localhost:3000/login and use:
- Email: `demo@blokko.com`
- Password: `demo123`

---

**That's it!** You now have a working authentication system with a demo account.

## Available Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Register new account
- `/dashboard` - Protected dashboard (requires login)
- `/api/health` - Health check
- `/api/auth/*` - NextAuth endpoints

## Database Management

```bash
# View database in browser
npm run db:studio

# Reset and re-seed
npm run db:push --force-reset
npm run db:seed
```
