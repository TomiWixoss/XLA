"""
FastAPI Backend - PyStegoWatermark Suite
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import steganography, watermarking, video

app = FastAPI(
    title="PyStegoWatermark API",
    description="API for Steganography and Digital Watermarking",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(steganography.router, prefix="/api/steganography", tags=["Steganography"])
app.include_router(watermarking.router, prefix="/api/watermarking", tags=["Watermarking"])
app.include_router(video.router, prefix="/api/video", tags=["Video"])

@app.get("/")
async def root():
    return {"message": "PyStegoWatermark API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
