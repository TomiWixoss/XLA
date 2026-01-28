# 🚀 Quick Start Guide

## Cài đặt nhanh (5 phút)

### Bước 1: Cài đặt Python
Đảm bảo bạn đã cài Python 3.10+:
```bash
python --version
```

### Bước 2: Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### Bước 3: Chạy ứng dụng
```bash
streamlit run app.py
```

Truy cập: `http://localhost:8501`

---

## 🎯 Demo nhanh

### 1. Steganography (Giấu tin)

**Nhúng tin:**
```python
from core.steganography import LSB_Stego

# Không mã hóa
stego = LSB_Stego(use_encryption=False)
stego.embed("cover.png", "Secret message", "stego.png")

# Có mã hóa
stego_enc = LSB_Stego(use_encryption=True, password="mypass")
stego_enc.embed("cover.png", "Secret message", "stego_enc.png")
```

**Trích xuất:**
```python
# Không mã hóa
message = stego.extract("stego.png")

# Có mã hóa
message = stego_enc.extract("stego_enc.png")
```

### 2. Image Watermarking

**Nhúng watermark:**
```python
from core.watermarking import DCT_SVD_Watermark

wm = DCT_SVD_Watermark(alpha=0.1, arnold_iterations=10)
wm.embed("host.png", "logo.png", "watermarked.png")
```

**Trích xuất:**
```python
extracted = wm.extract("watermarked.png", "host.png", watermark_size=32)
```

### 3. Video Watermarking

```python
from core.video_proc import VideoWatermark

video_wm = VideoWatermark(alpha=0.1, frame_skip=5)
video_wm.embed("video.mp4", "logo.png", "watermarked_video.mp4")
```

---

## 🧪 Test hệ thống

Chạy script test:
```bash
python test_example.py
```

Script này sẽ test:
- ✅ Arnold Cat Map
- ✅ LSB Steganography (có/không mã hóa)
- ✅ DCT-SVD Watermarking
- ✅ Quality Metrics (PSNR, SSIM, NC)

---

## 📊 Hiểu các tham số

### Steganography
- `use_encryption`: Mã hóa message bằng AES-256
- `password`: Mật khẩu (bắt buộc nếu use_encryption=True)

### Watermarking
- `alpha` (0.01-0.5): Hệ số nhúng
  - Nhỏ (0.01-0.1): Vô hình hơn, kém bền
  - Lớn (0.2-0.5): Bền hơn, dễ nhìn thấy
  - **Khuyến nghị: 0.1**

- `arnold_iterations` (1-20): Số lần xáo trộn
  - Càng nhiều càng bảo mật
  - **Khuyến nghị: 10**

- `block_size`: Kích thước block DCT
  - **Mặc định: 8x8** (chuẩn JPEG)

### Video Watermarking
- `frame_skip`: Nhúng mỗi N frames
  - 1: Tất cả frames (chậm, bền nhất)
  - 5: Mỗi 5 frames (nhanh, vẫn bền)
  - **Khuyến nghị: 5**

---

## 📈 Đánh giá kết quả

### PSNR (Peak Signal-to-Noise Ratio)
- **> 40 dB**: Xuất sắc (không nhìn thấy khác biệt)
- **30-40 dB**: Tốt (khác biệt rất nhỏ)
- **20-30 dB**: Chấp nhận được
- **< 20 dB**: Kém

### SSIM (Structural Similarity)
- **> 0.95**: Xuất sắc
- **0.90-0.95**: Tốt
- **0.80-0.90**: Chấp nhận được
- **< 0.80**: Kém

### NC (Normalized Correlation)
- **> 0.9**: Watermark rất tốt
- **0.7-0.9**: Watermark tốt
- **0.5-0.7**: Watermark nhận dạng được
- **< 0.5**: Watermark bị hỏng

---

## 🎨 Tips & Tricks

### Steganography
1. **Dùng PNG/BMP**, không dùng JPG (mất dữ liệu do compression)
2. Ảnh càng lớn, capacity càng cao
3. Message dài → dùng mã hóa để bảo mật

### Image Watermarking
1. **Alpha = 0.1** là điểm cân bằng tốt
2. Test với attack simulation để kiểm tra độ bền
3. Watermark nên là ảnh đơn giản (logo, chữ)
4. Ảnh host nên có độ phân giải cao (>512x512)

### Video Watermarking
1. **Frame skip = 5** để tối ưu tốc độ
2. Video ngắn (<1 phút) để demo
3. Có thể giảm resolution video trước khi xử lý

---

## ⚠️ Troubleshooting

### Lỗi: ModuleNotFoundError
```bash
pip install -r requirements.txt --upgrade
```

### Lỗi: "Cannot read image"
- Kiểm tra đường dẫn file
- Đảm bảo file không bị corrupt
- Thử convert sang PNG

### Streamlit không chạy
```bash
# Cài lại Streamlit
pip uninstall streamlit
pip install streamlit

# Hoặc chạy với Python
python -m streamlit run app.py
```

### Video processing quá chậm
- Tăng `frame_skip` lên 10
- Giảm resolution video
- Dùng video ngắn hơn

---

## 📚 Tài liệu thêm

- [README.md](README.md): Tài liệu đầy đủ
- [test_example.py](test_example.py): Code examples
- Streamlit docs: https://docs.streamlit.io

---

## 🎓 Học thêm

### Steganography
- LSB: Thay thế bit cuối cùng của pixel
- Delimiter: Đánh dấu kết thúc message
- AES-256: Mã hóa đối xứng mạnh

### Watermarking
- **DCT**: Biến đổi miền tần số (giống JPEG)
- **Arnold Cat Map**: Xáo trộn ảnh để bảo mật
- **Mid-frequency**: Vùng tần số trung bình (bền + vô hình)

### Metrics
- **PSNR**: Đo nhiễu (càng cao càng tốt)
- **SSIM**: Đo cấu trúc (0-1, càng gần 1 càng tốt)
- **NC**: Đo tương quan (0-1, càng gần 1 càng tốt)

---

**Happy Coding! 🚀**
