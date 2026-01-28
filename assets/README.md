# Assets Folder

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
