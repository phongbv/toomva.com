# Architecture Documentation

## Clean Architecture Overview

Ứng dụng được thiết kế theo nguyên tắc Clean Architecture với 3 layers chính:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Components, Pages, UI)                    │
├─────────────────────────────────────────────┤
│           Application Layer                 │
│  (Use Cases, Business Logic)                │
├─────────────────────────────────────────────┤
│             Domain Layer                    │
│  (Entities, Interfaces, Types)              │
├─────────────────────────────────────────────┤
│         Infrastructure Layer                │
│  (Database, External Services)              │
└─────────────────────────────────────────────┘
```

## Layer Details

### 1. Domain Layer (`/domain`)

**Mục đích**: Định nghĩa business entities và contracts (interfaces)

**Không phụ thuộc vào**: Bất kỳ layer nào khác

**Bao gồm**:
- `types.ts`: Domain entities và types
  - `Video`, `Subtitle`, `SubtitleEntry`
  - `CreateVideoInput`, `UpdateVideoInput`
  - `DictionaryResponse`
- `repositories/`: Repository interfaces
  - `IVideoRepository`: Contract cho video data access
- `services/`: Service interfaces
  - `IDictionaryService`: Contract cho dictionary service

**Nguyên tắc**:
- Không có dependencies ngoại trừ TypeScript types
- Chỉ chứa interfaces và types
- Business logic ở đây phải framework-agnostic

### 2. Application Layer (`/application`)

**Mục đích**: Chứa business logic và use cases

**Phụ thuộc vào**: Domain Layer only

**Bao gồm**:
- `use-cases/VideoUseCase.ts`: Orchestrate business operations
  - `createVideo()`: Validate và tạo video
  - `getVideoById()`: Lấy video theo ID
  - `getAllVideos()`: Lấy danh sách videos
  - `updateVideo()`: Cập nhật video
  - `deleteVideo()`: Xóa video

**Nguyên tắc**:
- Không biết về database, framework, hay UI
- Chỉ sử dụng interfaces từ Domain layer
- Chứa pure business logic
- Dễ dàng test với mocks

**Example**:
```typescript
export class VideoUseCase {
  constructor(private videoRepository: IVideoRepository) {}
  
  async createVideo(input: CreateVideoInput) {
    // Business validation
    if (!input.title) throw new Error('Title required');
    
    // Delegate to repository
    return await this.videoRepository.create(input);
  }
}
```

### 3. Infrastructure Layer (`/infrastructure`)

**Mục đích**: Implement các interfaces từ Domain layer

**Phụ thuộc vào**: Domain Layer

**Bao gồm**:
- `repositories/VideoRepository.ts`: Prisma implementation
  - Implement `IVideoRepository`
  - Tương tác với database qua Prisma
  
- `services/DictionaryService.ts`: External API integration
  - Implement `IDictionaryService`
  - Call dictionary API
  - Format response thành HTML

**Nguyên tắc**:
- Concrete implementations của domain interfaces
- Tương tác với external systems (DB, APIs)
- Có thể swap implementations dễ dàng

**Example**:
```typescript
export class VideoRepository implements IVideoRepository {
  async create(input: CreateVideoInput) {
    return await prisma.video.create({
      data: { /* ... */ }
    });
  }
}
```

### 4. Presentation Layer (`/components`, `/app`)

**Mục đích**: User interface và user interaction

**Phụ thuộc vào**: Application và Domain layers

**Bao gồm**:
- **Components**:
  - `VideoPlayer.tsx`: Video player với dual subtitles
  - `SubtitleSidebar.tsx`: Timeline navigation
  - `DictionaryPopup.tsx`: Word definition popup
  - `AddVideoForm.tsx`: Form thêm video mới
  - `VideoPlayerPage.tsx`: Main video watching page

- **API Routes** (`/app/api`):
  - `videos/route.ts`: GET all, POST new video
  - `videos/[id]/route.ts`: GET, PUT, DELETE video
  - `dictionary/route.ts`: GET word definition

- **Pages** (`/app`):
  - `page.tsx`: Home page với video list
  - `watch/[id]/page.tsx`: Video player page

**Nguyên tắc**:
- Chỉ handle UI và user interaction
- Delegate business logic to use cases
- Component-based architecture

## Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                          (implements)
```

