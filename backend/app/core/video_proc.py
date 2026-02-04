"""
Xử lý thủy vân video
Nhúng và trích xuất thủy vân từ video sử dụng DWT-DCT-SVD
"""

# Thư viện OpenCV để xử lý video và ảnh
import cv2
# Thư viện xử lý đường dẫn file
import os
# Thư viện tạo file tạm thời
import tempfile
# Thư viện numpy để xử lý mảng số
import numpy as np
# Import class xử lý thủy vân ảnh (DWT-DCT-SVD)
from app.core.watermarking import DWT_DCT_SVD_Watermark
# Thư viện tqdm để hiển thị thanh tiến độ (không dùng trong API)
from tqdm import tqdm


class VideoWatermark:
    """
    Lớp xử lý thủy vân video với DWT-DCT-SVD
    
    Cách hoạt động:
    - Video = chuỗi các khung hình (frames)
    - Nhúng thủy vân vào từng frame bằng DWT-DCT-SVD (giống thủy vân ảnh)
    - Để tăng tốc: chỉ nhúng vào một số frame (frame_skip)
    - Ví dụ: frame_skip=5 → nhúng vào frame 0, 5, 10, 15, ...
    """
    
    def __init__(self, alpha=0.1, arnold_iterations=10, frame_skip=5):
        """
        Khởi tạo đối tượng xử lý thủy vân video
        
        Tham số:
            alpha: Hệ số nhúng thủy vân (0.1 = 10%)
                - Càng cao càng bền vững nhưng càng thấy rõ
                - 0.05-0.1: cân bằng giữa không nhìn thấy và bền vững
            arnold_iterations: Số lần xáo trộn Arnold Cat Map
                - Tăng bảo mật bằng cách xáo trộn thủy vân
            frame_skip: Nhúng thủy vân mỗi N khung hình
                - frame_skip=1: nhúng vào tất cả frame (chậm, bền vững cao)
                - frame_skip=5: nhúng mỗi 5 frame (nhanh hơn, vẫn bền vững)
                - frame_skip=10: nhúng mỗi 10 frame (nhanh nhất, bền vững thấp hơn)
        """
        # Khởi tạo đối tượng xử lý thủy vân ảnh
        # Dùng DWT-DCT-SVD (3 lớp biến đổi) giống như thủy vân ảnh
        self.watermarker = DWT_DCT_SVD_Watermark(
            alpha=alpha,  # Hệ số nhúng
            arnold_iterations=arnold_iterations  # Số lần xáo trộn
        )
        # Lưu frame_skip
        self.frame_skip = frame_skip
    


    def embed(self, video_path, watermark_path, output_path, progress_callback=None):
        """
        Nhúng thủy vân vào video
        
        Quy trình:
        1. Mở video và lấy thông tin (FPS, độ phân giải, tổng số frame)
        2. Tạo VideoWriter để ghi video mới
        3. Duyệt qua từng frame:
           - Nếu là key frame (frame_skip): nhúng thủy vân bằng DWT-DCT-SVD
           - Nếu không: giữ nguyên frame
        4. Ghi frame vào video mới
        5. Trả về thông tin về quá trình nhúng
        
        Tham số:
            video_path: Đường dẫn video gốc
            watermark_path: Đường dẫn ảnh thủy vân
            output_path: Đường dẫn lưu video đã nhúng thủy vân
            progress_callback: Hàm callback để báo tiến độ (tùy chọn)
        
        Trả về:
            dict: Thông tin về quá trình nhúng
        """
        # ===== BƯỚC 1: MỞ VIDEO VÀ LẤY THÔNG TIN =====
        # Mở video gốc
        cap = cv2.VideoCapture(video_path)
        # Kiểm tra video có mở được không
        if not cap.isOpened():
            raise ValueError(f"Không thể mở video: {video_path}")
        
        # Lấy thông tin video
        # FPS: số khung hình trên giây (Frames Per Second)
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        # Chiều rộng video (pixels)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        # Chiều cao video (pixels)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        # Tổng số khung hình trong video
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # ===== BƯỚC 2: TẠO DANH SÁCH KEY FRAMES =====
        # Key frames: các frame sẽ được nhúng thủy vân
        # range(0, total_frames, frame_skip): từ 0 đến total_frames, bước nhảy frame_skip
        # Ví dụ: total_frames=100, frame_skip=5 → [0, 5, 10, 15, ..., 95]
        key_frames = list(range(0, total_frames, self.frame_skip))
        print(f"Xử lý mỗi {self.frame_skip} frames ({len(key_frames)} frames sẽ được nhúng thủy vân)")
        
        # ===== BƯỚC 3: TẠO VIDEO WRITER =====
        # fourcc: codec để nén video (mp4v = MPEG-4)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        # Tạo VideoWriter để ghi video mới
        # output_path: đường dẫn file output
        # fourcc: codec
        # fps: số khung hình trên giây (giống video gốc)
        # (width, height): độ phân giải (giống video gốc)
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # ===== BƯỚC 4: TẠO THƯ MỤC TẠM =====
        # Tạo thư mục tạm để lưu các frame khi xử lý
        temp_dir = tempfile.mkdtemp()
        
        # Khởi tạo biến đếm
        frame_count = 0  # Số frame đã xử lý
        watermarked_count = 0  # Số frame đã nhúng thủy vân
        watermark_size_result = None  # Kích thước thủy vân (lấy từ frame đầu tiên)
        
        print(f"Đang xử lý video: {total_frames} frames, {fps} FPS")
        
        # ===== BƯỚC 5: DUYỆT QUA TỪNG FRAME =====
        while True:
            # Đọc frame tiếp theo
            # ret: True nếu đọc thành công, False nếu hết video
            # frame: dữ liệu frame (numpy array)
            ret, frame = cap.read()
            # Nếu không đọc được frame (hết video), thoát vòng lặp
            if not ret:
                break
            
            # Kiểm tra frame hiện tại có phải key frame không
            if frame_count in key_frames:
                # ===== NHÚNG THỦY VÂN VÀO KEY FRAME =====
                # Tạo đường dẫn file tạm cho frame gốc
                temp_frame_path = os.path.join(temp_dir, f"frame_{frame_count}.png")
                # Tạo đường dẫn file tạm cho frame đã nhúng thủy vân
                temp_watermarked_path = os.path.join(temp_dir, f"watermarked_{frame_count}.png")
                
                # Lưu frame gốc vào file tạm
                cv2.imwrite(temp_frame_path, frame)
                
                # Nhúng thủy vân vào frame
                try:
                    # Gọi hàm embed của watermarker (DWT-DCT-SVD)
                    embed_result = self.watermarker.embed(temp_frame_path, watermark_path, temp_watermarked_path)
                    
                    # Lưu kích thước thủy vân từ frame đầu tiên
                    if watermarked_count == 0 and 'watermark_size' in embed_result:
                        watermark_size_result = embed_result['watermark_size']
                    
                    # Đọc frame đã nhúng thủy vân
                    watermarked_frame = cv2.imread(temp_watermarked_path)
                    # Ghi frame đã nhúng thủy vân vào video mới
                    out.write(watermarked_frame)
                    # Tăng số frame đã nhúng thủy vân
                    watermarked_count += 1
                    
                    # Xóa file tạm để tiết kiệm dung lượng
                    os.remove(temp_frame_path)
                    os.remove(temp_watermarked_path)
                except Exception as e:
                    # Nếu có lỗi khi nhúng thủy vân, in lỗi và giữ nguyên frame
                    print(f"Lỗi khi nhúng thủy vân vào frame {frame_count}: {e}")
                    out.write(frame)
            else:
                # ===== GIỮ NGUYÊN FRAME (KHÔNG NHÚNG THỦY VÂN) =====
                # Ghi frame gốc vào video mới
                out.write(frame)
            
            # Tăng số frame đã xử lý
            frame_count += 1
            
            # ===== GỌI CALLBACK TIẾN ĐỘ =====
            # Nếu có hàm callback, gọi để báo tiến độ
            if progress_callback:
                progress_callback(frame_count, total_frames)
            
            # In tiến độ mỗi 30 frame (để không spam console)
            if frame_count % 30 == 0:
                print(f"Đã xử lý {frame_count}/{total_frames} frames ({frame_count/total_frames*100:.1f}%)")
        
        # ===== BƯỚC 6: GIẢI PHÓNG TÀI NGUYÊN =====
        # Đóng video gốc
        cap.release()
        # Đóng video writer (hoàn tất ghi video)
        out.release()
        
        # Xóa thư mục tạm
        try:
            os.rmdir(temp_dir)
        except:
            # Nếu không xóa được (có thể còn file), bỏ qua
            pass
        
        # ===== BƯỚC 7: TRẢ VỀ THÔNG TIN =====
        return {
            'success': True,  # Trạng thái thành công
            'total_frames': total_frames,  # Tổng số frame
            'watermarked_frames': watermarked_count,  # Số frame đã nhúng thủy vân
            'fps': fps,  # FPS
            'resolution': f"{width}x{height}",  # Độ phân giải
            'frame_skip': self.frame_skip,  # Frame skip
            'watermark_size': watermark_size_result  # Kích thước thủy vân
        }
    
    def extract_from_frame(self, video_path, original_video_path, frame_number, watermark_size):
        """
        Trích xuất thủy vân từ một khung hình cụ thể của video
        
        Quy trình:
        1. Mở cả 2 video (đã nhúng thủy vân và gốc)
        2. Nhảy đến frame cần trích xuất
        3. Đọc frame từ cả 2 video
        4. Lưu 2 frame vào file tạm
        5. Gọi hàm extract của watermarker (DWT-DCT-SVD)
        6. Trả về ảnh thủy vân đã trích xuất
        
        Tham số:
            video_path: Đường dẫn video đã nhúng thủy vân
            original_video_path: Đường dẫn video gốc (cần để so sánh)
            frame_number: Số thứ tự frame cần trích xuất (0 = frame đầu tiên)
            watermark_size: Kích thước thủy vân (phải biết trước, ví dụ: 32, 64)
        
        Trả về:
            numpy.ndarray: Ảnh thủy vân đã trích xuất (grayscale, 0-255)
        """
        # ===== BƯỚC 1: MỞ CẢ 2 VIDEO =====
        # Mở video đã nhúng thủy vân
        cap_watermarked = cv2.VideoCapture(video_path)
        # Mở video gốc
        cap_original = cv2.VideoCapture(original_video_path)
        
        # ===== BƯỚC 2: NHẢY ĐÉN FRAME CẦN TRÍCH XUẤT =====
        # cv2.CAP_PROP_POS_FRAMES: thuộc tính vị trí frame
        # set: đặt vị trí frame hiện tại
        # Nhảy đến frame cần trích xuất trong video đã nhúng thủy vân
        cap_watermarked.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        # Nhảy đến frame cần trích xuất trong video gốc
        cap_original.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        
        # ===== BƯỚC 3: ĐỌC FRAME =====
        # Đọc frame từ video đã nhúng thủy vân
        # ret1: True nếu đọc thành công
        # watermarked_frame: dữ liệu frame
        ret1, watermarked_frame = cap_watermarked.read()
        # Đọc frame từ video gốc
        ret2, original_frame = cap_original.read()
        
        # Đóng cả 2 video (đã đọc xong frame cần thiết)
        cap_watermarked.release()
        cap_original.release()
        
        # Kiểm tra có đọc được frame không
        if not ret1 or not ret2:
            raise ValueError(f"Không thể đọc frame {frame_number}")
        
        # ===== BƯỚC 4: LƯU FRAME VÀO FILE TẠM =====
        # Tạo thư mục tạm
        temp_dir = tempfile.mkdtemp()
        # Đường dẫn file tạm cho frame đã nhúng thủy vân
        watermarked_path = os.path.join(temp_dir, "watermarked.png")
        # Đường dẫn file tạm cho frame gốc
        original_path = os.path.join(temp_dir, "original.png")
        
        # Lưu frame đã nhúng thủy vân
        cv2.imwrite(watermarked_path, watermarked_frame)
        # Lưu frame gốc
        cv2.imwrite(original_path, original_frame)
        
        # ===== BƯỚC 5: TRÍCH XUẤT THỦY VÂN =====
        # Gọi hàm extract của watermarker (DWT-DCT-SVD)
        # extracted: ảnh thủy vân đã trích xuất (numpy array)
        extracted = self.watermarker.extract(watermarked_path, original_path, watermark_size)
        
        # ===== BƯỚC 6: XÓA FILE TẠM =====
        # Xóa file frame đã nhúng thủy vân
        os.remove(watermarked_path)
        # Xóa file frame gốc
        os.remove(original_path)
        # Xóa thư mục tạm
        os.rmdir(temp_dir)
        
        # Trả về ảnh thủy vân đã trích xuất
        return extracted
