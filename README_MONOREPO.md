# PyStegoWatermark Suite - Monorepo

Hệ thống Giấu Tin & Thủy Vân Số Nâng Cao với Next.js Frontend và FastAPI Backend.

## 🏗️ Cấu Trúc Dự Án

```
project-root/
├── frontend/          # Next.js 14 + TypeScript + Tailwind + shadcn/ui
│   ├── app/          # App Router pages
│   ├── components/   # UI Components
│   │   ├── ui/      # shadcn/ui components
│   │   ├── features/ # Feature components
│   │   └── layout/  # Layout components
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utilities & configurations
│   │   ├── api/    # API client & services
│   │   └── validations/ # Zod schemas
│   └── providers/   # React providers
│
├── backend/          # FastAPI + Python
│   ├── app/
│   │   ├── api/     # API routes
│   │   ├── core/    # Core logic (steganography, watermarking)
│   │   └── main.py  # FastAPI app
│   ├── venv/        # Python virtual environment
│   └── requirements.txt
│
└── package.json     # Root package.json for scripts
```

## 🚀 Cài Đặt

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 🎯 Chạy Dự Án

### Chạy Cả 2 (Frontend + Backend)

Từ thư mục root:

```bash
npm run dev
```

### Chạy Riêng Lẻ

**Frontend:**
```bash
cd frontend
npm run dev
```
→ Mở http://localhost:3000

**Backend:**
```bash
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
→ API docs: http://localhost:8000/docs

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion, GSAP
- **Forms:** React Hook Form + Zod
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.13
- **Image Processing:** OpenCV, Pillow, NumPy
- **Algorithms:** 
  - LSB Steganography
  - DCT-SVD Watermarking
  - Arnold Cat Map
- **Encryption:** AES-256 (pycryptodome)

## 🎨 Tính Năng

### ✅ Đã Hoàn Thành
- ✅ Giấu tin (Steganography)
  - Nhúng text vào ảnh (LSB)
  - Trích xuất text từ ảnh
  - Mã hóa AES-256
  - Metrics: PSNR, SSIM

### 🚧 Đang Phát Triển
- 🚧 Thủy vân ảnh (DCT-SVD)
- 🚧 Thủy vân video
- 🚧 Mô phỏng tấn công

## 📝 API Endpoints

### Steganography
- `POST /api/steganography/embed` - Nhúng tin nhắn
- `POST /api/steganography/extract` - Trích xuất tin nhắn

### Watermarking
- `POST /api/watermarking/embed` - Nhúng watermark
- `POST /api/watermarking/extract` - Trích xuất watermark

### Video
- `POST /api/video/embed` - Nhúng watermark vào video

## 🔧 Scripts

```bash
# Development
npm run dev              # Chạy cả frontend + backend
npm run dev:frontend     # Chỉ frontend
npm run dev:backend      # Chỉ backend

# Build
npm run build           # Build frontend

# Frontend only
cd frontend
npm run dev             # Development
npm run build           # Production build
npm run start           # Start production server
```

## 🌐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8000
```

## 📚 Cấu Trúc Code

### Frontend Architecture
```
components/
├── ui/              # Reusable UI components (shadcn/ui)
├── features/        # Feature-specific components
│   └── steganography/
│       ├── embed-form.tsx    # Pure UI
│       └── extract-form.tsx  # Pure UI
└── layout/          # Layout components

hooks/
├── use-steganography.ts  # API hooks
├── use-embed-form.ts     # Form logic
└── use-extract-form.ts   # Form logic

lib/
├── api/             # API client & services
│   ├── client.ts
│   ├── steganography.api.ts
│   └── watermarking.api.ts
└── validations/     # Zod schemas
    └── steganography.schema.ts
```

### Backend Architecture
```
app/
├── api/             # API routes (controllers)
│   ├── steganography.py
│   ├── watermarking.py
│   └── video.py
├── core/            # Business logic
│   ├── steganography.py
│   ├── watermarking.py
│   ├── video_proc.py
│   └── utils.py
└── main.py          # FastAPI app
```

## 🎓 Nguyên Tắc Thiết Kế

1. **Separation of Concerns**: Logic tách biệt khỏi UI
2. **Type Safety**: TypeScript + Zod validation
3. **Reusability**: Custom hooks, shared components
4. **Performance**: TanStack Query caching, lazy loading
5. **Developer Experience**: Hot reload, TypeScript, ESLint

## 📄 License

MIT License

## 👥 Contributors

- Đề tài 5: Giấu tin & Nhúng thủy vân Ảnh/Video
