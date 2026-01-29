"""
Utility functions: Arnold Cat Map, Quality Metrics (PSNR, MSE, SSIM, NC)
"""

import numpy as np
import cv2
from skimage.metrics import structural_similarity as ssim


def arnold_cat_map(image, iterations=10):
    """
    Xáo trộn ảnh sử dụng Arnold Cat Map
    
    Args:
        image: Ảnh đầu vào (numpy array, phải là ảnh vuông)
        iterations: Số lần lặp xáo trộn
    
    Returns:
        Ảnh đã xáo trộn
    """
    N = image.shape[0]
    if image.shape[0] != image.shape[1]:
        raise ValueError("Arnold Cat Map yêu cầu ảnh vuông (NxN)")
    
    scrambled = image.copy()
    
    for _ in range(iterations):
        temp = np.zeros_like(scrambled)
        for x in range(N):
            for y in range(N):
                # Arnold transform: [x', y'] = [[1,1],[1,2]] * [x, y] mod N
                new_x = (x + y) % N
                new_y = (x + 2 * y) % N
                temp[new_x, new_y] = scrambled[x, y]
        scrambled = temp
    
    return scrambled


def inverse_arnold_cat_map(image, iterations=10):
    """
    Khôi phục ảnh từ Arnold Cat Map
    
    Args:
        image: Ảnh đã xáo trộn
        iterations: Số lần lặp (phải giống với lúc mã hóa)
    
    Returns:
        Ảnh gốc
    """
    N = image.shape[0]
    if image.shape[0] != image.shape[1]:
        raise ValueError("Arnold Cat Map yêu cầu ảnh vuông (NxN)")
    
    descrambled = image.copy()
    
    for _ in range(iterations):
        temp = np.zeros_like(descrambled)
        for x in range(N):
            for y in range(N):
                # Inverse Arnold: [x', y'] = [[2,-1],[-1,1]] * [x, y] mod N
                new_x = (2 * x - y) % N
                new_y = (-x + y) % N
                temp[new_x, new_y] = descrambled[x, y]
        descrambled = temp
    
    return descrambled


def calculate_mse(original, modified):
    """Tính Mean Squared Error"""
    return np.mean((original.astype(float) - modified.astype(float)) ** 2)


def calculate_psnr(original, modified, max_pixel=255.0):
    """
    Tính Peak Signal-to-Noise Ratio
    
    Args:
        original: Ảnh gốc
        modified: Ảnh đã chỉnh sửa
        max_pixel: Giá trị pixel tối đa (255 cho ảnh 8-bit)
    
    Returns:
        PSNR value (dB). Giá trị càng cao càng tốt (>30dB là tốt)
    """
    mse = calculate_mse(original, modified)
    if mse == 0:
        return float('inf')
    return 20 * np.log10(max_pixel / np.sqrt(mse))


def calculate_ssim(original, modified):
    """
    Tính Structural Similarity Index
    
    Returns:
        SSIM value (0-1). Giá trị càng gần 1 càng tốt
    """
    # Chuyển sang grayscale nếu là ảnh màu
    if len(original.shape) == 3:
        original_gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
        modified_gray = cv2.cvtColor(modified, cv2.COLOR_BGR2GRAY)
    else:
        original_gray = original
        modified_gray = modified
    
    return ssim(original_gray, modified_gray, data_range=modified_gray.max() - modified_gray.min())


def calculate_nc(original_watermark, extracted_watermark):
    """
    Tính Normalized Correlation giữa watermark gốc và watermark trích xuất
    
    Returns:
        NC value (0-1). Giá trị càng gần 1 càng tốt
    """
    original_flat = original_watermark.flatten().astype(float)
    extracted_flat = extracted_watermark.flatten().astype(float)
    
    numerator = np.sum(original_flat * extracted_flat)
    denominator = np.sqrt(np.sum(original_flat ** 2) * np.sum(extracted_flat ** 2))
    
    if denominator == 0:
        return 0.0
    
    return numerator / denominator


def resize_to_square(image, size):
    """Resize ảnh về kích thước vuông"""
    return cv2.resize(image, (size, size), interpolation=cv2.INTER_AREA)


def apply_attack(image, attack_type, **params):
    """
    Mô phỏng các tấn công vào ảnh để test độ bền của watermark
    
    Args:
        image: Ảnh đầu vào
        attack_type: Loại tấn công ('jpeg_compression', 'gaussian_noise', 'crop', 'rotate')
        params: Tham số cho từng loại tấn công
    
    Returns:
        Ảnh sau khi bị tấn công
    """
    attacked = image.copy()
    
    if attack_type == 'jpeg_compression':
        quality = params.get('quality', 50)
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        _, encimg = cv2.imencode('.jpg', attacked, encode_param)
        attacked = cv2.imdecode(encimg, cv2.IMREAD_COLOR)
    
    elif attack_type == 'gaussian_noise':
        mean = params.get('mean', 0)
        std = params.get('std', 25)
        noise = np.random.normal(mean, std, attacked.shape).astype(np.uint8)
        attacked = cv2.add(attacked, noise)
    
    elif attack_type == 'crop':
        crop_percent = params.get('crop_percent', 0.2)
        h, w = attacked.shape[:2]
        crop_h = int(h * crop_percent)
        crop_w = int(w * crop_percent)
        attacked = attacked[crop_h:h-crop_h, crop_w:w-crop_w]
        attacked = cv2.resize(attacked, (w, h))
    
    elif attack_type == 'rotate':
        angle = params.get('angle', 5)
        h, w = attacked.shape[:2]
        center = (w // 2, h // 2)
        matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        attacked = cv2.warpAffine(attacked, matrix, (w, h))
    
    return attacked
