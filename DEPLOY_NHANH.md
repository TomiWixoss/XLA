# ⚡ Deploy Nhanh lên Render (5 phút)

## Bước 1: Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/PyStegoWatermark.git
git push -u origin main
```

## Bước 2: Deploy trên Render

1. Vào https://render.com → Đăng ký bằng GitHub
2. Click **"New +"** → **"Web Service"**
3. Chọn repo `PyStegoWatermark`
4. Cấu hình:
   - **Name**: `pystego-watermark`
   - **Runtime**: Docker
   - **Instance Type**: Free
5. Click **"Create Web Service"**

## Bước 3: Chờ 5-10 phút

Render sẽ tự động:
- Build Docker image
- Deploy app
- Cấp URL: `https://pystego-watermark.onrender.com`

## Xong! 🎉

Truy cập URL để dùng app.

---

## Cập nhật code

```bash
git add .
git commit -m "Update"
git push
```

Render tự động deploy lại!

---

## Lưu ý

- **Free tier**: App sleep sau 15 phút không dùng
- **Wake up**: Chờ 30-60 giây lần đầu truy cập
- **RAM**: 512 MB (đủ cho demo)
- **Upgrade**: $7/tháng nếu cần luôn online

---

Xem chi tiết: [DEPLOY_RENDER.md](DEPLOY_RENDER.md)
