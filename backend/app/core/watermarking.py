"""
DWT-DCT-SVD Digital Image Watermarking với Arnold Cat Map
Thủy vân ảnh số sử dụng 3 phép biến đổi kết hợp
"""

# Thư viện numpy để xử lý mảng số và ma trận
import numpy as np
# Thư viện OpenCV để đọc/ghi ảnh và xử lý ảnh
import cv2
# Thư viện pywt để thực hiện phép biến đổi DWT (Discrete Wavelet Transform)
import pywt
# Thư viện scipy để thực hiện phép biến đổi DCT (Discrete Cosine Transform)
from scipy.fftpack import dct, idct
# Import các hàm tiện ích: Arnold Cat Map, tính PSNR, SSIM, MSE
from app.core.utils import arnold_cat_map, inverse_arnold_cat_map, calculate_psnr, calculate_ssim, calculate_mse


class DWT_DCT_SVD_Watermark:
    """
    Lớp xử lý thủy vân ảnh sử dụng DWT-DCT-SVD
    
    Thuật toán 3 lớp biến đổi:
    1. DWT (Discrete Wavelet Transform): Phân tích ảnh thành 4 băng tần (LL, LH, HL, HH)
       - LL: Tần số thấp (chứa thông tin chính của ảnh)
       - LH: Tần số trung bình ngang (biên ngang)
       - HL: Tần số trung bình dọc (biên dọc)
       - HH: Tần số cao (chi tiết, nhiễu)
    
    2. DCT (Discrete Cosine Transform): Chuyển khối 8x8 của băng tần sang miền tần số
       - Tương tự như JPEG compression
       - Tập trung năng lượng vào góc trên bên trái
    
    3. SVD (Singular Value Decomposition): Phân tích ma trận DCT = U * S * V^T
       - U, V: Ma trận trực giao (chứa thông tin hướng)
       - S: Ma trận đường chéo (chứa giá trị kỳ dị - singular values)
       - Nhúng thủy vân vào S (giá trị kỳ dị lớn nhất)
    
    4. Tái tạo ngược: IDCT → IDWT → Ảnh đã nhúng thủy vân
    
    Lợi ích của DWT-DCT-SVD:
    - Bền vững cao với nén JPEG/JPEG2000
    - Phân tích đa độ phân giải
    - Không nhìn thấy thủy vân (invisible)
    """
    
    def __init__(self, alpha=0.02, arnold_iterations=10):
        """
        Khởi tạo đối tượng thủy vân với cấu hình tối ưu
        
        Tham số:
            alpha (float): Hệ số nhúng thủy vân
                - 0.01-0.02: Không nhìn thấy
                - 0.05: Cân bằng giữa không nhìn thấy và bền vững
                - 0.1+: Bền vững cao nhưng có thể nhìn thấy
            arnold_iterations (int): Số lần xáo trộn Arnold Cat Map
                - Tăng bảo mật bằng cách xáo trộn thủy vân trước khi nhúng
        
        Cấu hình cố định (tối ưu):
            - block_size: 8x8 (chuẩn JPEG, tối ưu cho DCT)
            - wavelet: 'haar' (nhanh và hiệu quả)
            - embed_band: 'LH' (tần số trung bình, cân bằng không nhìn thấy + bền vững)
        """
        # Kích thước khối cho DCT (8x8 là chuẩn JPEG)
        self.block_size = 8
        # Hệ số nhúng thủy vân
        self.alpha = alpha
        # Số lần xáo trộn Arnold Cat Map
        self.arnold_iterations = arnold_iterations
    
    def _dct2(self, block):
        """
        Phép biến đổi DCT 2 chiều
        
        DCT chuyển dữ liệu từ miền không gian sang miền tần số
        Tương tự như nén ảnh JPEG sử dụng DCT
        
        Tham số:
            block (numpy.ndarray): Khối ảnh 8x8 cần biến đổi
        
        Trả về:
            numpy.ndarray: Hệ số DCT 8x8 (miền tần số)
        """
        # Thực hiện DCT 2 chiều:
        # 1. DCT theo chiều ngang (dct(block.T))
        # 2. Chuyển vị kết quả (.T)
        # 3. DCT theo chiều dọc (dct(...))
        # norm='ortho': chuẩn hóa trực giao
        return dct(dct(block.T, norm='ortho').T, norm='ortho')
    
    def _idct2(self, block):
        """
        Phép biến đổi DCT nghịch đảo 2 chiều
        
        IDCT chuyển dữ liệu từ miền tần số về miền không gian
        
        Tham số:
            block (numpy.ndarray): Hệ số DCT 8x8 (miền tần số)
        
        Trả về:
            numpy.ndarray: Khối ảnh 8x8 (miền không gian)
        """
        # Thực hiện IDCT 2 chiều (ngược lại với DCT):
        # 1. IDCT theo chiều ngang (idct(block.T))
        # 2. Chuyển vị kết quả (.T)
        # 3. IDCT theo chiều dọc (idct(...))
        return idct(idct(block.T, norm='ortho').T, norm='ortho')
    
    def _embed_svd(self, dct_block, watermark_bit):
        """
        Nhúng thủy vân vào giá trị kỳ dị
        
        Thuật toán nhúng SVD:
        1. Phân tích SVD: Khối_DCT = U * S * V^T
           - U: Ma trận trực giao trái
           - S: Ma trận đường chéo chứa giá trị kỳ dị
           - V^T: Ma trận trực giao phải
        
        2. Sửa đổi giá trị kỳ dị lớn nhất S[0]:
           - Nếu bit = 1: S'[0] = S[0] * (1 + alpha)
           - Nếu bit = 0: S'[0] = S[0] * (1 - alpha)
        
        3. Tái tạo khối DCT: Khối_DCT' = U * S' * V^T
        
        Tham số:
            dct_block (numpy.ndarray): Hệ số DCT (8x8)
            watermark_bit (int): Bit thủy vân cần nhúng (0 hoặc 1)
        
        Trả về:
            numpy.ndarray: Khối DCT đã nhúng thủy vân (8x8)
        """
        # ===== BƯỚC 1: PHÂN TÍCH SVD =====
        # np.linalg.svd: thực hiện phân tích SVD
        # full_matrices=False: chỉ tính ma trận cần thiết (tiết kiệm bộ nhớ)
        # U: ma trận trực giao trái (8x8)
        # S: mảng giá trị kỳ dị (8 phần tử, sắp xếp giảm dần)
        # Vt: ma trận trực giao phải đã chuyển vị (8x8)
        U, S, Vt = np.linalg.svd(dct_block, full_matrices=False)
        
        # ===== BƯỚC 2: NHÚNG THỦY VÂN VÀO GIÁ TRỊ KỲ DỊ LỚN NHẤT =====
        # S[0] là giá trị kỳ dị lớn nhất (chứa năng lượng chính của khối)
        # Sửa đổi S[0] dựa trên bit thủy vân
        if watermark_bit == 1:
            # Nếu bit = 1: tăng S[0] lên alpha%
            # Ví dụ: S[0] = 100, alpha = 0.02 → S'[0] = 100 * 1.02 = 102
            S[0] = S[0] * (1 + self.alpha)
        else:
            # Nếu bit = 0: giảm S[0] xuống alpha%
            # Ví dụ: S[0] = 100, alpha = 0.02 → S'[0] = 100 * 0.98 = 98
            S[0] = S[0] * (1 - self.alpha)
        
        # ===== BƯỚC 3: TÁI TẠO KHỐI DCT TỪ SVD =====
        # Nhân 3 ma trận lại: U * S * V^T
        # np.diag(S): chuyển mảng S thành ma trận đường chéo
        # @: toán tử nhân ma trận trong numpy
        dct_block_modified = U @ np.diag(S) @ Vt
        
        # Trả về khối DCT đã nhúng thủy vân
        return dct_block_modified
    
    def _extract_svd(self, watermarked_dct_block, original_dct_block):
        """
        Trích xuất thủy vân từ giá trị kỳ dị
        
        Thuật toán trích xuất SVD:
        1. Phân tích SVD cả 2 khối (đã nhúng và gốc)
        2. So sánh giá trị kỳ dị lớn nhất để trích xuất bit
        
        Tham số:
            watermarked_dct_block (numpy.ndarray): Hệ số DCT của ảnh đã nhúng thủy vân
            original_dct_block (numpy.ndarray): Hệ số DCT của ảnh gốc
        
        Trả về:
            int: Bit thủy vân (0 hoặc 1)
        """
        # ===== BƯỚC 1: PHÂN TÍCH SVD CẢ 2 KHỐI =====
        # Phân tích SVD khối đã nhúng thủy vân
        # Chỉ cần lấy S (giá trị kỳ dị), bỏ qua U và Vt
        _, S_wm, _ = np.linalg.svd(watermarked_dct_block, full_matrices=False)
        # Phân tích SVD khối gốc
        _, S_orig, _ = np.linalg.svd(original_dct_block, full_matrices=False)
        
        # ===== BƯỚC 2: SO SÁNH GIÁ TRỊ KỲ DỊ ĐỂ TRÍCH XUẤT BIT =====
        # Tính tỷ lệ giữa giá trị kỳ dị lớn nhất của 2 khối
        # ratio = S_wm[0] / S_orig[0]
        # Nếu lúc nhúng bit = 1: S_wm[0] = S_orig[0] * (1 + alpha) → ratio > 1
        # Nếu lúc nhúng bit = 0: S_wm[0] = S_orig[0] * (1 - alpha) → ratio < 1
        ratio = S_wm[0] / S_orig[0]
        
        # ===== BƯỚC 3: QUYẾT ĐỊNH BIT DỰA TRÊN TỶ LỆ =====
        # Nếu ratio > 1: bit = 1 (đã tăng lên khi nhúng)
        if ratio > 1:
            return 1
        # Nếu ratio < 1: bit = 0 (đã giảm xuống khi nhúng)
        else:
            return 0
    
    def _prepare_watermark(self, watermark, target_size):
        """
        Chuẩn bị thủy vân: resize, chuyển xám, nhị phân hóa, xáo trộn Arnold
        
        Quy trình xử lý:
        1. Chuyển sang ảnh xám (grayscale)
        2. Resize về kích thước vuông (target_size x target_size)
        3. Nhị phân hóa (binary threshold): chuyển thành 0 và 1
        4. Xáo trộn Arnold Cat Map (tăng bảo mật)
        
        Tham số:
            watermark (numpy.ndarray): Ảnh thủy vân gốc
            target_size (int): Kích thước mục tiêu (phải là số vuông, ví dụ: 32, 64)
        
        Trả về:
            numpy.ndarray: Thủy vân đã xử lý (nhị phân, đã xáo trộn)
        """
        # ===== BƯỚC 1: CHUYỂN SANG ẢNH XÁM =====
        # Kiểm tra ảnh có 3 kênh màu không (BGR)
        if len(watermark.shape) == 3:
            # cv2.cvtColor: chuyển đổi không gian màu từ BGR sang ảnh xám
            watermark_gray = cv2.cvtColor(watermark, cv2.COLOR_BGR2GRAY)
        else:
            # Nếu đã là ảnh xám, dùng luôn
            watermark_gray = watermark
        
        # ===== BƯỚC 2: RESIZE VỀ KÍCH THƯỚC VUÔNG =====
        # cv2.resize: thay đổi kích thước ảnh
        # (target_size, target_size): kích thước mục tiêu (vuông)
        watermark_resized = cv2.resize(watermark_gray, (target_size, target_size))
        
        # ===== BƯỚC 3: NHỊ PHÂN HÓA =====
        # cv2.threshold: ngưỡng hóa ảnh
        # 127: ngưỡng (giá trị giữa 0-255)
        # 1: giá trị tối đa (chuyển thành 0 và 1 thay vì 0 và 255)
        # cv2.THRESH_BINARY: kiểu ngưỡng nhị phân
        # _: bỏ qua giá trị ngưỡng trả về
        # watermark_binary: ảnh nhị phân (chỉ chứa 0 và 1)
        _, watermark_binary = cv2.threshold(watermark_resized, 127, 1, cv2.THRESH_BINARY)
        
        # ===== BƯỚC 4: XÁO TRỘN ARNOLD CAT MAP =====
        # arnold_cat_map: hàm xáo trộn ảnh để tăng bảo mật
        # self.arnold_iterations: số lần xáo trộn (10 lần mặc định)
        # Mục đích: làm cho thủy vân khó bị phát hiện và tấn công
        watermark_scrambled = arnold_cat_map(watermark_binary, self.arnold_iterations)
        
        # Chuyển sang kiểu float32 để tính toán (DCT, SVD yêu cầu float)
        return watermark_scrambled.astype(np.float32)
    
    def embed(self, host_image_path, watermark_image_path, output_path):
        """
        Nhúng thủy vân vào ảnh gốc sử dụng thuật toán DWT-DCT-SVD
        
        Quy trình nhúng:
        1. Đọc ảnh gốc và ảnh thủy vân
        2. Chuyển ảnh gốc sang không gian màu YCrCb (nhúng vào kênh Y - độ sáng)
        3. Áp dụng DWT lên kênh Y → 4 băng tần (LL, LH, HL, HH)
        4. Chọn băng tần LH (tần số trung bình) để nhúng
        5. Chia băng tần thành các khối 8x8
        6. Với mỗi khối:
           - Áp dụng DCT → hệ số tần số
           - Áp dụng SVD → U, S, V^T
           - Nhúng 1 bit thủy vân vào S[0]
           - Tái tạo: IDCT
        7. Tái tạo ảnh: IDWT → chuyển về BGR
        8. Lưu ảnh và tính chất lượng (PSNR, SSIM, MSE)
        
        Tham số:
            host_image_path (str): Đường dẫn ảnh gốc
            watermark_image_path (str): Đường dẫn ảnh thủy vân
            output_path (str): Đường dẫn lưu ảnh đã nhúng thủy vân
        
        Trả về:
            dict: Thông tin về quá trình nhúng
        """
        # ===== BƯỚC 1: ĐỌC ẢNH =====
        # Đọc ảnh gốc
        host = cv2.imread(host_image_path)
        # Đọc ảnh thủy vân
        watermark = cv2.imread(watermark_image_path)
        
        # Kiểm tra ảnh có đọc được không
        if host is None or watermark is None:
            raise ValueError("Không thể đọc ảnh")
        
        # ===== BƯỚC 2: CHUYỂN ẢNH GỐC SANG KHÔNG GIAN MÀU YCrCb =====
        # YCrCb: Y (độ sáng), Cr (màu đỏ), Cb (màu xanh)
        # Nhúng thủy vân vào kênh Y vì:
        # - Mắt người nhạy cảm với độ sáng hơn màu sắc
        # - Kênh Y chứa thông tin chính của ảnh
        host_ycrcb = cv2.cvtColor(host, cv2.COLOR_BGR2YCrCb)
        # Lấy kênh Y (độ sáng) và chuyển sang float32 để tính toán
        host_y = host_ycrcb[:, :, 0].astype(np.float32)
        
        # ===== BƯỚC 3: ÁP DỤNG DWT =====
        # pywt.dwt2: phép biến đổi wavelet rời rạc 2 chiều
        # 'haar': loại wavelet (đơn giản, nhanh, hiệu quả)
        # Kết quả: 4 băng tần con
        # - LL: Tần số thấp - chứa thông tin chính, năng lượng cao
        # - LH: Tần số trung bình ngang - biên ngang
        # - HL: Tần số trung bình dọc - biên dọc
        # - HH: Tần số cao - chi tiết, nhiễu
        coeffs = pywt.dwt2(host_y, 'haar')
        LL, (LH, HL, HH) = coeffs
        
        # Chọn băng tần LH để nhúng thủy vân
        # Lý do chọn LH:
        # - Không ảnh hưởng đến LL (thông tin chính) → chất lượng ảnh tốt
        # - Không dùng HH (nhiễu cao) → bền vững hơn
        # - LH cân bằng giữa không nhìn thấy và bền vững
        selected_band = LH
        
        # ===== BƯỚC 4: TÍNH KÍCH THƯỚC THỦY VÂN =====
        # Lấy kích thước băng tần đã chọn
        h, w = selected_band.shape
        # Tính số khối 8x8 có thể chia được
        num_blocks_h = h // self.block_size  # Số khối theo chiều cao
        num_blocks_w = w // self.block_size  # Số khối theo chiều rộng
        
        # Tính kích thước thủy vân dựa trên số khối
        # Công thức: kích_thước_thủy_vân = căn_bậc_2(số_khối / 2)
        # Chia 2 để cân bằng giữa dung lượng và chất lượng
        watermark_size = int(np.sqrt(num_blocks_h * num_blocks_w // 2))
        
        # Làm tròn lên bội số của 8 (chuẩn cho xử lý ảnh)
        # Ví dụ: 35 → 40, 41 → 48
        watermark_size = ((watermark_size + 7) // 8) * 8
        
        # Giới hạn tối đa 64x64 (tránh thủy vân quá lớn)
        watermark_size = min(watermark_size, 64)
        
        # ===== BƯỚC 5: CHUẨN BỊ THỦY VÂN =====
        # Xử lý thủy vân: resize, xám, nhị phân, xáo trộn
        watermark_prepared = self._prepare_watermark(watermark, watermark_size)
        # Làm phẳng thành mảng 1 chiều để dễ duyệt
        # Ví dụ: 32x32 → 1024 phần tử
        watermark_flat = watermark_prepared.flatten()
        
        # ===== BƯỚC 6: NHÚNG THỦY VÂN VÀO CÁC KHỐI DCT-SVD =====
        # Sao chép băng tần để không làm thay đổi băng tần gốc
        watermarked_band = selected_band.copy()
        # Chỉ số bit thủy vân hiện tại
        watermark_idx = 0
        
        # Duyệt qua từng khối 8x8 trong băng tần
        # range(0, h - block_size + 1, block_size): bắt đầu từ 0, bước nhảy block_size
        # h - block_size + 1: đảm bảo khối cuối không vượt quá biên
        for i in range(0, h - self.block_size + 1, self.block_size):  # Duyệt theo chiều cao
            for j in range(0, w - self.block_size + 1, self.block_size):  # Duyệt theo chiều rộng
                # Nếu đã nhúng hết thủy vân thì dừng
                if watermark_idx >= len(watermark_flat):
                    break
                
                # ===== LẤY KHỐI 8x8 =====
                # Cắt khối 8x8 từ băng tần
                # i:i+block_size: từ hàng i đến i+8
                # j:j+block_size: từ cột j đến j+8
                block = selected_band[i:i+self.block_size, j:j+self.block_size]
                
                # ===== ÁP DỤNG DCT TRANSFORM =====
                # Chuyển khối từ miền không gian sang miền tần số
                dct_block = self._dct2(block)
                
                # ===== ÁP DỤNG SVD EMBEDDING =====
                # Nhúng 1 bit thủy vân vào giá trị kỳ dị lớn nhất
                # watermark_flat[watermark_idx]: bit thủy vân cần nhúng (0 hoặc 1)
                dct_block_modified = self._embed_svd(dct_block, watermark_flat[watermark_idx])
                
                # ===== ÁP DỤNG IDCT TRANSFORM =====
                # Chuyển khối từ miền tần số về miền không gian
                watermarked_block = self._idct2(dct_block_modified)
                
                # ===== LƯU KHỐI ĐÃ NHÚNG VÀO BĂNG TẦN =====
                # Ghi đè khối đã nhúng thủy vân vào băng tần
                watermarked_band[i:i+self.block_size, j:j+self.block_size] = watermarked_block
                
                # Tăng chỉ số bit thủy vân
                watermark_idx += 1
            
            # Nếu đã nhúng hết thủy vân thì thoát vòng lặp ngoài
            if watermark_idx >= len(watermark_flat):
                break
        
        # ===== BƯỚC 7: TÁI TẠO ẢNH TỪ DWT =====
        # Ghép băng tần LH đã nhúng thủy vân với các băng tần khác
        # coeffs_modified: (LL, (LH_modified, HL, HH))
        coeffs_modified = (LL, (watermarked_band, HL, HH))
        
        # pywt.idwt2: phép biến đổi wavelet nghịch đảo 2 chiều
        # Tái tạo kênh Y từ 4 băng tần
        watermarked_y = pywt.idwt2(coeffs_modified, 'haar')
        
        # ===== BƯỚC 8: ĐIỀU CHỈNH KÍCH THƯỚC (NẾU CẦN) =====
        # DWT có thể làm thay đổi kích thước một chút do làm tròn
        # Kiểm tra và resize về kích thước gốc nếu cần
        if watermarked_y.shape != (host_ycrcb.shape[0], host_ycrcb.shape[1]):
            # cv2.resize: thay đổi kích thước về kích thước gốc
            watermarked_y = cv2.resize(watermarked_y, (host_ycrcb.shape[1], host_ycrcb.shape[0]))
        
        # ===== BƯỚC 9: GIỚI HẠN GIÁ TRỊ VÀ CHUYỂN VỀ UINT8 =====
        # np.clip: giới hạn giá trị trong khoảng [0, 255]
        # astype(np.uint8): chuyển về kiểu số nguyên 8 bit (0-255)
        watermarked_y = np.clip(watermarked_y, 0, 255).astype(np.uint8)
        
        # ===== BƯỚC 10: GHÉP LẠI VỚI CÁC KÊNH MÀU =====
        # Thay kênh Y (độ sáng) bằng kênh Y đã nhúng thủy vân
        # Giữ nguyên kênh Cr và Cb (màu sắc)
        host_ycrcb[:, :, 0] = watermarked_y
        
        # Chuyển từ không gian màu YCrCb về BGR
        watermarked_bgr = cv2.cvtColor(host_ycrcb, cv2.COLOR_YCrCb2BGR)
        
        # ===== BƯỚC 11: LƯU ẢNH =====
        # cv2.imwrite: ghi ảnh ra file
        cv2.imwrite(output_path, watermarked_bgr)
        
        # ===== BƯỚC 12: TÍNH CHẤT LƯỢNG ẢNH =====
        # So sánh ảnh gốc và ảnh đã nhúng thủy vân để đánh giá chất lượng
        
        # PSNR: Tỷ lệ tín hiệu trên nhiễu đỉnh
        # - Đo độ nhiễu giữa 2 ảnh
        # - Càng cao càng tốt (>40 dB là tốt, >50 dB là rất tốt)
        # - PSNR = 10 * log10(MAX^2 / MSE)
        psnr = calculate_psnr(host, watermarked_bgr)
        
        # SSIM: Chỉ số tương đồng cấu trúc
        # - Đo độ tương đồng về cấu trúc, độ sáng, độ tương phản
        # - Giá trị từ 0 đến 1 (càng gần 1 càng giống)
        # - SSIM > 0.95 là rất tốt
        ssim_val = calculate_ssim(host, watermarked_bgr)
        
        # MSE: Sai số bình phương trung bình
        # - Đo độ khác biệt trung bình giữa 2 ảnh
        # - Càng thấp càng tốt (gần 0 là tốt nhất)
        mse = calculate_mse(host, watermarked_bgr)
        
        # ===== BƯỚC 13: TRẢ VỀ THÔNG TIN =====
        # Trả về từ điển chứa thông tin về quá trình nhúng
        return {
            'success': True,  # Trạng thái thành công
            'watermark_size': f"{watermark_size}x{watermark_size}",  # Kích thước thủy vân
            'blocks_used': watermark_idx,  # Số khối đã sử dụng
            'alpha': self.alpha,  # Hệ số nhúng
            'arnold_iterations': self.arnold_iterations,  # Số lần xáo trộn
            'quality_metrics': {  # Các chỉ số chất lượng
                'psnr': float(psnr),  # PSNR (đơn vị dB)
                'ssim': float(ssim_val),  # SSIM (từ 0 đến 1)
                'mse': float(mse)  # MSE
            },
            'algorithm': 'DWT-DCT-SVD',  # Thuật toán đã dùng
            'wavelet': 'haar',  # Loại wavelet
            'embed_band': 'LH'  # Băng tần đã nhúng
        }
    
    def extract(self, watermarked_image_path, original_image_path, watermark_size):
        """
        Trích xuất thủy vân từ ảnh đã nhúng sử dụng thuật toán DWT-DCT-SVD
        
        Quy trình trích xuất:
        1. Đọc ảnh đã nhúng thủy vân và ảnh gốc
        2. Chuyển cả 2 ảnh sang không gian màu YCrCb (lấy kênh Y)
        3. Áp dụng DWT lên cả 2 kênh Y → 4 băng tần
        4. Chọn băng tần LH (giống lúc nhúng)
        5. Chia băng tần thành các khối 8x8
        6. Với mỗi khối:
           - Áp dụng DCT trên cả 2 khối (đã nhúng và gốc)
           - Áp dụng SVD trên cả 2 khối
           - So sánh giá trị kỳ dị để trích xuất bit
        7. Ghép các bit thành ảnh thủy vân
        8. Xáo trộn ngược Arnold Cat Map
        9. Scale về 0-255 để hiển thị
        
        Tham số:
            watermarked_image_path (str): Đường dẫn ảnh đã nhúng thủy vân
            original_image_path (str): Đường dẫn ảnh gốc (cần để so sánh)
            watermark_size (int): Kích thước thủy vân (phải biết trước, ví dụ: 32, 64)
        
        Trả về:
            numpy.ndarray: Ảnh thủy vân đã trích xuất (grayscale, 0-255)
        """
        # ===== BƯỚC 1: ĐỌC ẢNH =====
        # Đọc ảnh đã nhúng thủy vân
        watermarked = cv2.imread(watermarked_image_path)
        # Đọc ảnh gốc (cần để so sánh)
        original = cv2.imread(original_image_path)
        
        # Kiểm tra ảnh có đọc được không
        if watermarked is None or original is None:
            raise ValueError("Không thể đọc ảnh")
        
        # ===== BƯỚC 2: CHUYỂN SANG KÊNH Y (ĐỘ SÁNG) =====
        # Chuyển ảnh đã nhúng thủy vân sang YCrCb và lấy kênh Y
        # [:, :, 0]: lấy kênh đầu tiên (Y)
        # astype(np.float32): chuyển sang float32 để tính toán
        watermarked_y = cv2.cvtColor(watermarked, cv2.COLOR_BGR2YCrCb)[:, :, 0].astype(np.float32)
        # Chuyển ảnh gốc sang YCrCb và lấy kênh Y
        original_y = cv2.cvtColor(original, cv2.COLOR_BGR2YCrCb)[:, :, 0].astype(np.float32)
        
        # ===== BƯỚC 3: ÁP DỤNG DWT =====
        # Áp dụng DWT lên ảnh đã nhúng thủy vân
        coeffs_wm = pywt.dwt2(watermarked_y, 'haar')
        # Áp dụng DWT lên ảnh gốc
        coeffs_orig = pywt.dwt2(original_y, 'haar')
        
        # Tách các băng tần của ảnh đã nhúng thủy vân
        LL_wm, (LH_wm, HL_wm, HH_wm) = coeffs_wm
        # Tách các băng tần của ảnh gốc
        LL_orig, (LH_orig, HL_orig, HH_orig) = coeffs_orig
        
        # Chọn băng tần LH (phải giống lúc nhúng)
        selected_band_wm = LH_wm
        selected_band_orig = LH_orig
        
        # Lấy kích thước băng tần
        h, w = selected_band_wm.shape
        
        # ===== BƯỚC 4: TRÍCH XUẤT CÁC BIT THỦY VÂN TỪ CÁC KHỐI DCT-SVD =====
        # Tạo danh sách để lưu các bit thủy vân đã trích xuất
        extracted_bits = []
        
        # Duyệt qua từng khối 8x8 trong băng tần (giống lúc nhúng)
        for i in range(0, h - self.block_size + 1, self.block_size):  # Duyệt theo chiều cao
            for j in range(0, w - self.block_size + 1, self.block_size):  # Duyệt theo chiều rộng
                # Kiểm tra đã trích xuất đủ bit chưa
                # watermark_size * watermark_size: tổng số bit cần trích xuất
                # Ví dụ: 32x32 = 1024 bit
                if len(extracted_bits) >= watermark_size * watermark_size:
                    break  # Dừng nếu đã đủ
                
                # ===== LẤY KHỐI 8x8 TỪ CẢ 2 ẢNH =====
                # Cắt khối 8x8 từ băng tần của ảnh đã nhúng thủy vân
                watermarked_block = selected_band_wm[i:i+self.block_size, j:j+self.block_size]
                # Cắt khối 8x8 từ băng tần của ảnh gốc
                original_block = selected_band_orig[i:i+self.block_size, j:j+self.block_size]
                
                # ===== ÁP DỤNG DCT TRANSFORM TRÊN CẢ 2 KHỐI =====
                # Chuyển khối của ảnh đã nhúng từ miền không gian sang miền tần số
                dct_watermarked = self._dct2(watermarked_block)
                # Chuyển khối của ảnh gốc từ miền không gian sang miền tần số
                dct_original = self._dct2(original_block)
                
                # ===== ÁP DỤNG SVD EXTRACTION =====
                # So sánh giá trị kỳ dị của 2 khối để trích xuất bit
                # Hàm _extract_svd sẽ:
                # 1. Phân tích SVD cả 2 khối
                # 2. So sánh S[0] (giá trị kỳ dị lớn nhất)
                # 3. Trả về bit (0 hoặc 1)
                bit = self._extract_svd(dct_watermarked, dct_original)
                # Thêm bit vào danh sách
                extracted_bits.append(bit)
            
            # Kiểm tra lại nếu đã trích xuất đủ bit thì thoát vòng lặp ngoài
            if len(extracted_bits) >= watermark_size * watermark_size:
                break
        
        # ===== BƯỚC 5: GHÉP CÁC BIT THÀNH ẢNH THỦY VÂN =====
        # Chuyển danh sách bit thành mảng numpy
        # [:watermark_size * watermark_size]: lấy đúng số bit cần thiết (phòng trường hợp thừa)
        extracted_watermark = np.array(extracted_bits[:watermark_size * watermark_size])
        # Reshape từ mảng 1 chiều thành ảnh 2 chiều
        # Ví dụ: [1024 phần tử] → [32x32]
        extracted_watermark = extracted_watermark.reshape(watermark_size, watermark_size)
        
        # ===== BƯỚC 6: XÁO TRỘN NGƯỢC ARNOLD CAT MAP =====
        # inverse_arnold_cat_map: hàm xáo trộn ngược để khôi phục thủy vân gốc
        # self.arnold_iterations: số lần xáo trộn (phải giống lúc nhúng)
        # Mục đích: khôi phục lại thủy vân từ trạng thái đã xáo trộn
        extracted_watermark = inverse_arnold_cat_map(extracted_watermark, self.arnold_iterations)
        
        # ===== BƯỚC 7: SCALE VỀ 0-255 ĐỂ HIỂN THỊ =====
        # Hiện tại thủy vân chỉ chứa giá trị 0 và 1
        # Nhân với 255 để chuyển thành:
        # - 0 → 0 (đen)
        # - 1 → 255 (trắng)
        # astype(np.uint8): chuyển về kiểu số nguyên 8 bit (0-255)
        extracted_watermark = (extracted_watermark * 255).astype(np.uint8)
        
        # Trả về ảnh thủy vân đã trích xuất
        return extracted_watermark
