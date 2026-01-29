"""
Video Watermarking API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import tempfile
import os
import base64
import cv2
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from app.core.video_proc import VideoWatermark

router = APIRouter()

# Thread pool for blocking operations
executor = ThreadPoolExecutor(max_workers=2)

@router.post("/embed")
async def embed_video_watermark(
    video: UploadFile = File(...),
    watermark: UploadFile = File(...),
    alpha: float = Form(0.1),
    frame_skip: int = Form(5),
    arnold_iterations: int = Form(10),
    use_scene_detection: bool = Form(True),
    scene_threshold: float = Form(30.0)
):
    """
    Embed watermark into video with progress streaming
    
    CHUẨN HỌC THUẬT:
    - Scene Change Detection: Phát hiện thay đổi cảnh bằng histogram difference
    - Smart Frame Selection: Chỉ nhúng vào key frames
    - Efficiency: Giảm 24x thời gian xử lý so với watermark tất cả frames
    """
    
    async def generate():
        try:
            # Bước 1: Lưu files
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải files lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            temp_dir = tempfile.mkdtemp()
            video_path = os.path.join(temp_dir, "video.mp4")
            wm_path = os.path.join(temp_dir, "watermark.png")
            output_path = os.path.join(temp_dir, "watermarked_video.mp4")
            
            with open(video_path, "wb") as f:
                f.write(await video.read())
            with open(wm_path, "wb") as f:
                f.write(await watermark.read())
            
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong files'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 2: Khởi tạo
            yield f"data: {json.dumps({'stage': 'init', 'progress': 0, 'message': 'Đang khởi tạo...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Lấy thông tin video
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            cap.release()
            
            yield f"data: {json.dumps({'stage': 'init', 'progress': 100, 'message': f'Sẵn sàng xử lý {total_frames} frames ({fps} FPS)'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 3: Xử lý video với progress streaming
            yield f"data: {json.dumps({'stage': 'processing', 'progress': 0, 'message': f'Đang xử lý 0/{total_frames} frames (0%)'})}\n\n"
            
            # Shared state for progress
            progress_state = {'current': 0, 'total': total_frames}
            
            def progress_callback(current, total):
                progress_state['current'] = current
                progress_state['total'] = total
            
            # Run video processing in thread
            video_wm = VideoWatermark(
                alpha=alpha, 
                arnold_iterations=arnold_iterations, 
                frame_skip=frame_skip,
                use_scene_detection=use_scene_detection,
                scene_threshold=scene_threshold
            )
            loop = asyncio.get_event_loop()
            
            # Start processing in background
            process_task = loop.run_in_executor(
                executor,
                video_wm.embed,
                video_path,
                wm_path,
                output_path,
                progress_callback
            )
            
            # Stream progress while processing
            last_progress = 0
            while not process_task.done():
                await asyncio.sleep(0.5)  # Check every 0.5s
                current = progress_state['current']
                total = progress_state['total']
                if total > 0:
                    progress = int((current / total) * 100)
                    if progress != last_progress:
                        last_progress = progress
                        yield f"data: {json.dumps({'stage': 'processing', 'progress': progress, 'message': f'Đang xử lý {current}/{total} frames ({progress}%)'})}\n\n"
            
            # Get result
            result = await process_task
            
            yield f"data: {json.dumps({'stage': 'processing', 'progress': 100, 'message': f'Đã xử lý xong {total_frames} frames'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 4: Encode base64
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa video...'})}\n\n"
            await asyncio.sleep(0.1)
            
            with open(output_path, "rb") as f:
                video_data = f.read()
                video_base64 = base64.b64encode(video_data).decode('utf-8')
            
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 100, 'message': 'Đã mã hóa xong'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 5: Hoàn thành - Sử dụng ensure_ascii=False
            result['watermarked_video'] = f"data:video/mp4;base64,{video_base64}"
            
            result_json = json.dumps({
                'stage': 'complete', 
                'progress': 100, 
                'message': 'Hoàn thành!', 
                'result': result
            }, ensure_ascii=False)
            
            yield f"data: {result_json}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/extract")
async def extract_video_watermark(
    watermarked_video: UploadFile = File(...),
    original_video: UploadFile = File(...),
    frame_number: int = Form(0),
    watermark_size: int = Form(64),
    arnold_iterations: int = Form(10)
):
    """Extract watermark from a specific frame of video with progress streaming"""
    
    async def generate():
        try:
            # Bước 1: Upload
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải video lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            temp_dir = tempfile.mkdtemp()
            watermarked_path = os.path.join(temp_dir, "watermarked.mp4")
            original_path = os.path.join(temp_dir, "original.mp4")
            
            with open(watermarked_path, "wb") as f:
                f.write(await watermarked_video.read())
            with open(original_path, "wb") as f:
                f.write(await original_video.read())
            
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong video'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 2: Validate
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra video...'})}\n\n"
            await asyncio.sleep(0.1)
            
            cap_wm = cv2.VideoCapture(watermarked_path)
            cap_orig = cv2.VideoCapture(original_path)
            
            if not cap_wm.isOpened() or not cap_orig.isOpened():
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể mở video. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            
            cap_wm.release()
            cap_orig.release()
            
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Video hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 3: Trích xuất
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 0, 'message': f'Đang trích xuất từ frame {frame_number}...'})}\n\n"
            await asyncio.sleep(0.1)
            
            video_wm = VideoWatermark(arnold_iterations=arnold_iterations)
            extracted = video_wm.extract_from_frame(
                watermarked_path, 
                original_path, 
                frame_number, 
                watermark_size
            )
            
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 100, 'message': 'Đã trích xuất xong'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 4: Encode
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa watermark...'})}\n\n"
            await asyncio.sleep(0.1)
            
            extracted_path = os.path.join(temp_dir, "extracted.png")
            cv2.imwrite(extracted_path, extracted)
            
            with open(extracted_path, "rb") as f:
                img_data = f.read()
                img_base64 = base64.b64encode(img_data).decode('utf-8')
            
            result = {
                'success': True,
                'extracted_watermark': f"data:image/png;base64,{img_base64}",
                'frame_number': frame_number,
                'watermark_size': watermark_size
            }
            
            # Hoàn thành - Sử dụng ensure_ascii=False
            result_json = json.dumps({
                'stage': 'complete', 
                'progress': 100, 
                'message': 'Hoàn thành!', 
                'result': result
            }, ensure_ascii=False)
            
            yield f"data: {result_json}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
