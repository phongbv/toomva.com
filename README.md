# TV Learning Platform

Ứng dụng xem tivi với phụ đề kép (tiếng Anh và tiếng Việt) để học ngoại ngữ.

## Tính năng

- ✅ **Video Player với Dual Subtitles**: Hiển thị đồng thời phụ đề tiếng Anh và tiếng Việt
- ✅ **Subtitle Timeline Sidebar**: Hiển thị tất cả phụ đề theo thời gian thực, click để tua video
- ✅ **Dictionary Integration**: Hover vào từ tiếng Anh để xem định nghĩa, video tự động tạm dừng
- ✅ **Video Management**: CRUD đầy đủ cho videos và subtitles
- ✅ **Clean Architecture**: Tách biệt Domain, Application, Infrastructure layers
- ✅ **Unit Tests**: Test coverage đầy đủ cho business logic

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: SQLite với Prisma ORM
- **Testing**: Jest, React Testing Library

## Cấu trúc dự án (Clean Architecture)

```
├── domain/                    # Domain Layer
│   ├── types.ts              # Domain entities & interfaces
│   ├── repositories/         # Repository interfaces
│   └── services/             # Service interfaces
├── application/              # Application Layer
│   └── use-cases/           # Business logic use cases
├── infrastructure/          # Infrastructure Layer
│   ├── repositories/        # Repository implementations
│   └── services/           # Service implementations
├── components/              # React components
├── app/                     # Next.js App Router
│   ├── api/                # API routes
│   ├── watch/[id]/         # Video player page
│   └── page.tsx            # Home page
├── __tests__/              # Unit tests
└── prisma/                 # Database schema & migrations
```

## Cài đặt

1. **Clone và cài đặt dependencies**:
```bash
npm install
```

2. **Setup database**:
```bash
npx prisma migrate dev
```

3. **Chạy development server**:
```bash
npm run dev
```

4. **Mở trình duyệt**: http://localhost:3000

## Chạy tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Cách sử dụng

### 1. Thêm video mới

1. Trên trang chủ, click nút "Add New Video"
2. Điền thông tin:
   - **Title**: Tên video
   - **Description**: Mô tả (optional)
   - **Video URL**: Link file MP4
   - **English Subtitles**: Phụ đề tiếng Anh (định dạng SRT)
   - **Vietnamese Subtitles**: Phụ đề tiếng Việt (định dạng SRT)
3. Click "Add Video"

### 2. Xem video

1. Click vào video card trên trang chủ
2. Video sẽ phát với dual subtitles
3. **Tính năng**:
   - Click vào dòng phụ đề bên phải để tua video
   - Hover vào từ tiếng Anh trong phụ đề để xem định nghĩa
   - Video tự động tạm dừng khi popup dictionary hiện ra

### 3. Format phụ đề SRT

```srt
1
00:00:01,000 --> 00:00:04,000
Hello World

2
00:00:04,000 --> 00:00:07,000
How are you?
```

## API Endpoints

### Videos
- `GET /api/videos` - Lấy danh sách tất cả videos
- `POST /api/videos` - Tạo video mới
- `GET /api/videos/[id]` - Lấy chi tiết video
- `PUT /api/videos/[id]` - Cập nhật video
- `DELETE /api/videos/[id]` - Xóa video

### Dictionary
- `GET /api/dictionary?word={word}` - Lấy định nghĩa từ

## Database Schema

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
  language  String   // "en" or "vi"
  content   String   // JSON string
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  video     Video    @relation(fields: [videoId], references: [id])
}
```

## Phát triển trong tương lai

- [ ] Import videos từ website có sẵn
- [ ] Auto-extract subtitle từ video
- [ ] User authentication & progress tracking
- [ ] Bookmarks & favorites
- [ ] Advanced subtitle search
- [ ] Multiple language support
- [ ] Video playback speed control
- [ ] Keyboard shortcuts

## License

MIT
