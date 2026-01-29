"""
FastAPI Backend - PyStegoWatermark Suite
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import steganography, watermarking, video
import os

app = FastAPI(
    title="PyStegoWatermark API",
    description="API for Steganography and Digital Watermarking",
    version="1.0.0"
)

# CORS - Allow frontend domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "*",  # Allow all origins for now (change in production)
]

# Get frontend URL from environment variable if available
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routes
app.include_router(steganography.router, prefix="/api/steganography", tags=["Steganography"])
app.include_router(watermarking.router, prefix="/api/watermarking", tags=["Watermarking"])
app.include_router(video.router, prefix="/api/video", tags=["Video"])

@app.get("/")
async def root():
    return {
        "message": "PyStegoWatermark API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "steganography": "/api/steganography",
            "watermarking": "/api/watermarking",
            "video": "/api/video"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "PyStegoWatermark API",
        "version": "1.0.0"
    }
