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

## 2. DWT-DCT-SVD Watermarking (CHUẨN HỌC THUẬT)

### Nguyên lý

Kết hợp 4 kỹ thuật theo chuẩn học thuật:
1. **DWT** (Discrete Wavelet Transform): Phân tích multi-resolution
2. **DCT** (Discrete Cosine Transform): Biến đổi sang miền tần số
3. **SVD** (Singular Value Decomposition): Phân tích ma trận
4. **Arnold Cat Map**: Xáo trộn watermark

**Tài liệu tham khảo**:
- DWT, DCT and SVD Based Digital Image Watermarking (2012)
- Exploring DWT–SVD–DCT for JPEG Robustness (2014)

### 2.1. DWT (Discrete Wavelet Transform)

DWT phân tích ảnh thành 4 sub-bands ở các tần số khác nhau:

```
┌─────────┬─────────┐
│   LL    │   LH    │  LL: Low-Low (approximation)
│ (Low)   │ (Horiz) │  LH: Low-High (horizontal details)
├─────────┼─────────┤
│   HL    │   HH    │  HL: High-Low (vertical details)
│ (Vert)  │ (Diag)  │  HH: High-High (diagonal details)
└─────────┴─────────┘
```

**Ý nghĩa**:
- **LL sub-band**: Chứa thông tin chính, nhúng vào đây → imperceptibility cao
- **LH sub-band**: Mid-frequency, nhúng vào đây → robustness cao
- **HL, HH**: High-frequency, dễ bị mất khi compression

**Tại sao cần DWT?**
- Multi-resolution analysis
- Exceptional robustness against JPEG/JPEG2000 (theo paper 2014)
- Tốt hơn 46% so với DCT-only

### 2.2. DCT (Discrete Cosine Transform)

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

### 2.3. SVD (Singular Value Decomposition)

SVD phân tích ma trận DCT thành 3 ma trận:

**Công thức:**
```
DCT_block = U × S × V^T
```

Trong đó:
- **U**: Left singular vectors (8×8)
- **S**: Singular values (8×1) - diagonal matrix
- **V^T**: Right singular vectors (8×8)

**Tại sao nhúng vào Singular Values?**
- S[0] (largest singular value) chứa năng lượng chính của block
- Modify S[0] → ảnh hưởng toàn bộ block nhưng vẫn imperceptible
- Robust với geometric attacks và compression

**Thuật toán nhúng vào SVD:**
```python
# 1. SVD decomposition
U, S, Vt = np.linalg.svd(dct_block)

# 2. Modify largest singular value
if watermark_bit == 1:
    S[0] = S[0] * (1 + alpha)  # Tăng
else:
    S[0] = S[0] * (1 - alpha)  # Giảm

# 3. Reconstruct
dct_block_modified = U @ diag(S) @ Vt
```

### 2.4. Arnold Cat Map

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

### 2.5. Thuật toán Embedding (DWT-DCT-SVD)

```python
def embed_watermark(host_image, watermark, alpha=0.1):
    # 1. Chuẩn bị watermark
    wm_binary = preprocess_watermark(watermark)
    wm_scrambled = arnold_cat_map(wm_binary, iterations=10)
    
    # 2. Chuyển sang YCrCb, lấy kênh Y
    host_y = rgb_to_ycrcb(host_image)[:,:,0]
    
    # 3. DWT Transform (LAYER 1)
    LL, (LH, HL, HH) = dwt2(host_y, 'haar')
    selected_band = LL  # Chọn LL cho imperceptibility
    
    # 4. Chia selected_band thành blocks 8×8
    blocks = divide_into_blocks(selected_band, block_size=8)
    
    # 5. Với mỗi block
    for i, block in enumerate(blocks):
        # 5.1. DCT Transform (LAYER 2)
        dct_block = DCT_2D(block)
        
        # 5.2. SVD Decomposition (LAYER 3)
        U, S, Vt = SVD(dct_block)
        
        # 5.3. Nhúng watermark vào singular value
        if wm_scrambled[i] == 1:
            S[0] = S[0] * (1 + alpha)
        else:
            S[0] = S[0] * (1 - alpha)
        
        # 5.4. Reconstruct DCT block
        dct_block_modified = U @ diag(S) @ Vt
        
        # 5.5. Inverse DCT
        blocks[i] = IDCT_2D(dct_block_modified)
    
    # 6. Ghép blocks thành selected_band
    selected_band_modified = merge_blocks(blocks)
    
    # 7. Inverse DWT
    host_y_watermarked = idwt2((selected_band_modified, (LH, HL, HH)), 'haar')
    
    # 8. Chuyển về BGR
    return ycrcb_to_bgr(host_y_watermarked)
```

### 2.6. Thuật toán Extraction (DWT-DCT-SVD)

