"""
Steganography API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import os
import base64
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
    """Embed text message into image"""
    try:
        temp_dir = tempfile.mkdtemp()
        cover_path = os.path.join(temp_dir, "cover.png")
        stego_path = os.path.join(temp_dir, "stego.png")
        
        # Save uploaded image
        with open(cover_path, "wb") as f:
            f.write(await cover_image.read())
        
        # Embed
        stego = LSB_Stego(use_encryption=use_encryption, password=password)
        result = stego.embed(cover_path, message, stego_path)
        
        # Calculate metrics
        original_img = cv2.imread(cover_path)
        stego_img = cv2.imread(stego_path)
        psnr = calculate_psnr(original_img, stego_img)
        ssim = calculate_ssim(original_img, stego_img)
        
        # Read stego image as base64
        with open(stego_path, "rb") as f:
            stego_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        return {
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract")
async def extract_message(
    stego_image: UploadFile = File(...),
    use_decryption: bool = Form(False),
    password: str = Form(None)
):
    """Extract hidden message from stego image"""
    try:
        temp_dir = tempfile.mkdtemp()
        stego_path = os.path.join(temp_dir, "stego.png")
        
        with open(stego_path, "wb") as f:
            f.write(await stego_image.read())
        
        stego = LSB_Stego(use_encryption=use_decryption, password=password)
        message = stego.extract(stego_path)
        
        return {"message": message, "length": len(message)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
