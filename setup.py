"""
Setup script cho PyStegoWatermark Suite
"""

import os
import sys


def create_directories():
    """Tạo các thư mục cần thiết"""
    directories = ['assets', 'output', 'temp']
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Đã tạo thư mục: {directory}/")
        else:
            print(f"ℹ️  Thư mục đã tồn tại: {directory}/")


def check_dependencies():
    """Kiểm tra các dependencies"""
    print("\n🔍 Kiểm tra dependencies...")
    
    required_packages = [
        'numpy',
        'cv2',
        'PIL',
        'scipy',
        'skimage',
        'Crypto',
        'streamlit'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                __import__('cv2')
            elif package == 'PIL':
                __import__('PIL')
            elif package == 'skimage':
                __import__('skimage')
            elif package == 'Crypto':
                __import__('Crypto')
            else:
                __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - CHƯA CÀI ĐẶT")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Thiếu {len(missing_packages)} packages!")
        print("Chạy lệnh sau để cài đặt:")
        print("pip install -r requirements.txt")
        return False
    else:
        print("\n✅ Tất cả dependencies đã được cài đặt!")
        return True


def create_sample_readme():
    """Tạo README trong thư mục assets"""
    assets_readme = """# Assets Folder

Thư mục này chứa các file mẫu để test hệ thống.

## Cấu trúc đề xuất:

```
assets/
├── images/
│   ├── cover_image.png      # Ảnh để giấu tin
│   ├── host_image.jpg       # Ảnh gốc để watermark
│   └── logo.png             # Logo watermark
│
└── videos/
    └── sample_video.mp4     # Video mẫu
```

## Lưu ý:
- Steganography: Dùng PNG/BMP (không nén)
- Watermarking: Dùng ảnh có độ phân giải cao (>512x512)
- Video: Nên dùng video ngắn (<30s) để demo
"""
    
    with open('assets/README.md', 'w', encoding='utf-8') as f:
        f.write(assets_readme)
    
    print("✅ Đã tạo assets/README.md")


def main():
    """Main setup function"""
    print("=" * 60)
    print("PyStegoWatermark Suite - Setup Script")
    print("=" * 60)
    
    # Tạo thư mục
    print("\n📁 Tạo thư mục...")
    create_directories()
    create_sample_readme()
    
    # Kiểm tra dependencies
    deps_ok = check_dependencies()
    
    # Kết quả
    print("\n" + "=" * 60)
    if deps_ok:
        print("✅ SETUP HOÀN TẤT!")
        print("\nBước tiếp theo:")
        print("1. Thêm ảnh/video mẫu vào thư mục assets/")
        print("2. Chạy: streamlit run app.py")
        print("3. Hoặc test: python test_example.py")
    else:
        print("⚠️  SETUP CHƯA HOÀN TẤT")
        print("\nVui lòng cài đặt dependencies:")
        print("pip install -r requirements.txt")
    print("=" * 60)


if __name__ == "__main__":
    main()
