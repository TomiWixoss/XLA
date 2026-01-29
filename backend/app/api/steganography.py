"""
Steganography API Routes
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
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
        
        result['psnr'] = psnr
        result['ssim'] = ssim
        
        # Return file
        return FileResponse(
            stego_path,
            media_type="image/png",
            filename="stego_image.png",
            headers={
                "X-Message-Length": str(result['message_length']),
                "X-PSNR": str(psnr),
                "X-SSIM": str(ssim),
                "X-Bits-Used": str(result['bits_used']),
            }
        )
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
