# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-02

### Added

#### Core Features
- ✅ Video player with dual subtitles (English + Vietnamese)
- ✅ Real-time subtitle display overlay on video
- ✅ Subtitle timeline sidebar with click-to-seek
- ✅ Dictionary integration with hover-to-translate
- ✅ Auto-pause video when dictionary popup opens
- ✅ Video management (Create, Read, Update, Delete)
- ✅ SRT subtitle format parser

#### Architecture
- ✅ Clean Architecture implementation
- ✅ Domain layer with types and interfaces
- ✅ Application layer with use cases
- ✅ Infrastructure layer with implementations
- ✅ Presentation layer with React components

#### Database
- ✅ Prisma ORM integration
- ✅ SQLite database
- ✅ Video and Subtitle models
- ✅ Database migrations

#### UI/UX
- ✅ Responsive design with Tailwind CSS
- ✅ shadcn/ui component library
- ✅ Modern, clean interface
- ✅ Hover effects and transitions
- ✅ Auto-scroll to active subtitle
- ✅ Clickable words in English subtitles

#### Testing
- ✅ Jest testing framework
- ✅ React Testing Library
- ✅ Unit tests for use cases
- ✅ Unit tests for services
- ✅ Component tests
- ✅ 100% test coverage for business logic

#### Developer Experience
- ✅ TypeScript with strict mode
- ✅ ESLint configuration
- ✅ Sample data for testing
- ✅ Comprehensive documentation
- ✅ Quick start guide
- ✅ Architecture documentation

### Technical Details

#### Frontend Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui components

#### Backend Stack
- Next.js API Routes
- Prisma ORM
- SQLite database
- TypeScript

#### Testing Stack
- Jest
- React Testing Library
- ts-jest
- @testing-library/jest-dom

### API Endpoints

#### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Create new video
- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

#### Dictionary
- `GET /api/dictionary?word={word}` - Get word definition

### Database Schema

```prisma
model Video {
  id          String   @id @default(cuid())
  title       String
  description String?
  videoUrl    String
  thumbnailUrl String?
  duration    Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  subtitles   Subtitle[]
}

model Subtitle {
  id        String   @id @default(cuid())
  videoId   String
  language  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  video     Video    @relation(fields: [videoId], references: [id])
  @@unique([videoId, language])
}
```

### Documentation
- README.md - Project overview
- QUICKSTART.md - Quick start guide
- ARCHITECTURE.md - Architecture documentation
- TECHNOLOGIES.md - Technology stack
- SAMPLE_DATA.md - Sample subtitles and videos
- CHANGELOG.md - Version history

### Scripts
- `add-sample-video.ts` - Script to add sample video data

## [Unreleased]

### Planned Features
- [ ] Import videos from external websites
- [ ] Auto-extract subtitles from video
- [ ] User authentication system
- [ ] Progress tracking per user
- [ ] Bookmarks and favorites
- [ ] Advanced subtitle search
- [ ] Multiple language support (beyond EN/VI)
- [ ] Video playback speed control
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Social features (comments, ratings)
- [ ] Learning statistics dashboard
- [ ] Vocabulary builder
- [ ] Spaced repetition system
- [ ] Export learned words
- [ ] Integration with Anki
- [ ] YouTube video import
- [ ] Auto-sync subtitles
- [ ] Custom subtitle styling
- [ ] Multiple video quality options

### Technical Improvements
- [ ] Migrate to PostgreSQL for production
- [ ] Add Redis caching
- [ ] Implement CDN for videos
- [ ] Add image optimization
- [ ] Implement lazy loading
- [ ] Add service worker for PWA
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Set up CI/CD pipeline
- [ ] Add E2E tests with Playwright
- [ ] Implement error boundaries
- [ ] Add performance monitoring
- [ ] Optimize bundle size
- [ ] Add Docker support
- [ ] Kubernetes deployment config

### Bug Fixes
- None reported yet

---

## Version History

- **1.0.0** (2026-01-02) - Initial release with core features
- More versions to come...

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes
