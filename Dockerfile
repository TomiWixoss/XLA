# Sử dụng Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Cài đặt system dependencies cho OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Cài đặt Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ project
COPY . .

# Tạo thư mục cần thiết
RUN mkdir -p output assets temp

# Expose port cho Streamlit
EXPOSE 8501

# Health check
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# Chạy Streamlit
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0", "--server.headless=true"]
