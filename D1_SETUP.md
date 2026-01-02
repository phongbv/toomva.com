# Cloudflare D1 Setup Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler` or use `npx wrangler`)
- Authenticated with Cloudflare (`wrangler login`)

## Step-by-Step Setup

### 1. Copy Environment Variables
```bash
cp .env.example .env
```

For development, keep the SQLite configuration:
```
DATABASE_URL="file:./dev.db"
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- `@prisma/adapter-d1` for D1 database adapter
- `wrangler` for Cloudflare CLI

### 3. Setup Local Development Database (SQLite)
```bash
npm run db:migrate
npm run db:generate
```

### 4. Create D1 Database on Cloudflare

```bash
# Create the database
npm run d1:create

# Or manually:
npx wrangler d1 create toomva-db
```

You'll get output like:
```
✅ Successfully created DB 'toomva-db' in region EEUR
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "toomva-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT**: Copy the `database_id` and paste it into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "toomva-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Paste your ID here
```

### 5. Generate Migrations for D1

Prisma migrations need to be applied to D1 separately:

```bash
# Apply migrations to D1 production
npm run d1:migrate

# Or manually:
npx wrangler d1 migrations apply toomva-db --remote
```

For local D1 testing:
```bash
npm run d1:migrate:local
```

### 6. Verify D1 Database

Check if tables were created:
```bash
npm run d1:list
```

Query data:
```bash
npm run d1:query "SELECT * FROM Video"
```

### 7. Deploy to Cloudflare Pages

```bash
npm run build

# Deploy using Cloudflare Pages
# The D1 binding will automatically be available in production
```

## Development Workflow

### Working with SQLite (Local Development)
```bash
npm run dev                    # Start dev server
npm run db:migrate             # Create migration
npm run db:generate            # Generate Prisma client
npm run db:studio              # Browse database
```

### Working with D1 (Production)
```bash
npm run d1:migrate             # Apply migrations to D1
npm run d1:query "SQL"         # Run SQL query
npm run d1:list                # List tables
npm run d1:console             # Interactive console
```

## Environment Detection

The app automatically detects which database to use:

**Development (SQLite)**:
- Uses `DATABASE_URL` from `.env` file
- Standard Prisma Client

**Production (Cloudflare D1)**:
- Uses D1 binding from `wrangler.toml`
- Prisma Client with D1 adapter
- Automatically configured in `lib/db.ts`

## Troubleshooting

### Migration Issues
If migrations fail on D1:
1. Test locally with SQLite first
2. Check migration file syntax (D1 uses SQLite syntax)
3. Apply migrations incrementally

### D1 Limitations
- 25MB database size (free tier)
- 5 million reads/day (free tier)
- 100,000 writes/day (free tier)
- Query execution time limits

### Connection Issues
If Prisma can't connect to D1:
1. Verify `database_id` in `wrangler.toml`
2. Check Cloudflare authentication: `wrangler whoami`
3. Ensure D1 binding name matches (`DB`)

## Useful Commands

```bash
# Check D1 status
npx wrangler d1 info toomva-db

# Backup D1 database
npx wrangler d1 export toomva-db --output backup.sql

# Import data to D1
npx wrangler d1 execute toomva-db --file backup.sql

# List all D1 databases
npx wrangler d1 list

# Delete D1 database (careful!)
npx wrangler d1 delete toomva-db
```

## Next Steps

1. Test locally with SQLite: `npm run dev`
2. Create D1 database: `npm run d1:create`
3. Update `wrangler.toml` with database_id
4. Apply migrations: `npm run d1:migrate`
5. Deploy to Cloudflare Pages
6. Monitor D1 usage in Cloudflare dashboard

## Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Prisma D1 Adapter](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
