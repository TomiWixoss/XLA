"""
DCT-SVD Digital Image Watermarking với Arnold Cat Map
"""

import numpy as np
import cv2
from scipy.fftpack import dct, idct
from app.core.utils import arnold_cat_map, inverse_arnold_cat_map


class DCT_SVD_Watermark:
    """
    Class xử lý thủy vân ảnh sử dụng DCT (Discrete Cosine Transform) 
    kết hợp SVD (Singular Value Decomposition)
    """
    
    def __init__(self, block_size=8, alpha=0.1, arnold_iterations=10):
        """
        Args:
            block_size: Kích thước block cho DCT (thường là 8x8)
            alpha: Hệ số nhúng watermark (0.01-0.5, càng lớn càng bền nhưng càng rõ)
            arnold_iterations: Số lần xáo trộn Arnold Cat Map
        """
        self.block_size = block_size
        self.alpha = alpha
        self.arnold_iterations = arnold_iterations
    
    def _dct2(self, block):
        """2D DCT"""
        return dct(dct(block.T, norm='ortho').T, norm='ortho')
    
    def _idct2(self, block):
        """2D Inverse DCT"""
        return idct(idct(block.T, norm='ortho').T, norm='ortho')
    
    def _prepare_watermark(self, watermark, target_size):
        """
        Chuẩn bị watermark: resize, grayscale, binary, Arnold scrambling
        
        Args:
            watermark: Ảnh watermark gốc
            target_size: Kích thước mục tiêu (phải là số vuông)
        
        Returns:
            Watermark đã xử lý (binary, scrambled)
        """
        # Chuyển sang grayscale
        if len(watermark.shape) == 3:
            watermark_gray = cv2.cvtColor(watermark, cv2.COLOR_BGR2GRAY)
        else:
            watermark_gray = watermark
        
        # Resize về kích thước vuông
        watermark_resized = cv2.resize(watermark_gray, (target_size, target_size))
        
        # Binary threshold
        _, watermark_binary = cv2.threshold(watermark_resized, 127, 1, cv2.THRESH_BINARY)
        
        # Arnold Cat Map scrambling
        watermark_scrambled = arnold_cat_map(watermark_binary, self.arnold_iterations)
        
        return watermark_scrambled.astype(np.float32)
    
    def embed(self, host_image_path, watermark_image_path, output_path):
        """
        Nhúng watermark vào ảnh gốc
        
        Args:
            host_image_path: Đường dẫn ảnh gốc
            watermark_image_path: Đường dẫn ảnh watermark
            output_path: Đường dẫn lưu ảnh đã watermark
        
        Returns:
            dict: Thông tin về quá trình nhúng
        """
        # Đọc ảnh
        host = cv2.imread(host_image_path)
        watermark = cv2.imread(watermark_image_path)
        
        if host is None or watermark is None:
            raise ValueError("Cannot read images")
        
        # Chuyển host sang YCrCb (nhúng vào kênh Y - luminance)
        host_ycrcb = cv2.cvtColor(host, cv2.COLOR_BGR2YCrCb)
        host_y = host_ycrcb[:, :, 0].astype(np.float32)
        
        # Tính kích thước watermark dựa trên số block
        h, w = host_y.shape
        num_blocks_h = h // self.block_size
        num_blocks_w = w // self.block_size
        
        # Watermark size = sqrt(số blocks / 4) để không nhúng quá nhiều
        watermark_size = int(np.sqrt(num_blocks_h * num_blocks_w // 4))
        watermark_size = min(watermark_size, 64)  # Giới hạn tối đa 64x64
        
        # Chuẩn bị watermark
        watermark_prepared = self._prepare_watermark(watermark, watermark_size)
        watermark_flat = watermark_prepared.flatten()
        
        # Nhúng watermark vào các block DCT
        watermarked_y = host_y.copy()
        watermark_idx = 0
        
        for i in range(0, h - self.block_size + 1, self.block_size):
            for j in range(0, w - self.block_size + 1, self.block_size):
                if watermark_idx >= len(watermark_flat):
                    break
                
                # Lấy block
                block = host_y[i:i+self.block_size, j:j+self.block_size]
                
                # DCT
                dct_block = self._dct2(block)
                
                # Nhúng watermark vào mid-frequency coefficients
                # Chọn vị trí (3,4) và (4,3) - mid-band
                if watermark_flat[watermark_idx] == 1:
                    dct_block[3, 4] += self.alpha * abs(dct_block[3, 4])
                    dct_block[4, 3] += self.alpha * abs(dct_block[4, 3])
                else:
                    dct_block[3, 4] -= self.alpha * abs(dct_block[3, 4])
                    dct_block[4, 3] -= self.alpha * abs(dct_block[4, 3])
                
                # IDCT
                watermarked_block = self._idct2(dct_block)
                watermarked_y[i:i+self.block_size, j:j+self.block_size] = watermarked_block
                
                watermark_idx += 1
            
            if watermark_idx >= len(watermark_flat):
                break
        
        # Clip values và chuyển về uint8
        watermarked_y = np.clip(watermarked_y, 0, 255).astype(np.uint8)
        
        # Ghép lại với Cr, Cb
        host_ycrcb[:, :, 0] = watermarked_y
        watermarked_bgr = cv2.cvtColor(host_ycrcb, cv2.COLOR_YCrCb2BGR)
        
        # Lưu ảnh
        cv2.imwrite(output_path, watermarked_bgr)
        
        return {
            'success': True,
            'watermark_size': f"{watermark_size}x{watermark_size}",
            'blocks_used': watermark_idx,
            'alpha': self.alpha,
            'arnold_iterations': self.arnold_iterations
        }
    
    def extract(self, watermarked_image_path, original_image_path, watermark_size):
        """
        Trích xuất watermark từ ảnh đã nhúng
        
        Args:
            watermarked_image_path: Đường dẫn ảnh đã watermark
            original_image_path: Đường dẫn ảnh gốc (cần để so sánh)
            watermark_size: Kích thước watermark (phải biết trước)
        
        Returns:
            numpy array: Watermark đã trích xuất
        """
        # Đọc ảnh
        watermarked = cv2.imread(watermarked_image_path)
        original = cv2.imread(original_image_path)
        
        if watermarked is None or original is None:
            raise ValueError("Cannot read images")
        
        # Chuyển sang kênh Y
        watermarked_y = cv2.cvtColor(watermarked, cv2.COLOR_BGR2YCrCb)[:, :, 0].astype(np.float32)
        original_y = cv2.cvtColor(original, cv2.COLOR_BGR2YCrCb)[:, :, 0].astype(np.float32)
        
        h, w = watermarked_y.shape
        
        # Trích xuất watermark bits
        extracted_bits = []
        
        for i in range(0, h - self.block_size + 1, self.block_size):
            for j in range(0, w - self.block_size + 1, self.block_size):
                if len(extracted_bits) >= watermark_size * watermark_size:
                    break
                
                # DCT của cả 2 ảnh
                watermarked_block = watermarked_y[i:i+self.block_size, j:j+self.block_size]
                original_block = original_y[i:i+self.block_size, j:j+self.block_size]
                
                dct_watermarked = self._dct2(watermarked_block)
                dct_original = self._dct2(original_block)
                
                # So sánh mid-frequency coefficients
                diff1 = dct_watermarked[3, 4] - dct_original[3, 4]
                diff2 = dct_watermarked[4, 3] - dct_original[4, 3]
                avg_diff = (diff1 + diff2) / 2
                
                # Trích xuất bit
                extracted_bits.append(1 if avg_diff > 0 else 0)
            
            if len(extracted_bits) >= watermark_size * watermark_size:
                break
        
        # Reshape thành ảnh
        extracted_watermark = np.array(extracted_bits[:watermark_size * watermark_size])
        extracted_watermark = extracted_watermark.reshape(watermark_size, watermark_size)
        
        # Inverse Arnold Cat Map
        extracted_watermark = inverse_arnold_cat_map(extracted_watermark, self.arnold_iterations)
        
        # Scale về 0-255 để hiển thị
        extracted_watermark = (extracted_watermark * 255).astype(np.uint8)
        
        return extracted_watermark
