"""
Watermarking API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import tempfile
import os
import base64
import json
import asyncio
from app.core.watermarking import DWT_DCT_SVD_Watermark
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
    """Embed watermark into host image with progress streaming"""
    
    async def generate():
        try:
            # Bước 1: Upload
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            temp_dir = tempfile.mkdtemp()
            host_path = os.path.join(temp_dir, "host.png")
            wm_path = os.path.join(temp_dir, "watermark.png")
            output_path = os.path.join(temp_dir, "watermarked.png")
            
            with open(host_path, "wb") as f:
                f.write(await host_image.read())
            with open(wm_path, "wb") as f:
                f.write(await watermark_image.read())
            
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 2: Validate
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            host_img = cv2.imread(host_path)
            wm_img = cv2.imread(wm_path)
            
            if host_img is None:
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh gốc. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            if wm_img is None:
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh watermark. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 3: Nhúng watermark
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 0, 'message': 'Đang nhúng watermark bằng DWT-DCT-SVD...'})}\n\n"
            await asyncio.sleep(0.1)
            
            watermarker = DWT_DCT_SVD_Watermark(alpha=alpha, arnold_iterations=arnold_iterations, use_dwt=True, wavelet='haar')
            result = watermarker.embed(host_path, wm_path, output_path)
            
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 100, 'message': 'Đã nhúng xong watermark'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 4: Encode (metrics đã có trong result từ core)
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            with open(output_path, "rb") as f:
                watermarked_bytes = f.read()
                watermarked_base64 = base64.b64encode(watermarked_bytes).decode('utf-8')
            
            result['watermarked_image'] = f"data:image/png;base64,{watermarked_base64}"
            
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

@router.post("/extract")
async def extract_watermark(
    watermarked_image: UploadFile = File(...),
    original_image: UploadFile = File(...),
    original_watermark: UploadFile = File(None),
    watermark_size: int = Form(32),
    arnold_iterations: int = Form(10)
):
    """Extract watermark from watermarked image with progress streaming"""
    
    async def generate():
        try:
            # Bước 1: Upload
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            temp_dir = tempfile.mkdtemp()
            wm_path = os.path.join(temp_dir, "watermarked.png")
            orig_path = os.path.join(temp_dir, "original.png")
            
            with open(wm_path, "wb") as f:
                f.write(await watermarked_image.read())
            with open(orig_path, "wb") as f:
                f.write(await original_image.read())
            
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 2: Validate
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            wm_img = cv2.imread(wm_path)
            orig_img = cv2.imread(orig_path)
            
            if wm_img is None or orig_img is None:
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            
            if wm_img.shape != orig_img.shape:
                error_msg = f"Hai ảnh phải có cùng kích thước. Ảnh đã watermark: {wm_img.shape[1]}x{wm_img.shape[0]}, Ảnh gốc: {orig_img.shape[1]}x{orig_img.shape[0]}"
                yield f"data: {json.dumps({'stage': 'error', 'message': error_msg})}\n\n"
                return
            
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 3: Trích xuất
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 0, 'message': 'Đang trích xuất watermark bằng DWT-DCT-SVD...'})}\n\n"
            await asyncio.sleep(0.1)
            
            watermarker = DWT_DCT_SVD_Watermark(arnold_iterations=arnold_iterations, use_dwt=True, wavelet='haar')
            extracted = watermarker.extract(wm_path, orig_path, watermark_size)
            
            # Save extracted watermark
            extracted_path = os.path.join(temp_dir, "extracted_watermark.png")
            cv2.imwrite(extracted_path, extracted)
            
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 100, 'message': 'Đã trích xuất xong'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 4: Encode
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            with open(extracted_path, "rb") as f:
                extracted_bytes = f.read()
                extracted_base64 = base64.b64encode(extracted_bytes).decode('utf-8')
            
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
                orig_wm_resized = cv2.resize(orig_wm, (watermark_size, watermark_size))
                
                nc = calculate_nc(orig_wm_resized, extracted)
                result['nc'] = float(nc)
            
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
