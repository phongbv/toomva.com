# Deployment Guide

## Overview

Ứng dụng có thể được deploy lên nhiều nền tảng khác nhau. Dưới đây là hướng dẫn chi tiết cho từng platform.

## Prerequisites

- Git repository (GitHub, GitLab, etc.)
- Node.js 18+ installed locally
- Database (SQLite cho dev, PostgreSQL cho production)

## Option 1: Vercel (Recommended) ⭐

### Why Vercel?
- Zero config deployment
- Automatic HTTPS
- Edge functions
- Preview deployments
- Free tier available

### Steps:

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Sign up at vercel.com**

3. **Import project**
- Click "Add New Project"
- Select your repository
- Vercel auto-detects Next.js

4. **Configure environment variables**
```
DATABASE_URL=your_postgres_url
```

5. **Deploy**
- Click "Deploy"
- Wait ~2 minutes
- Your app is live! 🎉

### Update Prisma for Production

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

Run migration on first deploy:
```bash
npx prisma migrate deploy
```

---

## Option 2: Railway

### Why Railway?
- PostgreSQL included
- Auto scaling
- Simple pricing
- GitHub integration

### Steps:

1. **Sign up at railway.app**

2. **Create new project**
- "New Project" → "Deploy from GitHub"
- Select your repository

3. **Add PostgreSQL**
- Click "New" → "Database" → "Add PostgreSQL"
- Connection string auto-added to env vars

4. **Configure build**
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

5. **Deploy**
- Railway auto-deploys on push

---

## Option 3: Docker

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated ./lib/generated

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/toomva
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=toomva
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build
docker-compose build

# Run migrations
docker-compose run app npx prisma migrate deploy

# Start
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## Option 4: Manual VPS (DigitalOcean, AWS, etc.)

### 1. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

### 2. Setup Database

```bash
sudo -u postgres psql
CREATE DATABASE toomva;
CREATE USER toomva_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE toomva TO toomva_user;
\q
```

### 3. Clone and Build

```bash
# Clone repo
git clone <your-repo>
cd toomva.com

# Install dependencies
npm install

# Setup environment
echo "DATABASE_URL=postgresql://toomva_user:secure_password@localhost:5432/toomva" > .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build
npm run build
```

### 4. Start with PM2

```bash
# Start app
pm2 start npm --name "toomva" -- start

# Save PM2 config
pm2 save

# Setup auto-start
pm2 startup
```

### 5. Setup Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables

### Development
```env
DATABASE_URL="file:./dev.db"
```

### Production
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NODE_ENV="production"
```

---

## Database Migration Strategy

### For SQLite → PostgreSQL

1. **Export data from SQLite**
```bash
npx prisma db pull
```

2. **Update schema for PostgreSQL**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Create new migration**
```bash
npx prisma migrate dev --name switch_to_postgres
```

4. **Migrate data** (manual or using script)

---

## Performance Optimization

### 1. Enable Output Standalone

In `next.config.ts`:
```typescript
export default {
  output: 'standalone',
}
```

### 2. Add Compression

```bash
npm install compression
```

### 3. Enable Caching

Use Redis or Vercel KV for caching:
```typescript
import { kv } from '@vercel/kv'

export async function GET() {
  const cached = await kv.get('videos')
  if (cached) return cached
  
  const videos = await getVideos()
  await kv.set('videos', videos, { ex: 60 })
  return videos
}
```

### 4. CDN for Videos

- Upload videos to AWS S3 / Cloudflare R2
- Use CloudFront / Cloudflare CDN
- Update videoUrl to use CDN links

---

## Monitoring

### 1. Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to layout:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 3. Logging
```bash
npm install pino pino-pretty
```

---

## Backup Strategy

### Database Backups

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260102.sql
```

### Automated Backups

Use cron job:
```bash
0 2 * * * /path/to/backup-script.sh
```

---

## Health Checks

Create `/app/api/health/route.ts`:
```typescript
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: String(error) },
      { status: 503 }
    )
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Security Checklist

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Use CSP headers
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Database backups
- [ ] Error logging
- [ ] Monitor for anomalies

---

## Cost Estimation

### Vercel
- **Hobby (Free)**: Perfect for personal projects
- **Pro ($20/month)**: Better performance, more builds

### Railway
- **Free tier**: $5 credit/month
- **Developer ($5/month)**: More resources

### VPS (DigitalOcean)
- **Basic ($6/month)**: 1GB RAM, good for start
- **Standard ($12/month)**: 2GB RAM, recommended

### Database
- **Vercel Postgres**: Free tier → $20/month
- **Railway Postgres**: Included in plan
- **Managed DB**: $15-50/month

---

## Post-Deployment

1. Test all features in production
2. Monitor error logs
3. Check performance metrics
4. Set up alerts
5. Document deployment process
6. Create rollback plan

---

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## Support

Need help? Check:
- GitHub Issues
- Vercel/Railway documentation
- Next.js documentation
- Prisma documentation
