# Technologies Used

## Frontend Framework
- **Next.js 15** (App Router)
  - React 19
  - Server Components
  - API Routes
  - File-based routing

## Language
- **TypeScript**
  - Strong typing
  - Type inference
  - Interface definitions
  - Compile-time error checking

## UI Framework
- **Tailwind CSS**
  - Utility-first CSS
  - Responsive design
  - Custom design system

## UI Components
- **shadcn/ui**
  - Radix UI primitives
  - Accessible components
  - Customizable with Tailwind
  - Components used:
    - Button
    - Card
    - Input
    - Label
    - Dialog
    - Tooltip
    - Scroll Area

## Database
- **SQLite**
  - Lightweight
  - File-based
  - Perfect for development
  - Easy to migrate to PostgreSQL/MySQL

## ORM
- **Prisma**
  - Type-safe queries
  - Auto-generated client
  - Migration system
  - Schema-first approach

## Testing
- **Jest**
  - Unit testing framework
  - Mocking capabilities
  - Coverage reports

- **React Testing Library**
  - Component testing
  - User-centric tests
  - Accessibility testing

- **@testing-library/jest-dom**
  - Custom Jest matchers
  - Better assertions

## External APIs
- **Dictionary API**
  - Free dictionary API: https://dictionaryapi.dev
  - Returns word definitions
  - Multiple meanings
  - Examples and phonetics

## Development Tools
- **ESLint**
  - Code linting
  - Style enforcement
  - Error detection

- **ts-node**
  - TypeScript execution
  - For scripts and configs

## Architecture Pattern
- **Clean Architecture**
  - Domain-driven design
  - Dependency inversion
  - Testable business logic
  - Layer separation

## Key Libraries

### Production Dependencies
```json
{
  "@prisma/client": "^6.19.1",
  "@radix-ui/react-*": "Latest",
  "next": "16.1.1",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwindcss": "^4"
}
```

### Development Dependencies
```json
{
  "prisma": "^6.19.1",
  "typescript": "^5",
  "jest": "Latest",
  "@testing-library/react": "^16.3.1",
  "@testing-library/jest-dom": "^6.9.1",
  "ts-jest": "Latest"
}
```

## Browser APIs Used
- **HTMLVideoElement**
  - Video playback
  - Time tracking
  - Playback control

- **Fetch API**
  - API calls
  - Dictionary lookups

## Features by Technology

### Video Player (HTML5 Video)
- Native video controls
- Time tracking
- Subtitle overlay
- Pause/Play control

### Dual Subtitles (React + CSS)
- Real-time display
- Time-based rendering
- Clickable words
- Hover effects

### Dictionary Integration (Fetch API)
- Async word lookup
- HTML formatting
- Error handling
- Loading states

### Subtitle Timeline (React + Scroll)
- Auto-scroll to active
- Click navigation
- Visual highlighting
- Time formatting

### Video Management (Prisma + Next.js API)
- CRUD operations
- Input validation
- Error handling
- Type safety

## Why These Technologies?

### Next.js
- ✅ Full-stack framework
- ✅ API routes included
- ✅ Excellent TypeScript support
- ✅ Built-in optimization
- ✅ Great developer experience

### TypeScript
- ✅ Catch errors early
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Refactoring confidence

### Prisma
- ✅ Type-safe database access
- ✅ Auto-generated types
- ✅ Easy migrations
- ✅ Great DevEx

### shadcn/ui
- ✅ Copy/paste components
- ✅ Full customization
- ✅ Accessible by default
- ✅ Beautiful design

### Clean Architecture
- ✅ Testable code
- ✅ Maintainable structure
- ✅ Technology agnostic
- ✅ Team scalability

## Performance Considerations

### Frontend
- Server components where possible
- Client components only when needed
- Optimized re-renders
- Efficient subtitle rendering

### Backend
- Database indexing (unique constraints)
- Efficient queries with Prisma
- API response caching potential

### Database
- Indexed foreign keys
- Cascading deletes
- Optimized schema

## Security Considerations

### Input Validation
- Server-side validation in use cases
- Type checking with TypeScript
- Prisma prevents SQL injection

### API Security
- Input sanitization
- Error message handling
- No sensitive data exposure

## Scalability Path

### Database
- SQLite → PostgreSQL
- Add connection pooling
- Implement caching (Redis)

### Frontend
- Add CDN for videos
- Implement lazy loading
- Add service worker

### Backend
- Add rate limiting
- Implement queuing (Bull)
- Add background jobs

## Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate dev

# 3. Run tests
npm test

# 4. Run dev server
npm run dev

# 5. Build for production
npm run build

# 6. Start production
npm start
```

## Deployment Options

### Vercel (Recommended)
- Zero config deployment
- Automatic HTTPS
- Edge functions
- Preview deployments

### Railway
- PostgreSQL included
- Auto scaling
- Custom domains

### Docker
- Containerized deployment
- Any hosting provider
- Full control

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Minimum Requirements

- Node.js 18+
- npm 9+
- Modern browser with HTML5 video support
