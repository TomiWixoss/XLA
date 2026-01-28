# 📐 Chi tiết Thuật toán

Tài liệu này giải thích chi tiết các thuật toán được sử dụng trong PyStegoWatermark Suite.

---

## 1. LSB Steganography (Least Significant Bit)

### Nguyên lý

LSB là kỹ thuật giấu tin đơn giản nhất, dựa trên việc thay thế bit cuối cùng (LSB) của mỗi byte pixel.

### Tại sao LSB hoạt động?

Trong ảnh 8-bit (0-255), thay đổi bit cuối cùng chỉ làm thay đổi giá trị pixel ±1, không thể nhận biết bằng mắt thường.

**Ví dụ:**
```
Pixel gốc:     10110101 (181)
Thay LSB = 0:  10110100 (180)  → Chênh lệch: 1
Thay LSB = 1:  10110101 (181)  → Không đổi
```

### Thuật toán Embedding

```python
def embed(image, message):
    # 1. Chuyển message sang binary
    binary = text_to_binary(message + DELIMITER)
    
    # 2. Flatten ảnh thành 1D array
    pixels = image.flatten()
    
    # 3. Nhúng từng bit
    for i, bit in enumerate(binary):
        pixels[i] = (pixels[i] & 0xFE) | int(bit)
        # 0xFE = 11111110 (xóa LSB)
        # | int(bit) (set LSB mới)
    
    # 4. Reshape về ảnh gốc
    return pixels.reshape(image.shape)
```

### Thuật toán Extraction

```python
def extract(stego_image):
    # 1. Flatten ảnh
    pixels = stego_image.flatten()
    
    # 2. Trích xuất LSB
    binary = ''.join(str(pixel & 1) for pixel in pixels)
    
    # 3. Chuyển binary sang text
    message = binary_to_text(binary)
    
    # 4. Tìm delimiter và cắt
    return message.split(DELIMITER)[0]
```

### Capacity

Với ảnh RGB kích thước `H × W`:
- **Capacity** = `H × W × 3` bits (3 channels: R, G, B)
- **Ví dụ**: Ảnh 512×512 → 786,432 bits = 98,304 bytes ≈ 98 KB

### Ưu điểm
- ✅ Đơn giản, dễ implement
- ✅ PSNR rất cao (>50 dB)
- ✅ Không nhìn thấy khác biệt

### Nhược điểm
- ❌ Dễ bị phát hiện bằng phân tích thống kê
- ❌ Không bền với compression (JPEG)
- ❌ Dễ bị phá hủy khi crop/resize

---

## 2. DCT-SVD Watermarking

### Nguyên lý

Kết hợp 3 kỹ thuật:
1. **DCT** (Discrete Cosine Transform): Biến đổi sang miền tần số
2. **SVD** (Singular Value Decomposition): Phân tích ma trận
3. **Arnold Cat Map**: Xáo trộn watermark

### 2.1. DCT (Discrete Cosine Transform)

DCT chuyển ảnh từ miền không gian sang miền tần số, tương tự JPEG compression.

**Công thức 2D-DCT:**

```
F(u,v) = α(u)α(v) Σ Σ f(x,y) cos[π(2x+1)u/2N] cos[π(2y+1)v/2N]
```

**Ý nghĩa:**
- **Low frequency** (góc trên trái): Thông tin chính của ảnh
- **Mid frequency** (giữa): Vùng tốt để nhúng watermark
- **High frequency** (góc dưới phải): Chi tiết, nhiễu

**Tại sao nhúng vào mid-frequency?**
- Low frequency: Quan trọng, thay đổi → ảnh bị méo
- High frequency: Dễ bị mất khi compression
- **Mid frequency**: Cân bằng giữa vô hình và bền vững

### 2.2. Arnold Cat Map

Xáo trộn ảnh để tăng bảo mật.

**Công thức:**

```
[x']   [1  1] [x]
[y'] = [1  2] [y]  (mod N)
```

**Đặc điểm:**
- Là phép biến đổi **chaotic** (hỗn loạn)
- Sau một số lần lặp nhất định, ảnh sẽ trở về gốc (periodic)
- Với ảnh 64×64, chu kỳ ≈ 48 iterations

**Ví dụ:**

```
Original:        After 1 iter:    After 5 iters:
█████            █ █ █            ▓▒░▓▒
█   █     →      ██  █     →      ░▓▒░▓
█████            █ ███            ▒░▓▒░
```

### 2.3. Thuật toán Embedding

