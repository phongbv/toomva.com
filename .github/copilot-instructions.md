# Copilot Instructions - TV Learning Platform

## Architecture Overview

This is a **Clean Architecture** Next.js application for watching videos with dual subtitles (English/Vietnamese) for language learning. The codebase strictly follows layered architecture principles with clear dependency rules.

### Layer Dependencies (Critical!)

```
Presentation → Application → Domain ← Infrastructure
```

**Never violate these rules:**
- **Domain** (`/domain`): Pure interfaces and types. Zero external dependencies
- **Application** (`/application`): Business logic. Only depends on Domain interfaces
- **Infrastructure** (`/infrastructure`): Concrete implementations. Implements Domain interfaces
- **Presentation** (`/components`, `/app`): UI layer. Calls Application use cases

### Dependency Injection Pattern

All API routes follow this instantiation pattern:
```typescript
const videoRepository = new VideoRepository();
const videoUseCase = new VideoUseCase(videoRepository);
```

Never import Prisma or infrastructure directly in use cases or domain layer.

## Database Configuration

### Environment-Specific Databases
- **Development**: SQLite (local file-based database)
- **Production**: Cloudflare D1 (serverless SQLite on Cloudflare)

### Setup Process
1. **Development** uses `DATABASE_URL="file:./dev.db"` in `.env`
2. **Production** uses Cloudflare D1 connection string
3. Prisma schema configured to support both environments
4. Use `wrangler` CLI for D1 database management in production

### Cloudflare D1 Commands
```bash
# Create D1 database
npx wrangler d1 create toomva-db

# Run migrations on D1
npx wrangler d1 migrations apply toomva-db --remote

# Query D1 database
npx wrangler d1 execute toomva-db --command "SELECT * FROM Video"

# Local D1 development
npx wrangler d1 migrations apply toomva-db --local
```

**Important**: Always test migrations locally with SQLite before applying to D1 production.

## Key Architectural Patterns

### 1. Repository Pattern
All data access goes through repository interfaces defined in `/domain/repositories/`. The VideoRepository in `/infrastructure/repositories/` implements `IVideoRepository` using Prisma.

**Example**: When adding a new entity, create the interface in domain first, then implement in infrastructure.

### 2. Dual Subtitle System
Subtitles are stored as JSON arrays in the database:
- Single `Subtitle` record per language (enforced by `@@unique([videoId, language])`)
- Content field contains serialized `SubtitleEntry[]` array
- `SubtitleEntry` type: `{ startTime: number, endTime: number, textEn: string, textVi: string }`

### 3. Dictionary Integration
- DictionaryService fetches from external API: `https://api.dictionaryapi.dev/api/v2/entries/en`
- Returns HTML-formatted definitions
- Implements `IDictionaryService` interface from domain layer

## Common Development Tasks

### Adding New Features
1. **Define domain types** in `/domain/types.ts`
2. **Create repository interface** (if needed) in `/domain/repositories/`
3. **Implement infrastructure** in `/infrastructure/repositories/` or `/services/`
4. **Add use case** in `/application/use-cases/` with business logic
5. **Create API route** in `/app/api/` that wires up dependencies
6. **Build UI components** in `/components/`

### Database Workflow

#### Development (SQLite)
```bash
# Modify schema
npx prisma migrate dev --name description_of_change

# After migration
npx prisma generate

# View data
npx prisma studio
```

#### Production (Cloudflare D1)
```bash
# 1. Create migration locally first
npx prisma migrate dev --name description_of_change

# 2. Generate Prisma client
npx prisma generate

# 3. Apply to D1 production
npx wrangler d1 migrations apply toomva-db --remote

# 4. Verify on D1
npx wrangler d1 execute toomva-db --command "PRAGMA table_info(Video)"
```

**Important**: 
- Prisma client is regenerated after each migration
- Always test migrations on local SQLite before applying to D1
- D1 migrations are applied separately using wrangler CLI
- Keep migration files in sync between local and D1

