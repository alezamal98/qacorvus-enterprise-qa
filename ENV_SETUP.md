# CORVUS QA Enterprise - Environment Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > Database
3. Copy the connection strings (Session mode for DATABASE_URL, Transaction mode for DIRECT_URL)
4. Replace the placeholders above with your actual values

## Database Migration

After setting up your `.env` file, run:

```bash
npx prisma db push
npx prisma generate
```
