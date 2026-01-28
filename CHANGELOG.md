# Changelog

All notable changes to PyStegoWatermark Suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-28

### Added
- 🔒 **LSB Steganography Module**
  - Text message embedding/extraction
  - AES-256 encryption support
  - Delimiter-based message detection
  - PSNR/SSIM quality metrics

- 🖼️ **DCT-SVD Image Watermarking Module**
  - DCT-based watermark embedding
  - Arnold Cat Map scrambling
  - Configurable alpha parameter
  - Watermark extraction with NC calculation
  - Support for grayscale and color images

- 🎬 **Video Watermarking Module**
  - Frame-by-frame watermark embedding
  - Configurable frame skip for performance
  - Progress tracking
  - MP4/AVI format support

- ⚔️ **Attack Simulation**
  - JPEG compression attack
  - Gaussian noise attack
  - Crop attack
  - Rotation attack
  - Real-time quality comparison

- 🎨 **Streamlit GUI**
  - Modern web-based interface
  - File upload/download
  - Real-time image preview
  - Interactive parameter adjustment
  - Metrics visualization

- 📊 **Quality Metrics**
  - MSE (Mean Squared Error)
  - PSNR (Peak Signal-to-Noise Ratio)
  - SSIM (Structural Similarity Index)
  - NC (Normalized Correlation)

- 📚 **Documentation**
  - Comprehensive README
  - Quick start guide
  - Algorithm details
  - Deployment guide
  - Contributing guidelines
  - Project summary

- 🧪 **Testing**
  - Test script for all modules
  - Sample image generator
  - Setup script

- 🛠️ **Development Tools**
  - Requirements.txt with all dependencies
  - .gitignore for Python projects
  - MIT License
  - Quick run scripts (Windows/Linux)

### Technical Details

#### Core Algorithms
- **LSB**: Least Significant Bit substitution
- **DCT**: Discrete Cosine Transform (8×8 blocks)
- **Arnold Cat Map**: Chaotic scrambling (configurable iterations)
- **AES-256**: Symmetric encryption for messages

#### Performance
- Steganography: ~0.1s for 512×512 image
- Image Watermarking: ~2s for 512×512 image
- Video Watermarking: ~1 min for 5s video (frame_skip=5)

#### Quality
- Steganography PSNR: >50 dB
- Watermarking PSNR: 35-40 dB (alpha=0.1)
- Watermarking NC: >0.8 (after JPEG Q=50)

### Dependencies
- numpy >= 1.24.0
- opencv-python >= 4.8.0
- Pillow >= 10.0.0
- scipy >= 1.11.0
- scikit-image >= 0.21.0
- pycryptodome >= 3.18.0
- ffmpeg-python >= 0.2.0
- streamlit >= 1.28.0
- matplotlib >= 3.7.0
- tqdm >= 4.65.0

### Known Issues
- Video processing can be slow for long videos
- Requires original image for watermark extraction (non-blind)
- Large file uploads may timeout on some platforms

### Future Plans
- [ ] Blind watermark extraction
- [ ] DWT (Discrete Wavelet Transform) support
- [ ] Batch processing
- [ ] REST API
- [ ] GPU acceleration
- [ ] Mobile app

---

## [Unreleased]

### Planned Features
- Audio steganography
- Blockchain integration for copyright
- Machine learning-based attack detection
- Multi-language support
- Dark mode UI

---

## Version History

### Version Numbering
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

### Release Schedule
- Major releases: Yearly
- Minor releases: Quarterly
- Patch releases: As needed

---

## How to Update

### From Source
```bash
git pull origin main
pip install -r requirements.txt --upgrade
```

### Check Version
```python
from core import __version__
print(__version__)  # 1.0.0
```

---

## Support

For issues or questions:
- GitHub Issues: [your-repo]/issues
- Email: [your-email]
- Documentation: See README.md

---

**Note**: This is the initial release. Please report any bugs or issues!
