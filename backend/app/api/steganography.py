"""
Steganography API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
import tempfile
import os
import base64
import json
import asyncio
from app.core.steganography import LSB_Stego
from app.core.utils import calculate_psnr, calculate_ssim
import cv2

router = APIRouter()

@router.post("/embed")
async def embed_message(
    cover_image: UploadFile = File(...),
    message: str = Form(...),
    use_encryption: bool = Form(False),
    password: str = Form(None)
):
    """Embed text message into image with progress streaming"""
    
    async def generate():
        try:
            # Bước 1: Upload
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            temp_dir = tempfile.mkdtemp()
            cover_path = os.path.join(temp_dir, "cover.png")
            stego_path = os.path.join(temp_dir, "stego.png")
            
            with open(cover_path, "wb") as f:
                f.write(await cover_image.read())
            
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 2: Validate
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            cover_img = cv2.imread(cover_path)
            if cover_img is None:
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh. Vui lòng kiểm tra định dạng file (PNG, BMP, JPG).'})}\n\n"
                return
            
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 3: Nhúng tin
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 0, 'message': 'Đang nhúng tin nhắn...'})}\n\n"
            await asyncio.sleep(0.1)
            
            stego = LSB_Stego(use_encryption=use_encryption, password=password)
            result = stego.embed(cover_path, message, stego_path)
            
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 100, 'message': 'Đã nhúng xong tin nhắn'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 4: Tính metrics
            yield f"data: {json.dumps({'stage': 'metrics', 'progress': 0, 'message': 'Đang tính chất lượng...'})}\n\n"
            await asyncio.sleep(0.1)
            
            original_img = cv2.imread(cover_path)
            stego_img = cv2.imread(stego_path)
            psnr = calculate_psnr(original_img, stego_img)
            ssim = calculate_ssim(original_img, stego_img)
            
            yield f"data: {json.dumps({'stage': 'metrics', 'progress': 100, 'message': 'Đã tính xong metrics'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 5: Encode
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            with open(stego_path, "rb") as f:
                stego_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            # Hoàn thành
            final_result = {
                "success": True,
                "message_length": result['message_length'],
                "bits_used": result['bits_used'],
                "capacity": result['capacity'],
                "usage_percent": result['usage_percent'],
                "encrypted": result['encrypted'],
                "psnr": float(psnr),
                "ssim": float(ssim),
                "stego_image": f"data:image/png;base64,{stego_base64}"
            }
            
            yield f"data: {json.dumps({'stage': 'complete', 'progress': 100, 'message': 'Hoàn thành!', 'result': final_result})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/extract")
async def extract_message(
    stego_image: UploadFile = File(...),
    use_decryption: bool = Form(False),
    password: str = Form(None)
):
    """Extract hidden message from stego image with progress streaming"""
    
    async def generate():
        try:
            # Bước 1: Upload
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            temp_dir = tempfile.mkdtemp()
            stego_path = os.path.join(temp_dir, "stego.png")
            
            with open(stego_path, "wb") as f:
                f.write(await stego_image.read())
            
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 2: Validate
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            stego_img = cv2.imread(stego_path)
            if stego_img is None:
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh stego. Vui lòng kiểm tra định dạng file (PNG, BMP).'})}\n\n"
                return
            
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Bước 3: Trích xuất
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 0, 'message': 'Đang trích xuất tin nhắn...'})}\n\n"
            await asyncio.sleep(0.1)
            
            stego = LSB_Stego(use_encryption=use_decryption, password=password)
            message = stego.extract(stego_path)
            
            # Hoàn thành
            final_result = {"message": message, "length": len(message)}
            yield f"data: {json.dumps({'stage': 'complete', 'progress': 100, 'message': 'Hoàn thành!', 'result': final_result})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
