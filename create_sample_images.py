"""
Script tạo ảnh mẫu để test hệ thống
Chạy: python create_sample_images.py
"""

import cv2
import numpy as np
import os


def create_cover_image():
    """Tạo ảnh cover cho steganography"""
    print("📸 Tạo cover image...")
    
    # Tạo ảnh gradient màu
    width, height = 512, 512
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    for i in range(height):
        for j in range(width):
            image[i, j] = [
                int(255 * i / height),           # Red gradient
                int(255 * j / width),            # Green gradient
                int(255 * (i + j) / (height + width))  # Blue gradient
            ]
    
    # Thêm một số hình học
    cv2.circle(image, (256, 256), 100, (255, 255, 255), 2)
    cv2.rectangle(image, (150, 150), (362, 362), (255, 255, 255), 2)
    
    # Thêm text
    cv2.putText(image, 'COVER IMAGE', (120, 50), 
                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 2)
    
    output_path = 'assets/cover_image.png'
    cv2.imwrite(output_path, image)
    print(f"   ✅ Đã tạo: {output_path}")
    
    return output_path


def create_host_image():
    """Tạo ảnh host cho watermarking"""
    print("📸 Tạo host image...")
    
    width, height = 512, 512
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Tạo background với pattern
    for i in range(0, height, 32):
        for j in range(0, width, 32):
            color = (
                np.random.randint(100, 200),
                np.random.randint(100, 200),
                np.random.randint(100, 200)
            )
            cv2.rectangle(image, (j, i), (j+32, i+32), color, -1)
    
    # Thêm một số shapes
    cv2.circle(image, (256, 256), 150, (50, 50, 200), -1)
    cv2.circle(image, (256, 256), 100, (100, 100, 255), -1)
    
    # Thêm text
    cv2.putText(image, 'HOST IMAGE', (100, 450), 
                cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
    
    output_path = 'assets/host_image.png'
    cv2.imwrite(output_path, image)
    print(f"   ✅ Đã tạo: {output_path}")
    
    return output_path


def create_watermark_logo():
    """Tạo logo watermark"""
    print("📸 Tạo watermark logo...")
    
    # Tạo logo 128x128
    size = 128
    logo = np.zeros((size, size), dtype=np.uint8)
    
    # Vẽ chữ "WM"
    cv2.putText(logo, 'WM', (10, 90), 
                cv2.FONT_HERSHEY_BOLD, 3, 255, 8)
    
    # Vẽ khung
    cv2.rectangle(logo, (5, 5), (size-5, size-5), 255, 3)
    
    output_path = 'assets/watermark_logo.png'
    cv2.imwrite(output_path, logo)
    print(f"   ✅ Đã tạo: {output_path}")
    
    return output_path


def create_simple_logo():
    """Tạo logo đơn giản hơn"""
    print("📸 Tạo simple logo...")
    
    size = 64
    logo = np.zeros((size, size), dtype=np.uint8)
    
    # Vẽ hình tròn
    cv2.circle(logo, (size//2, size//2), size//3, 255, -1)
    
    # Vẽ chữ C
    cv2.putText(logo, 'C', (size//2-15, size//2+10), 
                cv2.FONT_HERSHEY_BOLD, 1.5, 0, 3)
    
    output_path = 'assets/simple_logo.png'
    cv2.imwrite(output_path, logo)
    print(f"   ✅ Đã tạo: {output_path}")
    
    return output_path


def create_test_pattern():
    """Tạo test pattern để kiểm tra chất lượng"""
    print("📸 Tạo test pattern...")
    
    width, height = 512, 512
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Tạo checkerboard pattern
    square_size = 32
    for i in range(0, height, square_size):
        for j in range(0, width, square_size):
            if ((i // square_size) + (j // square_size)) % 2 == 0:
                image[i:i+square_size, j:j+square_size] = [255, 255, 255]
    
    # Thêm gradient bars
    for i in range(height//2 - 50, height//2 + 50):
        for j in range(width):
            gray_value = int(255 * j / width)
            image[i, j] = [gray_value, gray_value, gray_value]
    
    output_path = 'assets/test_pattern.png'
    cv2.imwrite(output_path, image)
    print(f"   ✅ Đã tạo: {output_path}")
    
    return output_path


def create_sample_video():
    """Tạo video mẫu ngắn"""
    print("🎬 Tạo sample video...")
    
    width, height = 640, 480
    fps = 24
    duration = 5  # seconds
    total_frames = fps * duration
    
    output_path = 'assets/sample_video.mp4'
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame_num in range(total_frames):
        # Tạo frame với màu thay đổi
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Background color thay đổi theo thời gian
        color_shift = int(255 * frame_num / total_frames)
        frame[:, :] = [color_shift, 100, 255 - color_shift]
        
        # Vẽ hình tròn di chuyển
        x = int(width * frame_num / total_frames)
        y = height // 2
        cv2.circle(frame, (x, y), 50, (255, 255, 255), -1)
        
        # Thêm text với frame number
        cv2.putText(frame, f'Frame {frame_num+1}/{total_frames}', 
                   (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        out.write(frame)
        
        # Progress
        if (frame_num + 1) % 24 == 0:
            print(f"   Progress: {frame_num+1}/{total_frames} frames")
    
    out.release()
    print(f"   ✅ Đã tạo: {output_path}")
    
    return output_path


def create_readme():
    """Tạo README trong assets"""
    readme_content = """# Sample Assets

Các file mẫu được tạo tự động để test hệ thống.

## Files:

### Images for Steganography:
- `cover_image.png` (512x512) - Ảnh để giấu tin
- `test_pattern.png` (512x512) - Pattern để test chất lượng

### Images for Watermarking:
- `host_image.png` (512x512) - Ảnh gốc để nhúng watermark
- `watermark_logo.png` (128x128) - Logo watermark lớn
- `simple_logo.png` (64x64) - Logo watermark nhỏ

### Video:
- `sample_video.mp4` (5 seconds, 24fps) - Video mẫu để test

## Sử dụng:

### Test Steganography:
```python
from core.steganography import LSB_Stego

stego = LSB_Stego()
stego.embed('assets/cover_image.png', 'Secret!', 'output/stego.png')
```

### Test Watermarking:
```python
from core.watermarking import DCT_SVD_Watermark

wm = DCT_SVD_Watermark()
wm.embed('assets/host_image.png', 'assets/simple_logo.png', 'output/watermarked.png')
```

### Test Video:
```python
from core.video_proc import VideoWatermark

vwm = VideoWatermark()
vwm.embed('assets/sample_video.mp4', 'assets/simple_logo.png', 'output/watermarked_video.mp4')
```

---

**Tạo lại các file này:** `python create_sample_images.py`
"""
    
    with open('assets/SAMPLES.md', 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print("   ✅ Đã tạo: assets/SAMPLES.md")


def main():
    """Main function"""
    print("=" * 60)
    print("Tạo Sample Images & Video")
    print("=" * 60)
    
    # Tạo thư mục assets nếu chưa có
    if not os.path.exists('assets'):
        os.makedirs('assets')
        print("✅ Đã tạo thư mục assets/")
    
    # Tạo các file
    try:
        create_cover_image()
        create_host_image()
        create_watermark_logo()
        create_simple_logo()
        create_test_pattern()
        
        # Video (optional - có thể bỏ qua nếu không cần)
        create_video = input("\n🎬 Tạo sample video? (y/n): ")
        if create_video.lower() == 'y':
            create_sample_video()
        else:
            print("   ⏭️  Bỏ qua tạo video")
        
        create_readme()
        
        print("\n" + "=" * 60)
        print("✅ HOÀN TẤT!")
        print("=" * 60)
        print("\nCác file đã tạo trong thư mục assets/:")
        print("- cover_image.png")
        print("- host_image.png")
        print("- watermark_logo.png")
        print("- simple_logo.png")
        print("- test_pattern.png")
        if create_video.lower() == 'y':
            print("- sample_video.mp4")
        print("\nBạn có thể dùng các file này để test hệ thống!")
        print("Chạy: streamlit run app.py")
    
    except Exception as e:
        print(f"\n❌ Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