**Rules**:
1. Domain không phụ thuộc vào gì
2. Application chỉ phụ thuộc vào Domain
3. Infrastructure implement Domain interfaces
4. Presentation sử dụng Application và Domain

## Data Flow Example

### Creating a Video

```
1. User fills AddVideoForm
   ↓
2. Form calls POST /api/videos
   ↓
3. API route instantiates:
   - VideoRepository (infrastructure)
   - VideoUseCase (application)
   ↓
4. VideoUseCase.createVideo():
   - Validates input (business logic)
   - Calls videoRepository.create()
   ↓
5. VideoRepository.create():
   - Uses Prisma to insert to DB
   - Returns VideoWithSubtitles entity
   ↓
6. Response flows back to client
   ↓
7. UI updates video list
```

### Watching a Video

```
1. User clicks video card
   ↓
2. Navigate to /watch/[id]
   ↓
3. VideoPlayerPage loads:
   - Calls GET /api/videos/[id]
   ↓
4. API calls VideoUseCase.getVideoById()
   ↓
5. Use case calls repository.findById()
   ↓
6. Repository fetches from DB with Prisma
   ↓
7. Data returned as VideoWithSubtitles
   ↓
8. VideoPlayer renders with subtitles
   ↓
9. User hovers on word:
   - Calls GET /api/dictionary?word=hello
   - DictionaryService fetches definition
   - DictionaryPopup displays result
```

## Benefits of This Architecture

### 1. **Testability**
- Business logic isolated in use cases
- Easy to mock dependencies
- Unit tests don't need database or framework

### 2. **Maintainability**
- Clear separation of concerns
- Each layer has single responsibility
- Easy to locate and fix bugs

### 3. **Flexibility**
- Can swap database (Prisma → TypeORM)
- Can swap UI framework (React → Vue)
- Can change API structure without affecting business logic

### 4. **Scalability**
- Add new features by adding new use cases
- Extend repositories without breaking existing code
- Easy to add new data sources

### 5. **Team Collaboration**
- Different teams can work on different layers
- Clear interfaces between layers
- Less merge conflicts

## Testing Strategy

### Unit Tests
- **Use Cases**: Mock repositories
- **Services**: Mock external APIs
- **Components**: Mock API calls

### Integration Tests
- Test API routes with real database
- Test repository with test database
- Test components with test APIs

### E2E Tests
- Full user flows
- Real browser testing
- Real database and services

## File Structure

```
toomva.com/
├── domain/                    # Domain Layer
│   ├── types.ts              # ✓ Framework-independent
│   ├── repositories/
│   │   └── IVideoRepository.ts
│   └── services/
│       └── IDictionaryService.ts
│
├── application/               # Application Layer
│   └── use-cases/
│       └── VideoUseCase.ts   # ✓ Pure business logic
│
├── infrastructure/            # Infrastructure Layer
│   ├── repositories/
│   │   └── VideoRepository.ts # ✓ Prisma implementation
│   └── services/
│       └── DictionaryService.ts # ✓ API integration
│
├── components/                # Presentation Layer
│   ├── VideoPlayer.tsx       # ✓ UI components
│   ├── SubtitleSidebar.tsx
│   └── ...
│
├── app/                       # Presentation Layer
│   ├── api/                  # ✓ API routes (controllers)
│   ├── watch/[id]/
│   └── page.tsx              # ✓ Pages
│
└── __tests__/                # Tests mirror structure
    ├── use-cases/
    ├── services/
    └── components/
```

## Design Patterns Used

1. **Repository Pattern**: Abstraction over data access
2. **Dependency Injection**: Use cases receive dependencies
3. **Interface Segregation**: Small, focused interfaces
4. **Single Responsibility**: Each class has one job
5. **Dependency Inversion**: Depend on abstractions, not concretions

## Future Improvements

- [ ] Add service layer for complex business logic
- [ ] Implement CQRS for read/write separation
- [ ] Add domain events for side effects
- [ ] Implement specification pattern for queries
- [ ] Add result type for better error handling
- [ ] Implement unit of work pattern for transactions
