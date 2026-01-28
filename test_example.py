"""
Script test các chức năng cơ bản
Chạy: python test_example.py
"""

import cv2
import numpy as np
from core.steganography import LSB_Stego
from core.watermarking import DCT_SVD_Watermark
from core.utils import (
    arnold_cat_map, inverse_arnold_cat_map,
    calculate_psnr, calculate_ssim, calculate_nc
)


def test_arnold_cat_map():
    """Test Arnold Cat Map"""
    print("\n=== Test Arnold Cat Map ===")
    
    # Tạo ảnh test 64x64
    image = np.random.randint(0, 256, (64, 64), dtype=np.uint8)
    
    # Xáo trộn
    scrambled = arnold_cat_map(image, iterations=10)
    
    # Khôi phục
    recovered = inverse_arnold_cat_map(scrambled, iterations=10)
    
    # Kiểm tra
    if np.array_equal(image, recovered):
        print("✅ Arnold Cat Map: PASS")
    else:
        print("❌ Arnold Cat Map: FAIL")


def test_steganography():
    """Test LSB Steganography"""
    print("\n=== Test LSB Steganography ===")
    
    # Tạo ảnh test
    cover = np.random.randint(0, 256, (256, 256, 3), dtype=np.uint8)
    cv2.imwrite("test_cover.png", cover)
    
    # Test không mã hóa
    print("\n1. Test không mã hóa:")
    stego = LSB_Stego(use_encryption=False)
    secret_message = "This is a secret message for testing!"
    
    result = stego.embed("test_cover.png", secret_message, "test_stego.png")
    print(f"   Nhúng: {result['message_length']} ký tự")
    print(f"   Sử dụng: {result['usage_percent']:.2f}% capacity")
    
    extracted = stego.extract("test_stego.png")
    
    if extracted == secret_message:
        print("   ✅ Trích xuất: PASS")
    else:
        print("   ❌ Trích xuất: FAIL")
    
    # Tính PSNR
    cover_img = cv2.imread("test_cover.png")
    stego_img = cv2.imread("test_stego.png")
    psnr = calculate_psnr(cover_img, stego_img)
    ssim = calculate_ssim(cover_img, stego_img)
    print(f"   PSNR: {psnr:.2f} dB")
    print(f"   SSIM: {ssim:.4f}")
    
    # Test có mã hóa
    print("\n2. Test có mã hóa AES:")
    stego_enc = LSB_Stego(use_encryption=True, password="test123")
    
    result = stego_enc.embed("test_cover.png", secret_message, "test_stego_enc.png")
    print(f"   Nhúng (encrypted): {result['message_length']} ký tự")
    
    extracted_enc = stego_enc.extract("test_stego_enc.png")
    
    if extracted_enc == secret_message:
        print("   ✅ Trích xuất (encrypted): PASS")
    else:
        print("   ❌ Trích xuất (encrypted): FAIL")


def test_watermarking():
    """Test DCT-SVD Watermarking"""
    print("\n=== Test DCT-SVD Watermarking ===")
    
    # Tạo ảnh test
    host = np.random.randint(0, 256, (512, 512, 3), dtype=np.uint8)
    cv2.imwrite("test_host.png", host)
    
    # Tạo watermark (logo đơn giản)
    watermark = np.zeros((64, 64), dtype=np.uint8)
    cv2.circle(watermark, (32, 32), 20, 255, -1)
    cv2.imwrite("test_watermark.png", watermark)
    
    # Nhúng watermark
    print("\n1. Nhúng watermark:")
    wm = DCT_SVD_Watermark(alpha=0.1, arnold_iterations=10)
    result = wm.embed("test_host.png", "test_watermark.png", "test_watermarked.png")
    
    print(f"   Watermark size: {result['watermark_size']}")
    print(f"   Blocks used: {result['blocks_used']}")
    print(f"   Alpha: {result['alpha']}")
    
    # Tính metrics
    host_img = cv2.imread("test_host.png")
    watermarked_img = cv2.imread("test_watermarked.png")
    
    psnr = calculate_psnr(host_img, watermarked_img)
    ssim = calculate_ssim(host_img, watermarked_img)
    
    print(f"   PSNR: {psnr:.2f} dB")
    print(f"   SSIM: {ssim:.4f}")
    
    if psnr > 30:
        print("   ✅ PSNR > 30 dB: PASS")
    else:
        print("   ⚠️  PSNR < 30 dB: Chất lượng thấp")
    
    # Trích xuất watermark
    print("\n2. Trích xuất watermark:")
    extracted_wm = wm.extract("test_watermarked.png", "test_host.png", 32)
    cv2.imwrite("test_extracted_wm.png", extracted_wm)
    
    # Tính NC
    original_wm = cv2.imread("test_watermark.png", cv2.IMREAD_GRAYSCALE)
    original_wm_resized = cv2.resize(original_wm, (32, 32))
    
    nc = calculate_nc(original_wm_resized, extracted_wm)
    print(f"   NC (Normalized Correlation): {nc:.4f}")
    
    if nc > 0.7:
        print("   ✅ NC > 0.7: PASS")
    else:
        print("   ⚠️  NC < 0.7: Watermark bị suy giảm")


def cleanup():
    """Xóa các file test"""
    import os
    test_files = [
        "test_cover.png", "test_stego.png", "test_stego_enc.png",
        "test_host.png", "test_watermark.png", "test_watermarked.png",
        "test_extracted_wm.png"
    ]
    
    for f in test_files:
        if os.path.exists(f):
            os.remove(f)
    
    print("\n✅ Đã xóa các file test")


if __name__ == "__main__":
    print("=" * 60)
    print("PyStegoWatermark Suite - Test Script")
    print("=" * 60)
    
    try:
        test_arnold_cat_map()
        test_steganography()
        test_watermarking()
        
        print("\n" + "=" * 60)
        print("✅ TẤT CẢ TESTS HOÀN THÀNH")
        print("=" * 60)
        
        # Cleanup
        cleanup_choice = input("\nXóa các file test? (y/n): ")
        if cleanup_choice.lower() == 'y':
            cleanup()
    
    except Exception as e:
        print(f"\n❌ Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()
