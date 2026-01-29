"""
Video Watermarking - Nhúng thủy vân vào video
"""

import cv2
import os
import tempfile
from app.core.watermarking import DCT_SVD_Watermark
from tqdm import tqdm


class VideoWatermark:
    """Class xử lý thủy vân video"""
    
    def __init__(self, alpha=0.1, arnold_iterations=10, frame_skip=1):
        """
        Args:
            alpha: Hệ số nhúng watermark
            arnold_iterations: Số lần xáo trộn Arnold
            frame_skip: Nhúng watermark mỗi N frames (1 = tất cả frames, 5 = mỗi 5 frames)
        """
        self.watermarker = DCT_SVD_Watermark(alpha=alpha, arnold_iterations=arnold_iterations)
        self.frame_skip = frame_skip
    
    def embed(self, video_path, watermark_path, output_path, progress_callback=None):
        """
        Nhúng watermark vào video
        
        Args:
            video_path: Đường dẫn video gốc
            watermark_path: Đường dẫn ảnh watermark
            output_path: Đường dẫn lưu video đã watermark
            progress_callback: Hàm callback để báo tiến độ (optional)
        
        Returns:
            dict: Thông tin về quá trình nhúng
        """
        # Mở video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        # Lấy thông tin video
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Tạo VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Tạo thư mục tạm để lưu frames
        temp_dir = tempfile.mkdtemp()
        
        frame_count = 0
        watermarked_count = 0
        
        print(f"Processing video: {total_frames} frames, {fps} FPS")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Nhúng watermark vào frame (theo frame_skip)
            if frame_count % self.frame_skip == 0:
                # Lưu frame tạm
                temp_frame_path = os.path.join(temp_dir, f"frame_{frame_count}.png")
                temp_watermarked_path = os.path.join(temp_dir, f"watermarked_{frame_count}.png")
                
                cv2.imwrite(temp_frame_path, frame)
                
                # Nhúng watermark
                try:
                    self.watermarker.embed(temp_frame_path, watermark_path, temp_watermarked_path)
                    watermarked_frame = cv2.imread(temp_watermarked_path)
                    out.write(watermarked_frame)
                    watermarked_count += 1
                    
                    # Xóa file tạm
                    os.remove(temp_frame_path)
                    os.remove(temp_watermarked_path)
                except Exception as e:
                    print(f"Error watermarking frame {frame_count}: {e}")
                    out.write(frame)
            else:
                # Giữ nguyên frame
                out.write(frame)
            
            frame_count += 1
            
            # Callback tiến độ
            if progress_callback:
                progress_callback(frame_count, total_frames)
            
            # In tiến độ
            if frame_count % 30 == 0:
                print(f"Processed {frame_count}/{total_frames} frames ({frame_count/total_frames*100:.1f}%)")
        
        # Giải phóng resources
        cap.release()
        out.release()
        
        # Xóa thư mục tạm
        try:
            os.rmdir(temp_dir)
        except:
            pass
        
        return {
            'success': True,
            'total_frames': total_frames,
            'watermarked_frames': watermarked_count,
            'fps': fps,
            'resolution': f"{width}x{height}",
            'frame_skip': self.frame_skip
        }
    
    def extract_from_frame(self, video_path, original_video_path, frame_number, watermark_size):
        """
        Trích xuất watermark từ một frame cụ thể
        
        Args:
            video_path: Video đã watermark
            original_video_path: Video gốc
            frame_number: Số thứ tự frame cần trích xuất
            watermark_size: Kích thước watermark
        
        Returns:
            numpy array: Watermark đã trích xuất
        """
        # Mở video
        cap_watermarked = cv2.VideoCapture(video_path)
        cap_original = cv2.VideoCapture(original_video_path)
        
        # Nhảy đến frame cần trích xuất
        cap_watermarked.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        cap_original.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        
        ret1, watermarked_frame = cap_watermarked.read()
        ret2, original_frame = cap_original.read()
        
        cap_watermarked.release()
        cap_original.release()
        
        if not ret1 or not ret2:
            raise ValueError(f"Cannot read frame {frame_number}")
        
        # Lưu frames tạm
        temp_dir = tempfile.mkdtemp()
        watermarked_path = os.path.join(temp_dir, "watermarked.png")
        original_path = os.path.join(temp_dir, "original.png")
        
        cv2.imwrite(watermarked_path, watermarked_frame)
        cv2.imwrite(original_path, original_frame)
        
        # Trích xuất watermark
        extracted = self.watermarker.extract(watermarked_path, original_path, watermark_size)
        
        # Xóa files tạm
        os.remove(watermarked_path)
        os.remove(original_path)
        os.rmdir(temp_dir)
        
        return extracted
