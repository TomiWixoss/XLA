"""
Watermarking API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
import base64
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
        
        # Validate images
        host_img = cv2.imread(host_path)
        wm_img = cv2.imread(wm_path)
        
        if host_img is None:
            raise HTTPException(status_code=400, detail="Không thể đọc ảnh gốc. Vui lòng kiểm tra định dạng file.")
        if wm_img is None:
            raise HTTPException(status_code=400, detail="Không thể đọc ảnh watermark. Vui lòng kiểm tra định dạng file.")
        
        watermarker = DCT_SVD_Watermark(alpha=alpha, arnold_iterations=arnold_iterations)
        result = watermarker.embed(host_path, wm_path, output_path)
        
        # Metrics
        original_img = cv2.imread(host_path)
        watermarked_img = cv2.imread(output_path)
        psnr = calculate_psnr(original_img, watermarked_img)
        ssim = calculate_ssim(original_img, watermarked_img)
        
        # Read watermarked image as base64
        with open(output_path, "rb") as f:
            watermarked_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        result['psnr'] = psnr
        result['ssim'] = ssim
        result['watermarked_image'] = f"data:image/png;base64,{watermarked_base64}"
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract")
async def extract_watermark(
    watermarked_image: UploadFile = File(...),
    original_image: UploadFile = File(...),
    original_watermark: UploadFile = File(None),
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
        
        # Validate images
        wm_img = cv2.imread(wm_path)
        orig_img = cv2.imread(orig_path)
        
        if wm_img is None or orig_img is None:
            raise HTTPException(status_code=400, detail="Không thể đọc ảnh. Vui lòng kiểm tra định dạng file.")
        
        if wm_img.shape != orig_img.shape:
            error_msg = f"Hai ảnh phải có cùng kích thước. Ảnh đã watermark: {wm_img.shape[1]}x{wm_img.shape[0]}, Ảnh gốc: {orig_img.shape[1]}x{orig_img.shape[0]}"
            raise HTTPException(status_code=400, detail=error_msg)
        
        watermarker = DCT_SVD_Watermark(arnold_iterations=arnold_iterations)
        extracted = watermarker.extract(wm_path, orig_path, watermark_size)
        
        # Save extracted watermark
        extracted_path = os.path.join(temp_dir, "extracted_watermark.png")
        cv2.imwrite(extracted_path, extracted)
        
        # Convert to base64
        with open(extracted_path, "rb") as f:
            extracted_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        result = {
            "extracted_watermark": f"data:image/png;base64,{extracted_base64}",
            "size": watermark_size
        }
        
        # Calculate NC if original watermark provided
        if original_watermark:
            orig_wm_path = os.path.join(temp_dir, "original_watermark.png")
            with open(orig_wm_path, "wb") as f:
                f.write(await original_watermark.read())
            
            orig_wm = cv2.imread(orig_wm_path, cv2.IMREAD_GRAYSCALE)
            # Resize to match extracted size
            orig_wm_resized = cv2.resize(orig_wm, (watermark_size, watermark_size))
            
            nc = calculate_nc(orig_wm_resized, extracted)
            result['nc'] = float(nc)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
