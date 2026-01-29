e# Docker Setup - PyStegoWatermark

Hướng dẫn chạy dự án bằng Docker.

## Yêu cầu

- Docker Desktop hoặc Docker Engine
- Docker Compose

## Cấu trúc Docker

Dự án sử dụng Docker Compose với 2 services:

- **backend**: FastAPI (Python) - Port 8000
- **frontend**: Next.js - Port 3000

## Cách sử dụng

### 1. Build và chạy tất cả services

```bash
docker-compose up --build
```

### 2. Chạy ở chế độ background

```bash
docker-compose up -d
```

### 3. Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend

# Chỉ frontend
docker-compose logs -f frontend
```

### 4. Dừng services

```bash
docker-compose down
```

### 5. Dừng và xóa volumes

```bash
docker-compose down -v
```

## Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Development với Docker

### Chạy từng service riêng lẻ

```bash
# Chỉ backend
docker-compose up backend

# Chỉ frontend
docker-compose up frontend
```

### Rebuild một service cụ thể

```bash
docker-compose up --build backend
docker-compose up --build frontend
```

### Vào shell của container

```bash
# Backend
docker exec -it pystego-backend bash

# Frontend
docker exec -it pystego-frontend sh
```

## Production Build

Để build cho production:

1. Cập nhật biến môi trường trong `docker-compose.yml`
2. Build images:

```bash
docker-compose build
```

3. Chạy:

```bash
docker-compose up -d
```

## Troubleshooting

### Port đã được sử dụng

Nếu port 3000 hoặc 8000 đã được sử dụng, sửa trong `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Thay 3001 bằng port khác
```

### Rebuild từ đầu

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Xóa tất cả containers và images

```bash
docker-compose down --rmi all
```

## Cấu hình nâng cao

### Thay đổi biến môi trường

Sửa file `docker-compose.yml` hoặc tạo file `.env`:

```env
BACKEND_PORT=8000
FRONTEND_PORT=3000
API_URL=http://backend:8000
```

### Volume mounting cho development

Volumes đã được cấu hình để sync code changes:

- Backend: `./backend:/app`
- Frontend: Code được copy vào image

Để enable hot reload cho frontend, cần thêm volume trong `docker-compose.yml`.
