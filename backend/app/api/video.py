"""
Video Watermarking API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import tempfile
import os
from app.core.video_proc import VideoWatermark

router = APIRouter()

@router.post("/embed")
async def embed_video_watermark(
    video: UploadFile = File(...),
    watermark: UploadFile = File(...),
    alpha: float = Form(0.1),
    frame_skip: int = Form(5)
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
        
        video_wm = VideoWatermark(alpha=alpha, frame_skip=frame_skip)
        result = video_wm.embed(video_path, wm_path, output_path)
        
        result['watermarked_video'] = output_path
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
