# 🚀 Hướng dẫn Deployment

Tài liệu này hướng dẫn cách deploy PyStegoWatermark Suite trong các môi trường khác nhau.

---

## 📋 Checklist trước khi Deploy

- [ ] Python 3.10+ đã cài đặt
- [ ] Tất cả dependencies trong requirements.txt
- [ ] Đã test trên local
- [ ] Có ảnh/video mẫu trong assets/
- [ ] Port 8501 available (cho Streamlit)

---

## 🖥️ Local Development

### 1. Setup môi trường

```bash
# Clone repository
git clone <your-repo-url>
cd PyStegoWatermark

# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Setup project
python setup.py
```

### 2. Tạo sample data

```bash
python create_sample_images.py
```

### 3. Test hệ thống

```bash
python test_example.py
```

### 4. Chạy ứng dụng

```bash
streamlit run app.py
```

Truy cập: `http://localhost:8501`

---

## 🌐 Deploy lên Streamlit Cloud (Miễn phí)

### Bước 1: Chuẩn bị Repository

1. Push code lên GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. Đảm bảo có các file:
   - `app.py`
   - `requirements.txt`
   - `core/` folder

### Bước 2: Deploy trên Streamlit Cloud

1. Truy cập: https://share.streamlit.io
2. Đăng nhập bằng GitHub
3. Click "New app"
4. Chọn repository, branch, và file `app.py`
5. Click "Deploy"

### Bước 3: Cấu hình (nếu cần)

Tạo file `.streamlit/config.toml`:

```toml
[server]
maxUploadSize = 200
enableXsrfProtection = false

[browser]
gatherUsageStats = false
```

**Lưu ý:**
- Streamlit Cloud có giới hạn 1GB RAM
- Upload file tối đa 200MB
- Video processing có thể chậm

---

## 🐳 Deploy với Docker

### Dockerfile

Tạo file `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8501

# Run app
CMD ["streamlit", "run", "app.py", "--server.address", "0.0.0.0"]
```

### Build và Run

```bash
# Build image
docker build -t pystego-watermark .

# Run container
docker run -p 8501:8501 pystego-watermark
```

### Docker Compose

Tạo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8501:8501"
    volumes:
      - ./assets:/app/assets
      - ./output:/app/output
    environment:
      - STREAMLIT_SERVER_MAX_UPLOAD_SIZE=200
```

Chạy:
```bash
docker-compose up
```

---

## ☁️ Deploy lên Cloud Platforms

### AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04, t2.medium)

2. **SSH vào instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.10 python3-pip -y

# Clone repo
git clone <your-repo>
cd PyStegoWatermark

# Install dependencies
pip3 install -r requirements.txt

# Run with nohup
nohup streamlit run app.py --server.port 8501 &
```

4. **Configure Security Group:**
   - Mở port 8501 (Custom TCP)

5. **Access:**
   - `http://your-ec2-ip:8501`

### Google Cloud Platform (GCP)

1. **Create VM instance** (e2-medium, Ubuntu)

2. **Setup tương tự AWS EC2**

3. **Configure Firewall:**
```bash
gcloud compute firewall-rules create allow-streamlit \
    --allow tcp:8501 \
    --source-ranges 0.0.0.0/0
```

### Heroku

1. **Tạo `Procfile`:**
```
web: streamlit run app.py --server.port $PORT
```

2. **Tạo `setup.sh`:**
```bash
mkdir -p ~/.streamlit/
echo "[server]
headless = true
port = $PORT
enableCORS = false
" > ~/.streamlit/config.toml
```

3. **Deploy:**
```bash
heroku login
heroku create your-app-name
git push heroku main
```

**Lưu ý:** Heroku free tier có giới hạn RAM và dyno hours.

---

## 🔒 Production Best Practices

### 1. Security

```python
# Thêm authentication (ví dụ với streamlit-authenticator)
import streamlit_authenticator as stauth

authenticator = stauth.Authenticate(
    credentials,
    'cookie_name',
    'signature_key',
    cookie_expiry_days=30
)

name, authentication_status, username = authenticator.login('Login', 'main')

if authentication_status:
    # Show app
    pass
elif authentication_status == False:
    st.error('Username/password is incorrect')
```

### 2. Rate Limiting

```python
import time
from functools import wraps

def rate_limit(max_calls=5, time_window=60):
    calls = []
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            calls[:] = [c for c in calls if c > now - time_window]
            
            if len(calls) >= max_calls:
                st.error("Too many requests. Please wait.")
                return None
            
            calls.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

### 3. Logging

```python
import logging

logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Trong code
logger.info(f"User uploaded image: {filename}")
logger.error(f"Error processing: {str(e)}")
```

### 4. Error Handling

```python
try:
    result = process_image(image)
except Exception as e:
    logger.error(f"Error: {str(e)}")
    st.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    # Không hiển thị stack trace cho user
```

### 5. Performance Optimization

```python
# Cache expensive operations
@st.cache_data
def load_model():
    return expensive_operation()

# Cleanup temp files
import atexit
import tempfile

def cleanup():
    # Remove temp files
    pass

atexit.register(cleanup)
```

---

## 📊 Monitoring

### 1. Streamlit Analytics

Thêm vào `app.py`:

```python
import streamlit as st

# Track usage
if 'page_views' not in st.session_state:
    st.session_state.page_views = 0

st.session_state.page_views += 1
```

### 2. External Monitoring

- **Google Analytics**: Thêm tracking code
- **Sentry**: Error tracking
- **Prometheus**: Metrics collection

---

## 🔧 Troubleshooting

### Lỗi: "Address already in use"

```bash
# Tìm process đang dùng port 8501
# Windows:
netstat -ano | findstr :8501
taskkill /PID <PID> /F

# Linux:
lsof -i :8501
kill -9 <PID>
```

### Lỗi: "ModuleNotFoundError"

```bash
pip install -r requirements.txt --upgrade
```

### Lỗi: "Out of memory"

- Giảm kích thước ảnh/video
- Tăng RAM của server
- Optimize code (xử lý từng phần)

### Streamlit chậm

```bash
# Disable file watcher
streamlit run app.py --server.fileWatcherType none

# Increase max message size
streamlit run app.py --server.maxMessageSize 200
```

---

## 📈 Scaling

### Horizontal Scaling

Sử dụng load balancer (nginx):

```nginx
upstream streamlit {
    server localhost:8501;
    server localhost:8502;
    server localhost:8503;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://streamlit;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Vertical Scaling

- Tăng RAM/CPU của server
- Sử dụng GPU cho video processing (nếu có)

---

## 🎯 Checklist Deploy Production

- [ ] Code đã được test kỹ
- [ ] Có error handling đầy đủ
- [ ] Có logging
- [ ] Có rate limiting
- [ ] Có authentication (nếu cần)
- [ ] Cleanup temp files
- [ ] Optimize performance
- [ ] Setup monitoring
- [ ] Backup data
- [ ] Document API/usage
- [ ] SSL certificate (HTTPS)
- [ ] Domain name configured

---

## 📞 Support

Nếu gặp vấn đề khi deploy:
1. Check logs: `app.log`
2. Check Streamlit logs: `~/.streamlit/`
3. Create issue trên GitHub
4. Contact: [your-email]

---

**Good luck with deployment! 🚀**
