"""
Watermarking API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
from app.core.watermarking import DCT_SVD_Watermark
from app.core.utils import calculate_psnr, calculate_ssim, calculate_nc
import cv2

router = APIRouter()

@router.post("/embed")
async def embed_watermark(
    host_image: UploadFile = File(...),
    watermark_image: UploadFile = File(...),
    alpha: float = Form(0.1),
    arnold_iterations: int = Form(10)
):
    """Embed watermark into host image"""
    try:
        temp_dir = tempfile.mkdtemp()
        host_path = os.path.join(temp_dir, "host.png")
        wm_path = os.path.join(temp_dir, "watermark.png")
        output_path = os.path.join(temp_dir, "watermarked.png")
        
        with open(host_path, "wb") as f:
            f.write(await host_image.read())
        with open(wm_path, "wb") as f:
            f.write(await watermark_image.read())
        
        watermarker = DCT_SVD_Watermark(alpha=alpha, arnold_iterations=arnold_iterations)
        result = watermarker.embed(host_path, wm_path, output_path)
        
        # Metrics
        original_img = cv2.imread(host_path)
        watermarked_img = cv2.imread(output_path)
        psnr = calculate_psnr(original_img, watermarked_img)
        ssim = calculate_ssim(original_img, watermarked_img)
        
        result['psnr'] = psnr
        result['ssim'] = ssim
        result['watermarked_image'] = output_path
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract")
async def extract_watermark(
    watermarked_image: UploadFile = File(...),
    original_image: UploadFile = File(...),
    watermark_size: int = Form(32),
    arnold_iterations: int = Form(10)
):
    """Extract watermark from watermarked image"""
    try:
        temp_dir = tempfile.mkdtemp()
        wm_path = os.path.join(temp_dir, "watermarked.png")
        orig_path = os.path.join(temp_dir, "original.png")
        
        with open(wm_path, "wb") as f:
            f.write(await watermarked_image.read())
        with open(orig_path, "wb") as f:
            f.write(await original_image.read())
        
        watermarker = DCT_SVD_Watermark(arnold_iterations=arnold_iterations)
        extracted = watermarker.extract(wm_path, orig_path, watermark_size)
        
        return {"extracted_watermark": extracted.tolist(), "size": watermark_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