```python
def extract_watermark(watermarked_image, original_image):
    # 1. Chuyển sang YCrCb
    wm_y = rgb_to_ycrcb(watermarked_image)[:,:,0]
    orig_y = rgb_to_ycrcb(original_image)[:,:,0]
    
    # 2. DWT Transform
    LL_wm, _ = dwt2(wm_y, 'haar')
    LL_orig, _ = dwt2(orig_y, 'haar')
    
    # 3. Chia thành blocks
    wm_blocks = divide_into_blocks(LL_wm, 8)
    orig_blocks = divide_into_blocks(LL_orig, 8)
    
    # 4. Trích xuất bits
    extracted_bits = []
    
    for wm_block, orig_block in zip(wm_blocks, orig_blocks):
        # 4.1. DCT
        dct_wm = DCT_2D(wm_block)
        dct_orig = DCT_2D(orig_block)
        
        # 4.2. SVD
        _, S_wm, _ = SVD(dct_wm)
        _, S_orig, _ = SVD(dct_orig)
        
        # 4.3. So sánh singular values
        ratio = S_wm[0] / S_orig[0]
        
        # 4.4. Trích xuất bit
        bit = 1 if ratio > 1 else 0
        extracted_bits.append(bit)
    
    # 5. Reshape và inverse Arnold
    extracted_wm = reshape(extracted_bits)
    return inverse_arnold_cat_map(extracted_wm, iterations=10)
```

### Tham số Alpha

Alpha điều khiển độ mạnh của watermark trong SVD:

| Alpha | PSNR | Độ vô hình | Độ bền | Khuyến nghị |
|-------|------|------------|--------|-------------|
| 0.01  | >45  | Xuất sắc   | Yếu    | Ảnh nghệ thuật |
| 0.05  | 40-45| Rất tốt    | Trung bình | Ảnh thương mại |
| **0.1** | **35-40** | **Tốt** | **Tốt** | **Đề xuất** |
| 0.2   | 30-35| Chấp nhận  | Rất tốt | Bảo mật cao |
| 0.5   | <30  | Nhìn thấy  | Xuất sắc | Không khuyến nghị |

### Ưu điểm DWT-DCT-SVD
- ✅ **Exceptional robustness** với JPEG/JPEG2000 compression (theo paper 2014)
- ✅ Bền với nhiễu, crop, rotation
- ✅ Bảo mật cao (Arnold scrambling + SVD)
- ✅ Multi-resolution analysis (DWT)
- ✅ Tốt hơn 46% so với DCT-only (theo paper)
- ✅ Điều chỉnh được độ bền/vô hình

### Nhược điểm
- ❌ Phức tạp hơn LSB (3 layers transform)
- ❌ Cần ảnh gốc để trích xuất (non-blind)
- ❌ Tốc độ chậm hơn (do DWT + DCT + SVD)
- ❌ Cần nhiều RAM hơn

---

## 3. Video Watermarking (CHUẨN HỌC THUẬT)

### Nguyên lý

Áp dụng DWT-DCT-SVD Watermarking lên video với **Scene Change Detection** để tối ưu hiệu suất.

**Tài liệu tham khảo**:
- A Robust Color Video Watermarking Technique Using DWT, SVD and Frame Difference (2017)
- A Blind Video Watermarking Scheme based on Scene Change Detection (2009)
- Hybrid quasi-3D DWT/DCT and SVD video watermarking (2010)

### 3.1. Scene Change Detection (CHUẨN HỌC THUẬT)

Phát hiện thay đổi cảnh bằng **Histogram Difference Method**:

```python
def detect_scene_changes(video, threshold=30.0):
    """
    Thuật toán theo paper 2017:
    1. Tính histogram cho mỗi frame (RGB channels)
    2. So sánh histogram giữa frame hiện tại và frame trước
    3. Nếu difference > threshold → scene change
    """
    scene_frames = [0]  # Frame đầu tiên
    prev_hist = None
    
    for frame_idx, frame in enumerate(video):
        # Tính histogram cho 3 channels
        hist_b = cv2.calcHist([frame], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([frame], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([frame], [2], None, [256], [0, 256])
        
        # Normalize và concatenate
        hist_b = cv2.normalize(hist_b, hist_b).flatten()
        hist_g = cv2.normalize(hist_g, hist_g).flatten()
        hist_r = cv2.normalize(hist_r, hist_r).flatten()
        current_hist = np.concatenate([hist_b, hist_g, hist_r])
        
        if prev_hist is not None:
            # Tính Mean Absolute Difference
            diff = np.mean(np.abs(current_hist - prev_hist)) * 100
            
            if diff > threshold:
                scene_frames.append(frame_idx)
        
        prev_hist = current_hist
    
    return scene_frames
```

### 3.2. Smart Frame Selection

Kết hợp 2 strategies:
1. **Scene Change Frames**: Frames có thay đổi cảnh (key frames)
2. **Periodic Frames**: Mỗi N frames để đảm bảo coverage

```python
def select_key_frames(video, frame_skip=5, use_scene_detection=True):
    if use_scene_detection:
        # Phát hiện scene changes
        scene_frames = detect_scene_changes(video)
        
        # Thêm periodic frames
        periodic_frames = list(range(0, len(video), frame_skip))
        
        # Merge và loại bỏ duplicates
        key_frames = sorted(list(set(scene_frames + periodic_frames)))
    else:
        # Fallback: chỉ dùng periodic frames
        key_frames = list(range(0, len(video), frame_skip))
    
    return key_frames
```

