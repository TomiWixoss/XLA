# 🚀 Hướng dẫn Deploy lên Render

## 📋 Yêu cầu

- Tài khoản GitHub (miễn phí)
- Tài khoản Render (miễn phí)
- Code đã push lên GitHub

---

## 🔧 Bước 1: Chuẩn bị Code

### 1.1. Tạo GitHub Repository

```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - PyStegoWatermark Suite"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/YOUR_USERNAME/PyStegoWatermark.git
git branch -M main
git push -u origin main
```

### 1.2. Kiểm tra các file cần thiết

Đảm bảo có các file sau:
- ✅ `Dockerfile`
- ✅ `requirements.txt`
- ✅ `render.yaml`
- ✅ `.dockerignore`
- ✅ `app.py`
- ✅ Thư mục `core/`

---

## 🌐 Bước 2: Deploy lên Render

### 2.1. Đăng ký Render

1. Truy cập: https://render.com
2. Click **"Get Started"**
3. Đăng ký bằng GitHub account

### 2.2. Tạo Web Service mới

1. Sau khi đăng nhập, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Chọn repository `PyStegoWatermark` từ GitHub
   - Click **"Connect"**

3. **Cấu hình Service:**

   ```
   Name: pystego-watermark
   Region: Singapore (hoặc gần bạn nhất)
   Branch: main
   Runtime: Docker
   Instance Type: Free
   ```

4. **Environment Variables** (Tự động từ render.yaml):
   - Render sẽ tự động đọc từ file `render.yaml`
   - Hoặc thêm thủ công:
     ```
     STREAMLIT_SERVER_PORT = 8501
     STREAMLIT_SERVER_ADDRESS = 0.0.0.0
     STREAMLIT_SERVER_HEADLESS = true
     ```

5. Click **"Create Web Service"**

### 2.3. Chờ Deploy

- Render sẽ tự động:
  1. Clone code từ GitHub
  2. Build Docker image
  3. Deploy container
  4. Cấp domain miễn phí: `https://pystego-watermark.onrender.com`

- Thời gian: **5-10 phút** (lần đầu)

---

## ✅ Bước 3: Kiểm tra

### 3.1. Xem Logs

Trong Render Dashboard:
- Click vào service `pystego-watermark`
- Tab **"Logs"** để xem quá trình deploy

### 3.2. Truy cập App

Sau khi deploy xong:
- URL: `https://pystego-watermark.onrender.com`
- Hoặc click **"Open"** trong Render Dashboard

### 3.3. Test chức năng

1. Thử upload ảnh
2. Test giấu tin
3. Test thủy vân

---

## 🔄 Bước 4: Cập nhật Code

Mỗi khi sửa code:

```bash
# Commit changes
git add .
git commit -m "Update: mô tả thay đổi"

# Push lên GitHub
git push origin main
```

**Render sẽ tự động deploy lại!** (Auto-deploy)

---

## ⚙️ Cấu hình Nâng cao

### Tăng Memory/CPU (Nếu cần)

Render Free tier:
- RAM: 512 MB
- CPU: 0.1 vCPU
- Disk: 1 GB

Nếu cần nhiều hơn → Upgrade plan:
- Starter: $7/tháng (512 MB RAM)
- Standard: $25/tháng (2 GB RAM)

### Custom Domain

1. Trong Render Dashboard → **"Settings"**
2. **"Custom Domain"** → Thêm domain của bạn
3. Cấu hình DNS theo hướng dẫn

### Environment Variables

Thêm biến môi trường:
1. **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Ví dụ:
   ```
   MAX_UPLOAD_SIZE = 200
   DEBUG = false
   ```

---

## 🐛 Troubleshooting

### Lỗi: "Build failed"

**Nguyên nhân:** Thiếu dependencies

**Giải pháp:**
```bash
# Kiểm tra requirements.txt
pip freeze > requirements.txt

# Commit và push lại
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Lỗi: "Out of memory"

**Nguyên nhân:** Free tier chỉ có 512 MB RAM

**Giải pháp:**
1. Giảm kích thước ảnh/video test
2. Tối ưu code
3. Hoặc upgrade plan

### Lỗi: "Service unavailable"

**Nguyên nhân:** Render free tier sleep sau 15 phút không dùng

**Giải pháp:**
- Chờ 30-60 giây để service wake up
- Hoặc upgrade để luôn online

### App chạy chậm

**Nguyên nhân:** Free tier CPU yếu

**Giải pháp:**
1. Giảm `frame_skip` trong video processing
2. Dùng ảnh nhỏ hơn để test
3. Upgrade plan nếu cần

---

## 📊 So sánh Hosting

| Platform | Free Tier | RAM | CPU | Auto-deploy | Docker |
|----------|-----------|-----|-----|-------------|--------|
| **Render** | ✅ | 512 MB | 0.1 vCPU | ✅ | ✅ |
| Heroku | ❌ (Đã tính phí) | - | - | ✅ | ✅ |
| Railway | ✅ ($5 credit) | 512 MB | Shared | ✅ | ✅ |
| Fly.io | ✅ | 256 MB | Shared | ✅ | ✅ |

**Khuyến nghị: Render** (Dễ dùng, free tier tốt)

---

## 🔒 Bảo mật

### Thêm Authentication (Nếu cần)

Cài thêm package:
```bash
pip install streamlit-authenticator
```

Thêm vào `app.py`:
```python
import streamlit_authenticator as stauth

# Cấu hình users
credentials = {
    'usernames': {
        'admin': {
            'name': 'Admin',
            'password': 'hashed_password_here'
        }
    }
}

authenticator = stauth.Authenticate(
    credentials,
    'cookie_name',
    'signature_key',
    cookie_expiry_days=30
)

name, authentication_status, username = authenticator.login('Login', 'main')

if authentication_status:
    # Show app
    st.write(f'Welcome {name}')
    # ... rest of app
elif authentication_status == False:
    st.error('Username/password is incorrect')
```

---

## 📈 Monitoring

### Xem Metrics

Trong Render Dashboard:
- **"Metrics"** tab
- Xem CPU, RAM, Network usage

### Logs

- **"Logs"** tab
- Real-time logs
- Filter by level (Info, Warning, Error)

---

## 💰 Chi phí

### Free Tier (Đủ cho demo)
- ✅ 750 giờ/tháng
- ✅ Auto-sleep sau 15 phút
- ✅ 512 MB RAM
- ✅ 1 GB disk

### Nếu cần upgrade
- **Starter**: $7/tháng
  - Luôn online
  - 512 MB RAM
  - 10 GB disk

---

## 🎯 Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] Có file `Dockerfile`
- [ ] Có file `requirements.txt`
- [ ] Có file `render.yaml`
- [ ] Đã tạo Render account
- [ ] Đã connect GitHub với Render
- [ ] Đã tạo Web Service
- [ ] Deploy thành công
- [ ] Test app hoạt động
- [ ] Share link với người khác

---

## 🔗 Links hữu ích

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Streamlit Docs: https://docs.streamlit.io
- Docker Docs: https://docs.docker.com

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trong Render Dashboard
2. Google error message
3. Hỏi trên Render Community: https://community.render.com
4. Tạo issue trên GitHub repo

---

**Chúc bạn deploy thành công! 🎉**

URL demo: `https://pystego-watermark.onrender.com`
