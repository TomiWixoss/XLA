"""
DWT-DCT-SVD Digital Image Watermarking với Arnold Cat Map
Chuẩn học thuật theo:
- DWT, DCT and SVD Based Digital Image Watermarking (2012)
- Exploring DWT–SVD–DCT for JPEG Robustness (2014)
"""

import numpy as np
import cv2
import pywt
from scipy.fftpack import dct, idct
from app.core.utils import arnold_cat_map, inverse_arnold_cat_map, calculate_psnr, calculate_ssim, calculate_mse


class DWT_DCT_SVD_Watermark:
    """
    Class xử lý thủy vân ảnh sử dụng DWT-DCT-SVD theo chuẩn học thuật
    
    Thuật toán 3 layers (CHUẨN HỌC THUẬT):
    1. DWT: Phân tích ảnh thành 4 sub-bands (LL, LH, HL, HH)
    2. DCT: Chuyển block 8x8 của sub-band sang frequency domain
    3. SVD: Phân tích DCT coefficients = U * S * V^T
    4. Nhúng watermark vào singular values S
    5. Reconstruct: DCT' = U * S' * V^T
    6. IDCT: Chuyển về spatial domain
    7. IDWT: Tái tạo ảnh từ sub-bands
    
    Lợi ích DWT-DCT-SVD so với DCT-SVD:
    - Exceptional robustness against JPEG/JPEG2000 (theo paper 2014)
    - Multi-resolution analysis
    - Tốt hơn 46% so với DCT-only
    """
    
    def __init__(self, block_size=8, alpha=0.1, arnold_iterations=10, use_dwt=True, wavelet='haar'):
        """
        Args:
            block_size: Kích thước block cho DCT (8x8 chuẩn JPEG)
            alpha: Hệ số nhúng watermark (0.01-0.5, càng lớn càng bền nhưng càng rõ)
            arnold_iterations: Số lần xáo trộn Arnold Cat Map
            use_dwt: Sử dụng DWT layer (True = DWT-DCT-SVD, False = DCT-SVD)
            wavelet: Loại wavelet ('haar', 'db1', 'db2', etc.)
        """
        self.block_size = block_size
        self.alpha = alpha
        self.arnold_iterations = arnold_iterations
        self.use_dwt = use_dwt
        self.wavelet = wavelet
    
    def _dct2(self, block):
        """2D DCT Transform"""
        return dct(dct(block.T, norm='ortho').T, norm='ortho')
    
    def _idct2(self, block):
        """2D Inverse DCT Transform"""
        return idct(idct(block.T, norm='ortho').T, norm='ortho')
    
    def _embed_svd(self, dct_block, watermark_bit):
        """
        Nhúng watermark vào singular values (CHUẨN HỌC THUẬT)
        
        Thuật toán SVD Embedding:
        1. SVD decomposition: DCT_block = U * S * V^T
        2. Modify largest singular value S[0]
        3. Reconstruct: DCT_block' = U * S' * V^T
        
        Args:
            dct_block: DCT coefficients (8x8)
            watermark_bit: 0 hoặc 1
        
        Returns:
            Modified DCT block với watermark
        """
        # SVD decomposition
        U, S, Vt = np.linalg.svd(dct_block, full_matrices=False)
        
        # Nhúng watermark vào singular value lớn nhất
        # Theo paper: S'[0] = S[0] * (1 ± alpha)
        if watermark_bit == 1:
            S[0] = S[0] * (1 + self.alpha)
        else:
            S[0] = S[0] * (1 - self.alpha)
        
        # Reconstruct DCT block từ SVD
        dct_block_modified = U @ np.diag(S) @ Vt
        
        return dct_block_modified
    
    def _extract_svd(self, watermarked_dct_block, original_dct_block):
        """
        Trích xuất watermark từ singular values (CHUẨN HỌC THUẬT)
        
        Args:
            watermarked_dct_block: DCT của ảnh đã watermark
            original_dct_block: DCT của ảnh gốc
        
        Returns:
            Watermark bit (0 hoặc 1)
        """
        # SVD của cả 2 blocks
        _, S_wm, _ = np.linalg.svd(watermarked_dct_block, full_matrices=False)
        _, S_orig, _ = np.linalg.svd(original_dct_block, full_matrices=False)
        
        # So sánh singular values để trích xuất bit
        ratio = S_wm[0] / S_orig[0]
        
        # Trích xuất bit dựa trên ratio
        if ratio > 1:
            return 1
        else:
            return 0
    
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
        
        # DWT Layer (CHUẨN HỌC THUẬT)
        if self.use_dwt:
            coeffs = pywt.dwt2(host_y, self.wavelet)
            LL, (LH, HL, HH) = coeffs
            # Nhúng vào sub-band LL (low-frequency) cho imperceptibility
            # Hoặc LH (mid-frequency) cho robustness - theo paper
            selected_band = LL
        else:
            selected_band = host_y
            LL = LH = HL = HH = None
        
        # Tính kích thước watermark dựa trên số block
        h, w = selected_band.shape
        num_blocks_h = h // self.block_size
        num_blocks_w = w // self.block_size
        
        # Watermark size = sqrt(số blocks / 2) để cân bằng giữa capacity và quality
        watermark_size = int(np.sqrt(num_blocks_h * num_blocks_w // 2))
        watermark_size = min(watermark_size, 64)  # Giới hạn tối đa 64x64
        
        # Chuẩn bị watermark
        watermark_prepared = self._prepare_watermark(watermark, watermark_size)
        watermark_flat = watermark_prepared.flatten()
        
        # Nhúng watermark vào các block DCT-SVD
        watermarked_band = selected_band.copy()
        watermark_idx = 0
        
        for i in range(0, h - self.block_size + 1, self.block_size):
            for j in range(0, w - self.block_size + 1, self.block_size):
                if watermark_idx >= len(watermark_flat):
                    break
                
                # Lấy block
                block = selected_band[i:i+self.block_size, j:j+self.block_size]
                
                # DCT Transform
                dct_block = self._dct2(block)
                
                # SVD Embedding (CHUẨN HỌC THUẬT)
                dct_block_modified = self._embed_svd(dct_block, watermark_flat[watermark_idx])
                
                # IDCT Transform
                watermarked_block = self._idct2(dct_block_modified)
                watermarked_band[i:i+self.block_size, j:j+self.block_size] = watermarked_block
                
                watermark_idx += 1
            
            if watermark_idx >= len(watermark_flat):
                break
        
        # IDWT Layer (CHUẨN HỌC THUẬT)
        if self.use_dwt:
            # Reconstruct từ DWT coefficients
            coeffs_modified = (watermarked_band, (LH, HL, HH))
            watermarked_y = pywt.idwt2(coeffs_modified, self.wavelet)
            # Resize về kích thước gốc nếu cần
            if watermarked_y.shape != (host_ycrcb.shape[0], host_ycrcb.shape[1]):
                watermarked_y = cv2.resize(watermarked_y, (host_ycrcb.shape[1], host_ycrcb.shape[0]))
        else:
            watermarked_y = watermarked_band
        
        # Clip values và chuyển về uint8
        watermarked_y = np.clip(watermarked_y, 0, 255).astype(np.uint8)
        
        # Ghép lại với Cr, Cb
        host_ycrcb[:, :, 0] = watermarked_y
        watermarked_bgr = cv2.cvtColor(host_ycrcb, cv2.COLOR_YCrCb2BGR)
        
        # Lưu ảnh
        cv2.imwrite(output_path, watermarked_bgr)
        
        # Tính quality metrics (CHUẨN HỌC THUẬT)
        psnr = calculate_psnr(host, watermarked_bgr)
        ssim_val = calculate_ssim(host, watermarked_bgr)
        mse = calculate_mse(host, watermarked_bgr)
        
        return {
            'success': True,
            'watermark_size': f"{watermark_size}x{watermark_size}",
            'blocks_used': watermark_idx,
            'alpha': self.alpha,
            'arnold_iterations': self.arnold_iterations,
            'quality_metrics': {
                'psnr': float(psnr),
                'ssim': float(ssim_val),
                'mse': float(mse)
            },
            'algorithm': 'DWT-DCT-SVD' if self.use_dwt else 'DCT-SVD',
            'wavelet': self.wavelet if self.use_dwt else None
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
        
        # DWT Layer (CHUẨN HỌC THUẬT)
        if self.use_dwt:
            coeffs_wm = pywt.dwt2(watermarked_y, self.wavelet)
            coeffs_orig = pywt.dwt2(original_y, self.wavelet)
            LL_wm, (LH_wm, HL_wm, HH_wm) = coeffs_wm
            LL_orig, (LH_orig, HL_orig, HH_orig) = coeffs_orig
            selected_band_wm = LL_wm
            selected_band_orig = LL_orig
        else:
            selected_band_wm = watermarked_y
            selected_band_orig = original_y
        
        h, w = selected_band_wm.shape
        
        # Trích xuất watermark bits
        extracted_bits = []
        
        for i in range(0, h - self.block_size + 1, self.block_size):
            for j in range(0, w - self.block_size + 1, self.block_size):
                if len(extracted_bits) >= watermark_size * watermark_size:
                    break
                
                # DCT của cả 2 blocks
                watermarked_block = selected_band_wm[i:i+self.block_size, j:j+self.block_size]
                original_block = selected_band_orig[i:i+self.block_size, j:j+self.block_size]
                
                dct_watermarked = self._dct2(watermarked_block)
                dct_original = self._dct2(original_block)
                
                # SVD Extraction (CHUẨN HỌC THUẬT)
                bit = self._extract_svd(dct_watermarked, dct_original)
                extracted_bits.append(bit)
            
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
