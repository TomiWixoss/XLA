"""
PyStegoWatermark Suite - Streamlit GUI
Giao diện demo cho hệ thống giấu tin và thủy vân ảnh/video
"""

import streamlit as st
import cv2
import numpy as np
from PIL import Image
import os
import tempfile

from core.steganography import LSB_Stego
from core.watermarking import DCT_SVD_Watermark
from core.video_proc import VideoWatermark
from core.utils import (
    calculate_psnr, calculate_ssim, calculate_mse, 
    calculate_nc, apply_attack
)


# Cấu hình trang
st.set_page_config(
    page_title="PyStegoWatermark Suite",
    page_icon="�️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS tùy chỉnh - UI cải tiến
st.markdown("""
<style>
    /* Main header */
    .main-header {
        font-size: 2.8rem;
        font-weight: 700;
        background: linear-gradient(120deg, #1f77b4, #2ca02c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 1rem;
        padding: 1rem 0;
    }
    
    /* Subtitle */
    .subtitle {
        text-align: center;
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    
    /* Metric cards */
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 1rem;
        color: white;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin: 0.5rem 0;
    }
    
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        margin: 0.5rem 0;
    }
    
    .metric-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    /* Info boxes */
    .info-box {
        background-color: #e3f2fd;
        border-left: 4px solid #2196f3;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    .success-box {
        background-color: #e8f5e9;
        border-left: 4px solid #4caf50;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    .warning-box {
        background-color: #fff3e0;
        border-left: 4px solid #ff9800;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    /* Button styling */
    .stButton > button {
        width: 100%;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    
    .stTabs [data-baseweb="tab"] {
        padding: 1rem 2rem;
        font-weight: 600;
    }
    
    /* File uploader */
    [data-testid="stFileUploader"] {
        border: 2px dashed #ccc;
        border-radius: 0.5rem;
        padding: 1rem;
        background-color: #fafafa;
    }
    
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<h1 class="main-header">PyStegoWatermark Suite</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Hệ thống Demo - Đề tài 5: Giấu tin & Thủy vân Ảnh/Video</p>', unsafe_allow_html=True)

# Sidebar - Chọn module
st.sidebar.title("⚙️ Chọn Module")
st.sidebar.markdown("---")

module = st.sidebar.radio(
    "Chức năng:",
    ["Steganography (Giấu tin)", 
     "Image Watermarking", 
     "Video Watermarking",
     "Attack Simulation"],
    index=0
)

st.sidebar.markdown("---")
st.sidebar.markdown("### � Hướng dẫn")
if module == "Steganography (Giấu tin)":
    st.sidebar.info("Giấu tin mật trong ảnh sử dụng thuật toán LSB. Hỗ trợ mã hóa AES-256.")
elif module == "Image Watermarking":
    st.sidebar.info("Nhúng watermark vào ảnh bằng DCT-SVD. Bền với JPEG compression và nhiễu.")
elif module == "Video Watermarking":
    st.sidebar.info("Bảo vệ bản quyền video bằng cách nhúng watermark vào từng frame.")
else:
    st.sidebar.info("Mô phỏng các tấn công để kiểm tra độ bền của watermark.")

st.sidebar.markdown("---")
st.sidebar.markdown("### 💡 Tips")
st.sidebar.markdown("""
- Dùng PNG/BMP cho Steganography
- Alpha = 0.1 cho Watermarking
- Video ngắn (<30s) để demo nhanh
""")


# ==================== MODULE 1: STEGANOGRAPHY ====================
if module == "Steganography (Giấu tin)":
    st.header("🔒 LSB Steganography - Giấu tin mật")
    st.markdown('<div class="info-box">Ẩn thông điệp văn bản vào ảnh sử dụng thuật toán LSB (Least Significant Bit).</div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Nhúng tin", "Trích xuất tin"])
    
    with tab1:
        st.subheader("Nhúng thông điệp vào ảnh")
        
        col1, col2 = st.columns(2)
        
        with col1:
            cover_image = st.file_uploader("Upload ảnh gốc (Cover Image)", 
                                          type=['png', 'bmp', 'jpg'], 
                                          key="stego_cover")
            secret_message = st.text_area("Nhập thông điệp cần giấu:", 
                                         height=150,
                                         placeholder="Nhập tin nhắn bí mật...")
            
            use_encryption = st.checkbox("Mã hóa thông điệp (AES-256)", help="Bảo vệ thông điệp bằng mã hóa AES-256")
            password = ""
            if use_encryption:
                password = st.text_input("Mật khẩu:", type="password")
        
        with col2:
            if cover_image:
                image = Image.open(cover_image)
                st.image(image, caption="Ảnh gốc", use_container_width=True)
        
        if st.button("Nhúng thông điệp", type="primary", use_container_width=True):
            if not cover_image or not secret_message:
                st.error("Vui lòng upload ảnh và nhập thông điệp!")
            elif use_encryption and not password:
                st.error("Vui lòng nhập mật khẩu!")
            else:
                with st.spinner("Đang nhúng thông điệp..."):
                    # Lưu file tạm
                    temp_dir = tempfile.mkdtemp()
                    cover_path = os.path.join(temp_dir, "cover.png")
                    stego_path = os.path.join(temp_dir, "stego.png")
                    
                    image.save(cover_path)
                    
                    # Nhúng
                    try:
                        stego = LSB_Stego(use_encryption=use_encryption, 
                                         password=password if use_encryption else None)
                        result = stego.embed(cover_path, secret_message, stego_path)
                        
                        # Hiển thị kết quả
                        st.markdown('<div class="success-box">✓ Nhúng thành công!</div>', unsafe_allow_html=True)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.image(cover_path, caption="Ảnh gốc", use_container_width=True)
                        with col2:
                            st.image(stego_path, caption="Ảnh Stego", use_container_width=True)
                        
                        # Metrics với styling đẹp hơn
                        st.markdown("---")
                        st.subheader("📊 Thông tin nhúng")
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-label">Độ dài tin nhắn</div>
                                <div class="metric-value">{result['message_length']}</div>
                                <div class="metric-label">ký tự</div>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        with col2:
                            st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-label">Bits sử dụng</div>
                                <div class="metric-value">{result['bits_used']}</div>
                                <div class="metric-label">bits</div>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        with col3:
                            st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-label">Tỷ lệ sử dụng</div>
                                <div class="metric-value">{result['usage_percent']:.2f}%</div>
                                <div class="metric-label">capacity</div>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        # Quality metrics
                        st.markdown("---")
                        st.subheader("📈 Chất lượng ảnh")
                        original_img = cv2.imread(cover_path)
                        stego_img = cv2.imread(stego_path)
                        
                        psnr = calculate_psnr(original_img, stego_img)
                        ssim_val = calculate_ssim(original_img, stego_img)
                        
                        col1, col2 = st.columns(2)
                        col1.metric("PSNR", f"{psnr:.2f} dB", delta="Excellent" if psnr > 40 else "Good")
                        col2.metric("SSIM", f"{ssim_val:.4f}", delta="Excellent" if ssim_val > 0.95 else "Good")
                        
                        # Download
                        with open(stego_path, "rb") as f:
                            st.download_button(
                                "Tải ảnh Stego",
                                f,
                                file_name="stego_image.png",
                                mime="image/png",
                                use_container_width=True
                            )
                    
                    except Exception as e:
                        st.error(f"Lỗi: {str(e)}")
    
    with tab2:
        st.subheader("Trích xuất thông điệp từ ảnh Stego")
        
        col1, col2 = st.columns(2)
        
        with col1:
            stego_image = st.file_uploader("Upload ảnh Stego", 
                                          type=['png', 'bmp'], 
                                          key="stego_extract")
            
            use_decryption = st.checkbox("Giải mã thông điệp", help="Nếu thông điệp đã được mã hóa")
            decrypt_password = ""
            if use_decryption:
                decrypt_password = st.text_input("Mật khẩu giải mã:", type="password", key="decrypt_pass")
        
        with col2:
            if stego_image:
                image = Image.open(stego_image)
                st.image(image, caption="Ảnh Stego", use_container_width=True)
        
        if st.button("Trích xuất thông điệp", type="primary", use_container_width=True):
            if not stego_image:
                st.error("Vui lòng upload ảnh Stego!")
            elif use_decryption and not decrypt_password:
                st.error("Vui lòng nhập mật khẩu!")
            else:
                with st.spinner("Đang trích xuất..."):
                    temp_dir = tempfile.mkdtemp()
                    stego_path = os.path.join(temp_dir, "stego.png")
                    image.save(stego_path)
                    
                    try:
                        stego = LSB_Stego(use_encryption=use_decryption,
                                         password=decrypt_password if use_decryption else None)
                        extracted_message = stego.extract(stego_path)
                        
                        st.markdown('<div class="success-box">✓ Trích xuất thành công!</div>', unsafe_allow_html=True)
                        st.markdown("---")
                        st.subheader("📝 Thông điệp đã giấu")
                        st.code(extracted_message, language=None)
                        
                        # Thống kê
                        col1, col2 = st.columns(2)
                        col1.metric("Độ dài", f"{len(extracted_message)} ký tự")
                        col2.metric("Số từ", f"{len(extracted_message.split())} từ")
                    
                    except Exception as e:
                        st.error(f"Lỗi: {str(e)}")


# ==================== MODULE 2: IMAGE WATERMARKING ====================
elif module == "Image Watermarking":
    st.header("🖼️ DCT-SVD Image Watermarking")
    st.markdown('<div class="info-box">Nhúng watermark vào ảnh bằng DCT-SVD kết hợp Arnold Cat Map. Bền với JPEG compression và nhiễu.</div>', unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["Nhúng Watermark", "Trích xuất Watermark"])
    
    with tab1:
        st.subheader("Nhúng watermark vào ảnh")
        
        col1, col2 = st.columns(2)
        
        with col1:
            host_image = st.file_uploader("Upload ảnh gốc (Host Image)", 
                                         type=['png', 'jpg', 'bmp'],
                                         key="wm_host")
            watermark_image = st.file_uploader("Upload Watermark (Logo)", 
                                              type=['png', 'jpg', 'bmp'],
                                              key="wm_logo")
            
            alpha = st.slider("Hệ số nhúng (Alpha)", 0.01, 0.5, 0.1, 0.01,
                            help="Càng lớn càng bền nhưng càng rõ")
            arnold_iter = st.slider("Arnold iterations", 1, 20, 10,
                                   help="Số lần xáo trộn watermark")
        
        with col2:
            if host_image:
                st.image(host_image, caption="Ảnh gốc", use_container_width=True)
            if watermark_image:
                st.image(watermark_image, caption="Watermark", use_container_width=True)
        
        if st.button("Nhúng Watermark", type="primary", use_container_width=True):
            if not host_image or not watermark_image:
                st.error("Vui lòng upload cả 2 ảnh!")
            else:
                with st.spinner("Đang nhúng watermark..."):
                    temp_dir = tempfile.mkdtemp()
                    host_path = os.path.join(temp_dir, "host.png")
                    wm_path = os.path.join(temp_dir, "watermark.png")
                    output_path = os.path.join(temp_dir, "watermarked.png")
                    
                    Image.open(host_image).save(host_path)
                    Image.open(watermark_image).save(wm_path)
                    
                    try:
                        watermarker = DCT_SVD_Watermark(alpha=alpha, arnold_iterations=arnold_iter)
                        result = watermarker.embed(host_path, wm_path, output_path)
                        
                        st.markdown('<div class="success-box">✓ Nhúng watermark thành công!</div>', unsafe_allow_html=True)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.image(host_path, caption="Ảnh gốc", use_container_width=True)
                        with col2:
                            st.image(output_path, caption="Ảnh đã watermark", use_container_width=True)
                        
                        # Metrics với UI đẹp hơn
                        st.markdown("---")
                        st.subheader("📊 Thông số watermark")
                        col1, col2, col3 = st.columns(3)
                        
                        with col1:
                            st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-label">Watermark Size</div>
                                <div class="metric-value">{result['watermark_size']}</div>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        with col2:
                            st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-label">Alpha</div>
                                <div class="metric-value">{result['alpha']}</div>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        with col3:
                            st.markdown(f"""
                            <div class="metric-card">
                                <div class="metric-label">Blocks Used</div>
                                <div class="metric-value">{result['blocks_used']}</div>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        # Quality metrics
                        st.markdown("---")
                        st.subheader("📈 Đánh giá chất lượng")
                        original_img = cv2.imread(host_path)
                        watermarked_img = cv2.imread(output_path)
                        
                        psnr = calculate_psnr(original_img, watermarked_img)
                        ssim_val = calculate_ssim(original_img, watermarked_img)
                        mse = calculate_mse(original_img, watermarked_img)
                        
                        col1, col2, col3 = st.columns(3)
                        
                        # PSNR với đánh giá
                        psnr_status = "🟢 Excellent" if psnr > 40 else "🟡 Good" if psnr > 30 else "🔴 Poor"
                        col1.metric("PSNR", f"{psnr:.2f} dB", delta=psnr_status)
                        
                        # SSIM với đánh giá
                        ssim_status = "🟢 Excellent" if ssim_val > 0.95 else "🟡 Good" if ssim_val > 0.9 else "🔴 Poor"
                        col2.metric("SSIM", f"{ssim_val:.4f}", delta=ssim_status)
                        
                        # MSE
                        mse_status = "🟢 Low" if mse < 50 else "🟡 Medium" if mse < 100 else "🔴 High"
                        col3.metric("MSE", f"{mse:.2f}", delta=mse_status)
                        
                        # Download
                        with open(output_path, "rb") as f:
                            st.download_button(
                                "Tải ảnh đã watermark",
                                f,
                                file_name="watermarked_image.png",
                                mime="image/png",
                                use_container_width=True
                            )
                    
                    except Exception as e:
                        st.error(f"Lỗi: {str(e)}")
    
    with tab2:
        st.subheader("Trích xuất watermark")
        
        col1, col2 = st.columns(2)
        
        with col1:
            watermarked_img = st.file_uploader("Ảnh đã watermark", 
                                              type=['png', 'jpg'],
                                              key="extract_wm")
            original_img = st.file_uploader("Ảnh gốc (để so sánh)", 
                                           type=['png', 'jpg'],
                                           key="extract_orig")
            wm_size = st.number_input("Kích thước watermark", 16, 128, 32,
                                     help="Phải biết trước kích thước")
            arnold_iter_extract = st.slider("Arnold iterations", 1, 20, 10, key="arnold_extract")
        
        if st.button("Trích xuất Watermark", type="primary", use_container_width=True):
            if not watermarked_img or not original_img:
                st.error("Vui lòng upload cả 2 ảnh!")
            else:
                with st.spinner("Đang trích xuất..."):
                    temp_dir = tempfile.mkdtemp()
                    wm_path = os.path.join(temp_dir, "watermarked.png")
                    orig_path = os.path.join(temp_dir, "original.png")
                    
                    Image.open(watermarked_img).save(wm_path)
                    Image.open(original_img).save(orig_path)
                    
                    try:
                        watermarker = DCT_SVD_Watermark(arnold_iterations=arnold_iter_extract)
                        extracted = watermarker.extract(wm_path, orig_path, wm_size)
                        
                        st.markdown('<div class="success-box">✓ Trích xuất thành công!</div>', unsafe_allow_html=True)
                        
                        col1, col2 = st.columns([1, 1])
                        with col1:
                            st.image(extracted, caption="Watermark trích xuất", use_container_width=True)
                        with col2:
                            # Tính NC nếu có watermark gốc
                            st.markdown("### 📊 Đánh giá")
                            st.info("Watermark đã được trích xuất thành công. So sánh với watermark gốc để tính NC (Normalized Correlation).")
                            
                            # Hiển thị thông tin
                            st.markdown(f"""
                            **Kích thước:** {wm_size}x{wm_size}  
                            **Arnold iterations:** {arnold_iter_extract}  
                            **Trạng thái:** ✓ Hoàn tất
                            """)
                    
                    except Exception as e:
                        st.error(f"Lỗi: {str(e)}")


# ==================== MODULE 3: VIDEO WATERMARKING ====================
elif module == "Video Watermarking":
    st.header("🎬 Video Watermarking")
    st.markdown('<div class="warning-box">⚠️ Xử lý video có thể mất nhiều thời gian. Khuyến nghị video ngắn (<30s) để demo.</div>', unsafe_allow_html=True)
    
    video_file = st.file_uploader("Upload video gốc", type=['mp4', 'avi'])
    watermark_img = st.file_uploader("Upload Watermark", type=['png', 'jpg'])
    
    col1, col2 = st.columns(2)
    with col1:
        alpha_video = st.slider("Hệ số nhúng", 0.01, 0.5, 0.1, 0.01, key="alpha_video")
        frame_skip = st.slider("Nhúng mỗi N frames", 1, 10, 5,
                              help="1 = tất cả frames, 5 = mỗi 5 frames")
    
    if st.button("Nhúng Watermark vào Video", type="primary", use_container_width=True):
        if not video_file or not watermark_img:
            st.error("Vui lòng upload video và watermark!")
        else:
            with st.spinner("Đang xử lý video... (có thể mất vài phút)"):
                temp_dir = tempfile.mkdtemp()
                video_path = os.path.join(temp_dir, "video.mp4")
                wm_path = os.path.join(temp_dir, "watermark.png")
                output_path = os.path.join(temp_dir, "watermarked_video.mp4")
                
                with open(video_path, "wb") as f:
                    f.write(video_file.read())
                Image.open(watermark_img).save(wm_path)
                
                try:
                    video_wm = VideoWatermark(alpha=alpha_video, frame_skip=frame_skip)
                    result = video_wm.embed(video_path, wm_path, output_path)
                    
                    st.markdown('<div class="success-box">✓ Xử lý video thành công!</div>', unsafe_allow_html=True)
                    
                    st.markdown("---")
                    st.subheader("📊 Thông tin video")
                    
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-label">Tổng Frames</div>
                            <div class="metric-value">{result['total_frames']}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with col2:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-label">Watermarked</div>
                            <div class="metric-value">{result['watermarked_frames']}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with col3:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-label">FPS</div>
                            <div class="metric-value">{result['fps']}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with col4:
                        st.markdown(f"""
                        <div class="metric-card">
                            <div class="metric-label">Resolution</div>
                            <div class="metric-value">{result['resolution']}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    with open(output_path, "rb") as f:
                        st.download_button(
                            "Tải video đã watermark",
                            f,
                            file_name="watermarked_video.mp4",
                            mime="video/mp4",
                            use_container_width=True
                        )
                
                except Exception as e:
                    st.error(f"Lỗi: {str(e)}")


# ==================== MODULE 4: ATTACK SIMULATION ====================
elif module == "Attack Simulation":
    st.header("⚔️ Attack Simulation - Test độ bền Watermark")
    st.markdown('<div class="info-box">Mô phỏng các tấn công phổ biến để kiểm tra độ bền của watermark.</div>', unsafe_allow_html=True)
    
    watermarked_img = st.file_uploader("Upload ảnh đã watermark", type=['png', 'jpg'])
    
    if watermarked_img:
        image = np.array(Image.open(watermarked_img))
        image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        st.subheader("Chọn loại tấn công")
        attack_type = st.selectbox("Loại tấn công:", 
                                   ["JPEG Compression", "Gaussian Noise", "Crop", "Rotate"])
        
        if attack_type == "JPEG Compression":
            quality = st.slider("JPEG Quality", 10, 100, 50)
            attacked = apply_attack(image_bgr, 'jpeg_compression', quality=quality)
        
        elif attack_type == "Gaussian Noise":
            std = st.slider("Noise Std Dev", 5, 50, 25)
            attacked = apply_attack(image_bgr, 'gaussian_noise', std=std)
        
        elif attack_type == "Crop":
            crop_percent = st.slider("Crop %", 0.05, 0.5, 0.2, 0.05)
            attacked = apply_attack(image_bgr, 'crop', crop_percent=crop_percent)
        
        else:  # Rotate
            angle = st.slider("Góc xoay (độ)", -45, 45, 5)
            attacked = apply_attack(image_bgr, 'rotate', angle=angle)
        
        col1, col2 = st.columns(2)
        with col1:
            st.image(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB), 
                    caption="Ảnh gốc", use_container_width=True)
        with col2:
            st.image(cv2.cvtColor(attacked, cv2.COLOR_BGR2RGB), 
                    caption=f"Sau tấn công: {attack_type}", use_container_width=True)
        
        # Metrics
        psnr = calculate_psnr(image_bgr, attacked)
        ssim_val = calculate_ssim(image_bgr, attacked)
        
        col1, col2 = st.columns(2)
        col1.metric("PSNR", f"{psnr:.2f} dB")
        col2.metric("SSIM", f"{ssim_val:.4f}")
        
        st.markdown('<div class="info-box">💡 <strong>Tip:</strong> Sau khi tấn công, bạn có thể thử trích xuất watermark ở tab Image Watermarking để kiểm tra độ bền.</div>', unsafe_allow_html=True)


# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>PyStegoWatermark Suite v1.0 | Đề tài 5: Giấu tin & Thủy vân Ảnh/Video</p>
</div>
""", unsafe_allow_html=True)