```python
def embed_watermark(host_image, watermark, alpha=0.1):
    # 1. Chuẩn bị watermark
    wm_binary = preprocess_watermark(watermark)
    wm_scrambled = arnold_cat_map(wm_binary, iterations=10)
    
    # 2. Chia host image thành blocks 8×8
    blocks = divide_into_blocks(host_image, block_size=8)
    
    # 3. Với mỗi block
    for i, block in enumerate(blocks):
        # 3.1. Áp dụng DCT
        dct_block = DCT_2D(block)
        
        # 3.2. Chọn mid-frequency coefficients
        # Ví dụ: vị trí (3,4) và (4,3)
        coef1 = dct_block[3, 4]
        coef2 = dct_block[4, 3]
        
        # 3.3. Nhúng watermark bit
        if wm_scrambled[i] == 1:
            dct_block[3, 4] = coef1 + alpha * abs(coef1)
            dct_block[4, 3] = coef2 + alpha * abs(coef2)
        else:
            dct_block[3, 4] = coef1 - alpha * abs(coef1)
            dct_block[4, 3] = coef2 - alpha * abs(coef2)
        
        # 3.4. Inverse DCT
        blocks[i] = IDCT_2D(dct_block)
    
    # 4. Ghép blocks thành ảnh
    return merge_blocks(blocks)
```

### 2.4. Thuật toán Extraction

```python
def extract_watermark(watermarked_image, original_image):
    # 1. Chia cả 2 ảnh thành blocks
    wm_blocks = divide_into_blocks(watermarked_image, 8)
    orig_blocks = divide_into_blocks(original_image, 8)
    
    # 2. Trích xuất bits
    extracted_bits = []
    
    for wm_block, orig_block in zip(wm_blocks, orig_blocks):
        # 2.1. DCT
        dct_wm = DCT_2D(wm_block)
        dct_orig = DCT_2D(orig_block)
        
        # 2.2. So sánh mid-frequency
        diff1 = dct_wm[3,4] - dct_orig[3,4]
        diff2 = dct_wm[4,3] - dct_orig[4,3]
        avg_diff = (diff1 + diff2) / 2
        
        # 2.3. Trích xuất bit
        bit = 1 if avg_diff > 0 else 0
        extracted_bits.append(bit)
    
    # 3. Reshape và inverse Arnold
    extracted_wm = reshape(extracted_bits)
    return inverse_arnold_cat_map(extracted_wm, iterations=10)
```

### Tham số Alpha

Alpha điều khiển độ mạnh của watermark:

| Alpha | PSNR | Độ vô hình | Độ bền | Khuyến nghị |
|-------|------|------------|--------|-------------|
| 0.01  | >45  | Xuất sắc   | Yếu    | Ảnh nghệ thuật |
| 0.05  | 40-45| Rất tốt    | Trung bình | Ảnh thương mại |
| **0.1** | **35-40** | **Tốt** | **Tốt** | **Đề xuất** |
| 0.2   | 30-35| Chấp nhận  | Rất tốt | Bảo mật cao |
| 0.5   | <30  | Nhìn thấy  | Xuất sắc | Không khuyến nghị |

### Ưu điểm
- ✅ Bền với JPEG compression
- ✅ Bền với nhiễu, crop nhỏ
- ✅ Bảo mật cao (Arnold scrambling)
- ✅ Điều chỉnh được độ bền/vô hình

### Nhược điểm
- ❌ Phức tạp hơn LSB
- ❌ Cần ảnh gốc để trích xuất (non-blind)
- ❌ Tốc độ chậm hơn

---

## 3. Video Watermarking

### Nguyên lý

Áp dụng Image Watermarking lên từng frame của video.

### Thuật toán

```python
def embed_video_watermark(video, watermark, frame_skip=5):
    # 1. Phân rã video thành frames
    frames = extract_frames(video)
    
    # 2. Nhúng watermark vào selected frames
    watermarked_frames = []
    
    for i, frame in enumerate(frames):
        if i % frame_skip == 0:
            # Nhúng watermark
            wm_frame = embed_watermark(frame, watermark)
            watermarked_frames.append(wm_frame)
        else:
            # Giữ nguyên
            watermarked_frames.append(frame)
    
    # 3. Tái tạo video
    return create_video(watermarked_frames, fps=original_fps)
```

### Frame Skip Strategy

| Frame Skip | Frames nhúng | Tốc độ | Độ bền | Khuyến nghị |
|------------|--------------|--------|--------|-------------|
| 1          | 100%         | Chậm   | Cao nhất | Video quan trọng |
| **5**      | **20%**      | **Nhanh** | **Tốt** | **Đề xuất** |
| 10         | 10%          | Rất nhanh | Trung bình | Demo nhanh |
| 30         | 3.3%         | Cực nhanh | Thấp | Không khuyến nghị |

