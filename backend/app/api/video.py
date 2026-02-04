"""
API xử lý thủy vân video
Nhúng và trích xuất thủy vân từ video sử dụng DWT-DCT-SVD
"""
# Thư viện FastAPI để tạo API endpoints
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# StreamingResponse để stream tiến độ theo thời gian thực
from fastapi.responses import StreamingResponse
# Thư viện xử lý file tạm thời
import tempfile
# Thư viện xử lý đường dẫn file
import os
# Thư viện mã hóa base64 (chuyển video thành chuỗi text)
import base64
# Thư viện OpenCV để xử lý video
import cv2
# Thư viện JSON để chuyển đổi dữ liệu
import json
# Thư viện asyncio để xử lý bất đồng bộ
import asyncio
# ThreadPoolExecutor để chạy xử lý video trong luồng riêng (không block)
from concurrent.futures import ThreadPoolExecutor
# Import class xử lý thủy vân video
from app.core.video_proc import VideoWatermark

# Tạo router cho các endpoint video
router = APIRouter()

# Tạo thread pool với 2 worker để xử lý video song song
# Giới hạn 2 worker để tránh quá tải CPU/RAM
executor = ThreadPoolExecutor(max_workers=2)

@router.post("/embed")
async def embed_video_watermark(
    video: UploadFile = File(...),
    watermark: UploadFile = File(...),
    alpha: float = Form(0.1),
    frame_skip: int = Form(5),
    arnold_iterations: int = Form(10)
):
    """
    Nhúng thủy vân vào video với streaming tiến độ theo thời gian thực
    
    Tham số:
        video: File video gốc (MP4, AVI, ...)
        watermark: File ảnh thủy vân (PNG, JPG, ...)
        alpha: Hệ số nhúng (0.1 = 10%, càng cao càng bền vững nhưng càng thấy rõ)
        frame_skip: Nhúng thủy vân mỗi N khung hình (5 = mỗi 5 frame nhúng 1 lần)
        arnold_iterations: Số lần xáo trộn Arnold Cat Map (tăng bảo mật)
    
    Trả về:
        StreamingResponse: Stream các sự kiện tiến độ (SSE - Server-Sent Events)
    """
    
    async def generate():
        """
        Hàm generator để stream tiến độ theo thời gian thực
        Gửi các sự kiện về client qua SSE
        """
        try:
            # ===== BƯỚC 1: TẢI VÀ LƯU FILE LÊN SERVER =====
            # Gửi thông báo bắt đầu tải file (0%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải files lên...'})}\n\n"
            # Chờ 0.1 giây để client nhận được thông báo
            await asyncio.sleep(0.1)
            
            # Tạo thư mục tạm để lưu các file
            temp_dir = tempfile.mkdtemp()
            # Đường dẫn file video tạm
            video_path = os.path.join(temp_dir, "video.mp4")
            # Đường dẫn file thủy vân tạm
            wm_path = os.path.join(temp_dir, "watermark.png")
            # Đường dẫn file video đã nhúng thủy vân
            output_path = os.path.join(temp_dir, "watermarked_video.mp4")
            
            # Lưu video gốc vào file tạm
            # await video.read(): đọc toàn bộ nội dung file video
            with open(video_path, "wb") as f:
                f.write(await video.read())
            # Lưu ảnh thủy vân vào file tạm
            with open(wm_path, "wb") as f:
                f.write(await watermark.read())
            
            # Gửi thông báo đã tải xong file (100%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong files'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 2: KHỞI TẠO VÀ LẤY THÔNG TIN VIDEO =====
            # Gửi thông báo bắt đầu khởi tạo (0%)
            yield f"data: {json.dumps({'stage': 'init', 'progress': 0, 'message': 'Đang khởi tạo...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Mở video để lấy thông tin
            cap = cv2.VideoCapture(video_path)
            # Lấy tổng số khung hình (frames) trong video
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            # Lấy số khung hình trên giây (FPS - Frames Per Second)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            # Đóng video (chỉ lấy thông tin, chưa xử lý)
            cap.release()
            
            # Gửi thông báo đã khởi tạo xong với thông tin video (100%)
            yield f"data: {json.dumps({'stage': 'init', 'progress': 100, 'message': f'Sẵn sàng xử lý {total_frames} frames ({fps} FPS)'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 3: XỬ LÝ VIDEO VỚI STREAMING TIẾN ĐỘ =====
            # Gửi thông báo bắt đầu xử lý (0%)
            yield f"data: {json.dumps({'stage': 'processing', 'progress': 0, 'message': f'Đang xử lý 0/{total_frames} frames (0%)'})}\n\n"
            
            # Tạo biến chia sẻ để lưu tiến độ giữa các luồng
            # current: số frame đã xử lý
            # total: tổng số frame
            progress_state = {'current': 0, 'total': total_frames}
            
            def progress_callback(current, total):
                """
                Hàm callback được gọi từ VideoWatermark để cập nhật tiến độ
                """
                progress_state['current'] = current
                progress_state['total'] = total
            
            # Khởi tạo đối tượng xử lý thủy vân video
            video_wm = VideoWatermark(
                alpha=alpha,  # Hệ số nhúng
                arnold_iterations=arnold_iterations,  # Số lần xáo trộn
                frame_skip=frame_skip  # Nhúng mỗi N frame
            )
            # Lấy event loop hiện tại
            loop = asyncio.get_event_loop()
            
            # Chạy xử lý video trong thread pool (không block main thread)
            # run_in_executor: chạy hàm đồng bộ trong luồng riêng
            process_task = loop.run_in_executor(
                executor,  # Thread pool
                video_wm.embed,  # Hàm cần chạy
                video_path,  # Tham số 1: đường dẫn video gốc
                wm_path,  # Tham số 2: đường dẫn thủy vân
                output_path,  # Tham số 3: đường dẫn video output
                progress_callback  # Tham số 4: callback tiến độ
            )
            
            # Stream tiến độ trong khi xử lý video
            last_progress = 0  # Lưu tiến độ lần trước để tránh gửi trùng
            while not process_task.done():  # Lặp cho đến khi xử lý xong
                await asyncio.sleep(0.5)  # Kiểm tra mỗi 0.5 giây
                current = progress_state['current']  # Số frame đã xử lý
                total = progress_state['total']  # Tổng số frame
                if total > 0:
                    # Tính phần trăm tiến độ
                    progress = int((current / total) * 100)
                    # Chỉ gửi khi tiến độ thay đổi (tránh spam)
                    if progress != last_progress:
                        last_progress = progress
                        # Gửi thông báo tiến độ
                        yield f"data: {json.dumps({'stage': 'processing', 'progress': progress, 'message': f'Đang xử lý {current}/{total} frames ({progress}%)'})}\n\n"
            
            # Lấy kết quả sau khi xử lý xong
            result = await process_task
            
            # Gửi thông báo đã xử lý xong (100%)
            yield f"data: {json.dumps({'stage': 'processing', 'progress': 100, 'message': f'Đã xử lý xong {total_frames} frames'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 4: MÃ HÓA VIDEO THÀNH BASE64 =====
            # Gửi thông báo bắt đầu mã hóa (0%)
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa video...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Đọc file video đã nhúng thủy vân
            with open(output_path, "rb") as f:
                video_data = f.read()  # Đọc dữ liệu nhị phân
                # Mã hóa thành base64 (chuyển nhị phân thành chuỗi text)
                video_base64 = base64.b64encode(video_data).decode('utf-8')
            
            # Gửi thông báo đã mã hóa xong (100%)
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 100, 'message': 'Đã mã hóa xong'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 5: HOÀN THÀNH VÀ TRẢ KẾT QUẢ =====
            # Thêm video đã mã hóa vào kết quả
            # data:video/mp4;base64,... : định dạng data URL để hiển thị video
            result['watermarked_video'] = f"data:video/mp4;base64,{video_base64}"
            
            # Chuyển kết quả thành JSON
            # ensure_ascii=False: giữ nguyên ký tự tiếng Việt (không escape)
            result_json = json.dumps({
                'stage': 'complete',  # Giai đoạn: hoàn thành
                'progress': 100,  # Tiến độ: 100%
                'message': 'Hoàn thành!',  # Thông báo
                'result': result  # Kết quả chi tiết
            }, ensure_ascii=False)
            
            # Gửi kết quả cuối cùng
            yield f"data: {result_json}\n\n"
            
        except Exception as e:
            # Nếu có lỗi, gửi thông báo lỗi
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    # Trả về StreamingResponse với generator
    # media_type="text/event-stream": định dạng SSE (Server-Sent Events)
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/extract")
async def extract_video_watermark(
    watermarked_video: UploadFile = File(...),
    original_video: UploadFile = File(...),
    frame_number: int = Form(0),
    watermark_size: int = Form(64),
    arnold_iterations: int = Form(10)
):
    """
    Trích xuất thủy vân từ một khung hình cụ thể của video
    
    Tham số:
        watermarked_video: File video đã nhúng thủy vân
        original_video: File video gốc (cần để so sánh)
        frame_number: Số thứ tự khung hình cần trích xuất (0 = frame đầu tiên)
        watermark_size: Kích thước thủy vân (32, 64, ...)
        arnold_iterations: Số lần xáo trộn Arnold (phải giống lúc nhúng)
    
    Trả về:
        StreamingResponse: Stream các sự kiện tiến độ và kết quả
    """
    
    async def generate():
        """
        Hàm generator để stream tiến độ trích xuất
        """
        try:
            # ===== BƯỚC 1: TẢI VIDEO LÊN SERVER =====
            # Gửi thông báo bắt đầu tải (0%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải video lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Tạo thư mục tạm
            temp_dir = tempfile.mkdtemp()
            # Đường dẫn video đã nhúng thủy vân
            watermarked_path = os.path.join(temp_dir, "watermarked.mp4")
            # Đường dẫn video gốc
            original_path = os.path.join(temp_dir, "original.mp4")
            
            # Lưu video đã nhúng thủy vân
            with open(watermarked_path, "wb") as f:
                f.write(await watermarked_video.read())
            # Lưu video gốc
            with open(original_path, "wb") as f:
                f.write(await original_video.read())
            
            # Gửi thông báo đã tải xong (100%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong video'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 2: KIỂM TRA TÍNH HỢP LỆ CỦA VIDEO =====
            # Gửi thông báo bắt đầu kiểm tra (0%)
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra video...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Mở video đã nhúng thủy vân
            cap_wm = cv2.VideoCapture(watermarked_path)
            # Mở video gốc
            cap_orig = cv2.VideoCapture(original_path)
            
            # Kiểm tra video có mở được không
            if not cap_wm.isOpened() or not cap_orig.isOpened():
                # Nếu không mở được, gửi thông báo lỗi
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể mở video. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            
            # Đóng video (chỉ kiểm tra, chưa xử lý)
            cap_wm.release()
            cap_orig.release()
            
            # Gửi thông báo video hợp lệ (100%)
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Video hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 3: TRÍCH XUẤT THỦY VÂN =====
            # Gửi thông báo bắt đầu trích xuất (0%)
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 0, 'message': f'Đang trích xuất từ frame {frame_number}...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Khởi tạo đối tượng xử lý thủy vân video
            video_wm = VideoWatermark(arnold_iterations=arnold_iterations)
            # Trích xuất thủy vân từ frame cụ thể
            # extracted: ảnh thủy vân đã trích xuất (numpy array)
            extracted = video_wm.extract_from_frame(
                watermarked_path,  # Video đã nhúng thủy vân
                original_path,  # Video gốc
                frame_number,  # Số thứ tự frame
                watermark_size  # Kích thước thủy vân
            )
            
            # Gửi thông báo đã trích xuất xong (100%)
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 100, 'message': 'Đã trích xuất xong'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 4: MÃ HÓA THỦY VÂN THÀNH BASE64 =====
            # Gửi thông báo bắt đầu mã hóa (0%)
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa watermark...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Lưu ảnh thủy vân đã trích xuất vào file tạm
            extracted_path = os.path.join(temp_dir, "extracted.png")
            cv2.imwrite(extracted_path, extracted)
            
            # Đọc file ảnh và mã hóa thành base64
            with open(extracted_path, "rb") as f:
                img_data = f.read()  # Đọc dữ liệu nhị phân
                # Mã hóa thành base64
                img_base64 = base64.b64encode(img_data).decode('utf-8')
            
            # Tạo kết quả trả về
            result = {
                'success': True,  # Trạng thái thành công
                'extracted_watermark': f"data:image/png;base64,{img_base64}",  # Ảnh thủy vân (data URL)
                'frame_number': frame_number,  # Số frame đã trích xuất
                'watermark_size': watermark_size  # Kích thước thủy vân
            }
            
            # ===== BƯỚC 5: HOÀN THÀNH VÀ TRẢ KẾT QUẢ =====
            # Chuyển kết quả thành JSON
            # ensure_ascii=False: giữ nguyên ký tự tiếng Việt
            result_json = json.dumps({
                'stage': 'complete',  # Giai đoạn: hoàn thành
                'progress': 100,  # Tiến độ: 100%
                'message': 'Hoàn thành!',  # Thông báo
                'result': result  # Kết quả chi tiết
            }, ensure_ascii=False)
            
            # Gửi kết quả cuối cùng
            yield f"data: {result_json}\n\n"
            
        except Exception as e:
            # Nếu có lỗi, gửi thông báo lỗi
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    # Trả về StreamingResponse với generator
    # media_type="text/event-stream": định dạng SSE
    return StreamingResponse(generate(), media_type="text/event-stream")
