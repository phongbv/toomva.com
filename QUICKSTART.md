# Quick Start Guide

## Bước 1: Cài đặt dependencies

```bash
npm install
```

## Bước 2: Thiết lập database

```bash
npx prisma migrate dev
```

## Bước 3: Chạy development server

```bash
npm run dev
```

## Bước 4: Mở trình duyệt

Truy cập: http://localhost:3000

## Bước 5: Thêm video mẫu

### Cách 1: Sử dụng giao diện web
1. Click nút "Add New Video" trên trang chủ
2. Copy nội dung từ file `SAMPLE_DATA.md`
3. Điền vào form:
   - **Title**: English Learning - Basic Greetings
   - **Video URL**: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   - **English Subtitles**: Copy từ SAMPLE_DATA.md
   - **Vietnamese Subtitles**: Copy từ SAMPLE_DATA.md
4. Click "Add Video"

### Cách 2: Sử dụng script (Nhanh hơn)
```bash
# Cài đặt tsx nếu chưa có
npm install -D tsx

# Chạy script add sample video
npx tsx scripts/add-sample-video.ts
```

## Bước 6: Xem video

1. Click vào video card trên trang chủ
2. Video sẽ phát với dual subtitles (English + Vietnamese)
3. Thử các tính năng:
   - **Click vào phụ đề bên phải**: Tua video đến thời điểm đó
   - **Hover vào từ tiếng Anh**: Xem định nghĩa từ điển
   - Video sẽ tự động pause khi popup dictionary mở

## Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests ở chế độ watch
npm run test:watch

# Xem test coverage
npm run test:coverage
```

## Cấu trúc Project

```
toomva.com/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── dictionary/      # Dictionary API
│   │   └── videos/          # Video CRUD APIs
│   ├── watch/[id]/          # Video player page
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # shadcn components
│   ├── VideoPlayer.tsx      # Video player với dual subs
│   ├── SubtitleSidebar.tsx  # Sidebar timeline
│   ├── DictionaryPopup.tsx  # Dictionary popup
│   └── AddVideoForm.tsx     # Form thêm video
├── domain/                  # Domain layer (Clean Architecture)
│   ├── types.ts             # Domain types
│   ├── repositories/        # Repository interfaces
│   └── services/            # Service interfaces
├── application/             # Application layer
│   └── use-cases/          # Business logic
├── infrastructure/          # Infrastructure layer
│   ├── repositories/        # Repository implementations
│   └── services/           # Service implementations
├── __tests__/              # Unit tests
├── prisma/                 # Database
│   └── schema.prisma       # Database schema
└── lib/                    # Utilities
    └── db.ts               # Prisma client
```

## Troubleshooting

### Database error
```bash
# Xóa database và tạo lại
rm prisma/dev.db
npx prisma migrate dev
```

### Port đã được sử dụng
```bash
# Thay đổi port trong package.json:
"dev": "next dev -p 3001"
```

### Type errors
```bash
# Re-generate Prisma client
npx prisma generate
```

## Tính năng chính

✅ **Dual Subtitles**: Hiển thị cả tiếng Anh và tiếng Việt đồng thời
✅ **Timeline Navigation**: Click để nhảy đến bất kỳ dòng phụ đề nào  
✅ **Dictionary Integration**: Hover vào từ để xem nghĩa
✅ **Auto Pause**: Video tự động dừng khi tra từ
✅ **Clean Architecture**: Code dễ maintain và test
✅ **Full CRUD**: Quản lý videos và subtitles
✅ **Unit Tests**: Coverage cho business logic

## Phát triển tiếp

- [ ] Import videos từ YouTube/website khác
- [ ] Auto-generate subtitles
- [ ] User authentication
- [ ] Progress tracking
- [ ] Bookmarks & favorites
- [ ] Search functionality
- [ ] Multiple language support
- [ ] Keyboard shortcuts
- [ ] Dark mode

## Support

Nếu gặp vấn đề, hãy:
1. Check console logs trong browser (F12)
2. Check terminal logs của Next.js server
3. Đảm bảo database đã được migrate: `npx prisma migrate dev`
4. Đảm bảo Prisma client đã được generate: `npx prisma generate`
