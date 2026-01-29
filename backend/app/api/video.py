"""
Video Watermarking API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import tempfile
import os
import base64
import cv2
from app.core.video_proc import VideoWatermark

router = APIRouter()

@router.post("/embed")
async def embed_video_watermark(
    video: UploadFile = File(...),
    watermark: UploadFile = File(...),
    alpha: float = Form(0.1),
    frame_skip: int = Form(5),
    arnold_iterations: int = Form(10)
):
    """Embed watermark into video"""
    try:
        temp_dir = tempfile.mkdtemp()
        video_path = os.path.join(temp_dir, "video.mp4")
        wm_path = os.path.join(temp_dir, "watermark.png")
        output_path = os.path.join(temp_dir, "watermarked_video.mp4")
        
        with open(video_path, "wb") as f:
            f.write(await video.read())
        with open(wm_path, "wb") as f:
            f.write(await watermark.read())
        
        video_wm = VideoWatermark(alpha=alpha, arnold_iterations=arnold_iterations, frame_skip=frame_skip)
        result = video_wm.embed(video_path, wm_path, output_path)
        
        # Đọc video và encode base64
        with open(output_path, "rb") as f:
            video_data = f.read()
            video_base64 = base64.b64encode(video_data).decode('utf-8')
        
        result['watermarked_video'] = f"data:video/mp4;base64,{video_base64}"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract")
async def extract_video_watermark(
    watermarked_video: UploadFile = File(...),
    original_video: UploadFile = File(...),
    frame_number: int = Form(0),
    watermark_size: int = Form(64),
    arnold_iterations: int = Form(10)
):
    """Extract watermark from a specific frame of video"""
    try:
        temp_dir = tempfile.mkdtemp()
        watermarked_path = os.path.join(temp_dir, "watermarked.mp4")
        original_path = os.path.join(temp_dir, "original.mp4")
        
        with open(watermarked_path, "wb") as f:
            f.write(await watermarked_video.read())
        with open(original_path, "wb") as f:
            f.write(await original_video.read())
        
        video_wm = VideoWatermark(arnold_iterations=arnold_iterations)
        extracted = video_wm.extract_from_frame(
            watermarked_path, 
            original_path, 
            frame_number, 
            watermark_size
        )
        
        # Lưu watermark đã trích xuất
        extracted_path = os.path.join(temp_dir, "extracted.png")
        cv2.imwrite(extracted_path, extracted)
        
        # Đọc và encode base64
        with open(extracted_path, "rb") as f:
            img_data = f.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return {
            'success': True,
            'extracted_watermark': f"data:image/png;base64,{img_base64}",
            'frame_number': frame_number,
            'watermark_size': watermark_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
