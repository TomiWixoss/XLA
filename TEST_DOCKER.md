# 🐳 Test Docker Local

## Cài đặt Docker

### Windows
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop

### Mac
```bash
brew install --cask docker
```

### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## Build và Run

### Cách 1: Docker command

```bash
# Build image
docker build -t pystego-watermark .

# Run container
docker run -p 8501:8501 pystego-watermark
```

Truy cập: http://localhost:8501

### Cách 2: Docker Compose (Khuyến nghị)

```bash
# Build và run
docker-compose up --build

# Hoặc chạy background
docker-compose up -d
```

Truy cập: http://localhost:8501

---

## Dừng Container

```bash
# Nếu dùng docker run
docker ps  # Xem container ID
docker stop <container_id>

# Nếu dùng docker-compose
docker-compose down
```

---

## Xem Logs

```bash
# Docker run
docker logs <container_id>

# Docker compose
docker-compose logs -f
```

---

## Troubleshooting

### Lỗi: "Port already in use"

```bash
# Windows
netstat -ano | findstr :8501
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8501
kill -9 <PID>
```

### Lỗi: "Cannot connect to Docker daemon"

- Đảm bảo Docker Desktop đang chạy
- Restart Docker Desktop

### Rebuild image

```bash
# Xóa image cũ
docker rmi pystego-watermark

# Build lại
docker build -t pystego-watermark .
```

---

## Kiểm tra

✅ Container chạy: `docker ps`
✅ Logs không có lỗi: `docker logs <container_id>`
✅ Truy cập được: http://localhost:8501
✅ Upload ảnh được
✅ Các chức năng hoạt động

---

Nếu test local OK → Deploy lên Render!