### Ưu điểm
- ✅ Bảo vệ bản quyền video
- ✅ Có thể điều chỉnh tốc độ/độ bền
- ✅ Watermark tồn tại qua nhiều frames

### Nhược điểm
- ❌ Tốn thời gian xử lý
- ❌ File size có thể tăng
- ❌ Cần nhiều RAM cho video dài

---

## 4. Quality Metrics

### 4.1. MSE (Mean Squared Error)

```
MSE = (1/MN) Σ Σ [I(i,j) - K(i,j)]²
```

- **Ý nghĩa**: Sai số bình phương trung bình
- **Giá trị tốt**: < 100
- **Nhược điểm**: Không phản ánh perception của mắt người

### 4.2. PSNR (Peak Signal-to-Noise Ratio)

```
PSNR = 10 log₁₀(MAX²/MSE)
```

- **Ý nghĩa**: Tỷ số tín hiệu trên nhiễu (dB)
- **Giá trị tốt**: > 30 dB
- **Ưu điểm**: Dễ tính, phổ biến

### 4.3. SSIM (Structural Similarity Index)

```
SSIM(x,y) = [l(x,y)]^α · [c(x,y)]^β · [s(x,y)]^γ
```

Trong đó:
- `l(x,y)`: Luminance comparison
- `c(x,y)`: Contrast comparison
- `s(x,y)`: Structure comparison

- **Ý nghĩa**: Độ tương đồng cấu trúc (0-1)
- **Giá trị tốt**: > 0.9
- **Ưu điểm**: Phản ánh perception tốt hơn PSNR

### 4.4. NC (Normalized Correlation)

```
NC = Σ(W·W') / √[Σ(W²)·Σ(W'²)]
```

- **Ý nghĩa**: Tương quan giữa watermark gốc và trích xuất
- **Giá trị tốt**: > 0.8
- **Ứng dụng**: Đánh giá độ bền watermark

---

## 5. Attack Simulation

### 5.1. JPEG Compression

```python
def jpeg_attack(image, quality=50):
    encode_param = [cv2.IMWRITE_JPEG_QUALITY, quality]
    _, encoded = cv2.imencode('.jpg', image, encode_param)
    return cv2.imdecode(encoded, cv2.IMREAD_COLOR)
```

**Ảnh hưởng:**
- Quality 90-100: Ít ảnh hưởng
- Quality 50-90: Ảnh hưởng trung bình
- Quality <50: Ảnh hưởng lớn

### 5.2. Gaussian Noise

```python
def noise_attack(image, std=25):
    noise = np.random.normal(0, std, image.shape)
    return np.clip(image + noise, 0, 255).astype(np.uint8)
```

**Ảnh hưởng:**
- std <10: Ít ảnh hưởng
- std 10-30: Ảnh hưởng trung bình
- std >30: Ảnh hưởng lớn

### 5.3. Crop Attack

```python
def crop_attack(image, crop_percent=0.2):
    h, w = image.shape[:2]
    crop_h = int(h * crop_percent)
    crop_w = int(w * crop_percent)
    cropped = image[crop_h:h-crop_h, crop_w:w-crop_w]
    return cv2.resize(cropped, (w, h))
```

**Ảnh hưởng:**
- <10%: Ít ảnh hưởng
- 10-30%: Ảnh hưởng lớn
- >30%: Watermark có thể mất

---

## 6. So sánh Thuật toán

| Tiêu chí | LSB | DCT-SVD |
|----------|-----|---------|
| **Độ phức tạp** | Thấp | Cao |
| **PSNR** | >50 dB | 35-40 dB |
| **Capacity** | Cao | Thấp |
| **Bền với JPEG** | ❌ | ✅ |
| **Bền với Noise** | ❌ | ✅ |
| **Bền với Crop** | ❌ | ⚠️ |
| **Bảo mật** | Thấp | Cao |
| **Tốc độ** | Nhanh | Chậm |
| **Ứng dụng** | Giấu tin | Watermark |

---

## 7. Tài liệu tham khảo

1. **LSB Steganography**:
   - Chan, C. K., & Cheng, L. M. (2004). "Hiding data in images by simple LSB substitution"

2. **DCT Watermarking**:
   - Cox, I. J., et al. (2007). "Digital Watermarking and Steganography"

3. **Arnold Cat Map**:
   - Arnold, V. I., & Avez, A. (1968). "Ergodic Problems of Classical Mechanics"

4. **SSIM**:
   - Wang, Z., et al. (2004). "Image quality assessment: from error visibility to structural similarity"

---

**📚 Để hiểu sâu hơn, đọc code trong thư mục `core/`**