### 3.3. Embedding Algorithm

```python
def embed_video_watermark(video, watermark, frame_skip=5, 
                         use_scene_detection=True, scene_threshold=30.0):
    """
    Thuật toán theo paper 2017:
    1. Phát hiện scene changes
    2. Chỉ nhúng watermark vào key frames
    3. Giảm thời gian xử lý 24x
    """
    # 1. Chọn key frames
    key_frames = select_key_frames(video, frame_skip, use_scene_detection)
    
    # 2. Nhúng watermark vào key frames
    watermarked_frames = []
    
    for i, frame in enumerate(video):
        if i in key_frames:
            # Nhúng watermark bằng DWT-DCT-SVD
            wm_frame = dwt_dct_svd_embed(frame, watermark)
            watermarked_frames.append(wm_frame)
        else:
            # Giữ nguyên frame
            watermarked_frames.append(frame)
    
    # 3. Tái tạo video
    return create_video(watermarked_frames, fps=original_fps)
```

### 3.4. Performance Comparison

| Method | Frames Watermarked | Processing Time | Robustness | Paper Reference |
|--------|-------------------|-----------------|------------|-----------------|
| **All Frames** | 100% | 95.0s | Highest | Traditional |
| **Fixed Skip (5)** | 20% | 19.0s | High | Common |
| **Scene Detection** | 15-25% | **3.975s** | **High** | **Paper 2017** |

**Kết quả theo paper 2017**:
- ✅ Giảm thời gian xử lý **24x** (từ 95s xuống 3.975s)
- ✅ Vẫn duy trì robustness cao (PSNR > 65 dB)
- ✅ Correlation coefficient > 0.9 sau attacks

### 3.5. Scene Threshold Selection

| Threshold | Scene Changes Detected | Sensitivity | Khuyến nghị |
|-----------|----------------------|-------------|-------------|
| 10.0      | Nhiều (sensitive)    | Cao         | Video động nhiều |
| **30.0**  | **Vừa phải**        | **Trung bình** | **Đề xuất** |
| 50.0      | Ít (conservative)    | Thấp        | Video tĩnh |

### Ưu điểm
- ✅ **Hiệu suất cao**: Giảm 24x thời gian xử lý
- ✅ **Smart selection**: Chỉ watermark key frames quan trọng
- ✅ **Robustness**: Vẫn bền với attacks (PSNR > 65 dB)
- ✅ **Adaptive**: Tự động phát hiện scene changes

### Nhược điểm
- ❌ Cần thêm bước scene detection (nhưng rất nhanh)
- ❌ Phụ thuộc vào threshold (cần tune cho từng loại video)

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

| Tiêu chí | LSB | DWT-DCT-SVD |
|----------|-----|-------------|
| **Độ phức tạp** | Thấp | Rất cao (3 layers) |
| **PSNR** | >50 dB | 35-40 dB |
| **Capacity** | Cao | Thấp |
| **Bền với JPEG** | ❌ | ✅✅ (Exceptional) |
| **Bền với Noise** | ❌ | ✅✅ |
| **Bền với Crop** | ❌ | ⚠️ |
| **Bền với Rotation** | ❌ | ✅ |
| **Bảo mật** | Thấp | Rất cao |
| **Tốc độ** | Rất nhanh | Chậm |
| **Ứng dụng** | Giấu tin | Watermark bản quyền |
| **Chuẩn học thuật** | ✅ | ✅✅✅ |

---

## 7. Tài liệu tham khảo

1. **LSB Steganography**:
   - Chan, C. K., & Cheng, L. M. (2004). "Hiding data in images by simple LSB substitution"
   - ResearchGate: Analysis of LSB based image steganography techniques

2. **DWT-DCT-SVD Watermarking** (CHUẨN HỌC THUẬT):
   - **[QUAN TRỌNG]** "DWT, DCT and SVD Based Digital Image Watermarking" (2012)
   - **[QUAN TRỌNG]** "Exploring DWT–SVD–DCT for JPEG Robustness" (2014)
   - Kết quả: Exceptional robustness, tốt hơn 46% so với DCT-only

3. **Arnold Cat Map**:
   - Arnold, V. I., & Avez, A. (1968). "Ergodic Problems of Classical Mechanics"
   - Wikipedia: Arnold's cat map

4. **SSIM Quality Metric**:
   - Wang, Z., et al. (2004). "Image quality assessment: from error visibility to structural similarity"
   - IEEE Transactions on Image Processing, Vol. 13, No. 4

5. **Video Watermarking**:
   - "Hybrid quasi-3D DWT/DCT and SVD video watermarking" (2010)
   - "Digital Watermarking in Video for Copyright Protection" (2014)

---

**📚 Chi tiết đầy đủ xem file: `TAI_LIEU_THAM_KHAO_VA_CAI_TIEN.md`**