### Testing Strategy
- **Use cases are tested** with mocked repositories (`__tests__/use-cases/`)
- **Services are tested** with mocked dependencies (`__tests__/services/`)
- **Components are tested** with React Testing Library (`__tests__/components/`)
- Run tests: `npm test` or `npm run test:watch`

Mock pattern example from VideoUseCase tests:
```typescript
mockVideoRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  // ... implement all interface methods
};
```

## Component Patterns

### SubtitleSidebar Behavior
- Shows only subtitles from 2 above current position onwards (performance optimization)
- Auto-scrolls active subtitle into view using `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Active subtitle has blue highlight with `bg-blue-100 border-blue-400`

### DictionaryPopup Auto-Pause
When dictionary popup appears, video automatically pauses. This is coordinated between VideoPlayer and DictionaryPopup components.

## API Routes Structure

All CRUD operations follow RESTful conventions:
- `GET /api/videos` - List all videos
- `POST /api/videos` - Create video
- `GET /api/videos/[id]` - Get single video with subtitles
- `PUT /api/videos/[id]` - Update video
- `DELETE /api/videos/[id]` - Delete video
- `POST /api/dictionary` - Get word definition (body: `{ word: string }`)

## Database Schema Notes

- **Videos** and **Subtitles** have cascade delete: deleting a video removes its subtitles
- **Subtitle content** is stored as JSON string, parsed at application layer
- **VideoWithSubtitles** type combines Video + Subtitle[] for complete video data
- **SQLite compatibility**: Schema designed to work with both local SQLite and Cloudflare D1
- **D1 limitations**: Be aware of D1's 25MB database size limit (free tier) and query time limits

## Styling Conventions

- Uses **Tailwind CSS** utility classes exclusively
- **shadcn/ui** components for UI primitives (Dialog, Button, ScrollArea, etc.)
- Custom components in `/components/ui/` should follow shadcn patterns
- Responsive design with mobile-first approach

## Common Pitfalls to Avoid

1. **Don't import Prisma in use cases** - Always inject repository through constructor
2. **Don't put business logic in API routes** - Delegate to use cases
3. **Don't parse subtitle JSON in components** - Do it in repository or use case
4. **Don't create circular dependencies** - Follow the layer dependency flow
5. **Don't skip migration generation** - Always create migrations for schema changes
6. **Don't forget to apply D1 migrations** - After local migration, run wrangler command for production
7. **Don't assume SQLite and D1 are identical** - Test queries on both platforms

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm test                       # Run all tests
npm run test:coverage          # Test with coverage report

# Database (Development)
npm run db:migrate             # Run migrations (SQLite)
npm run db:generate            # Generate Prisma client
npm run db:studio              # Open Prisma Studio GUI
npm run db:seed                # Add sample video data

# Database (Production - Cloudflare D1)
npx wrangler d1 migrations apply toomva-db --remote
npx wrangler d1 execute toomva-db --command "SELECT * FROM Video"

# Full setup
npm run setup                  # Install + migrate + generate
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `VideoPlayer.tsx`, `SubtitleSidebar.tsx`)
- **Use Cases**: PascalCase with UseCase suffix (e.g., `VideoUseCase.ts`)
- **Repositories**: PascalCase with Repository suffix (e.g., `VideoRepository.ts`)
- **API Routes**: lowercase with Next.js conventions (`route.ts`, `[id]/route.ts`)
- **Types**: Defined in `domain/types.ts`, exported as named exports

## When Modifying Existing Code

1. Check if the change affects multiple layers (usually does)
2. Start from domain layer (types/interfaces) and work outward
3. Update tests alongside implementation changes
4. Verify no circular dependencies introduced
5. Run `npm test` before committing

## Project-Specific TypeScript Patterns

- Use **path aliases** with `@/` prefix (configured in `tsconfig.json`)
- Prefer **named exports** over default exports
- Use **strict null checks** - all optional fields marked with `?`
- Repository methods return `Promise<T>` or `Promise<T | null>` explicitly
