"""
Watermarking API Routes - API endpoints cho chức năng thủy vân ảnh
"""
# Import các thư viện cần thiết từ FastAPI để xây dựng REST API
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# StreamingResponse để gửi dữ liệu theo dạng stream (Server-Sent Events)
from fastapi.responses import StreamingResponse
# tempfile để tạo thư mục tạm lưu file upload
import tempfile
# os để xử lý đường dẫn file
import os
# base64 để encode ảnh thành chuỗi base64 gửi về frontend
import base64
# json để chuyển đổi dữ liệu thành JSON format
import json
# asyncio để xử lý bất đồng bộ (async/await)
import asyncio
# Import class DWT_DCT_SVD_Watermark chứa thuật toán thủy vân
from app.core.watermarking import DWT_DCT_SVD_Watermark
# Import hàm tính chất lượng ảnh (PSNR, SSIM, NC)
from app.core.utils import calculate_psnr, calculate_ssim, calculate_nc
# cv2 (OpenCV) để đọc và xử lý ảnh
import cv2

# Tạo router để định nghĩa các API endpoints
router = APIRouter()

@router.post("/embed")  # Định nghĩa endpoint POST tại đường dẫn /embed
async def embed_watermark(  # Hàm async để xử lý request nhúng thủy vân
    host_image: UploadFile = File(...),  # Nhận file ảnh gốc từ form-data (bắt buộc)
    watermark_image: UploadFile = File(...),  # Nhận file ảnh thủy vân từ form-data (bắt buộc)
    alpha: float = Form(0.02),  # Cường độ nhúng (0.02 = không nhìn thấy, 0.05 = cân bằng, 0.1+ = bền vững)
    arnold_iterations: int = Form(10)  # Số lần xáo trộn thủy vân (10 = mặc định)
):
    """
    Nhúng thủy vân vào ảnh gốc và gửi tiến trình theo thời gian thực
    
    Cấu hình tối ưu cố định:
    - Thuật toán DWT-DCT-SVD
    - Wavelet Haar
    - Băng tần LH (tần số trung bình)
    - Kích thước khối 8x8
    
    Người dùng có thể điều chỉnh:
    - alpha: Cường độ nhúng thủy vân
    - arnold_iterations: Số lần xáo trộn thủy vân
    """
    
    async def generate():  # Hàm generator để stream dữ liệu từng phần về client
        try:
            # ===== BƯỚC 1: UPLOAD ẢNH =====
            # Gửi thông báo bắt đầu upload về frontend (progress 0%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            # Đợi 0.1 giây để frontend kịp hiển thị
            await asyncio.sleep(0.1)
            
            # Tạo thư mục tạm để lưu file (tự động xóa sau khi xong)
            temp_dir = tempfile.mkdtemp()
            # Đường dẫn file ảnh gốc
            host_path = os.path.join(temp_dir, "host.png")
            # Đường dẫn file ảnh thủy vân
            wm_path = os.path.join(temp_dir, "watermark.png")
            # Đường dẫn file ảnh sau khi nhúng thủy vân
            output_path = os.path.join(temp_dir, "watermarked.png")
            
            # Mở file ảnh gốc để ghi (write binary mode)
            with open(host_path, "wb") as f:
                # Đọc nội dung file upload và ghi vào đĩa
                f.write(await host_image.read())
            # Mở file ảnh thủy vân để ghi
            with open(wm_path, "wb") as f:
                # Đọc nội dung file upload và ghi vào đĩa
                f.write(await watermark_image.read())
            
            # Gửi thông báo upload xong (progress 100%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 2: VALIDATE ẢNH =====
            # Gửi thông báo bắt đầu kiểm tra ảnh
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Đọc ảnh gốc bằng OpenCV (trả về numpy array hoặc None nếu lỗi)
            host_img = cv2.imread(host_path)
            # Đọc ảnh thủy vân
            wm_img = cv2.imread(wm_path)
            
            # Nếu không đọc được ảnh gốc (file hỏng hoặc format không hỗ trợ)
            if host_img is None:
                # Gửi thông báo lỗi về frontend
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh gốc. Vui lòng kiểm tra định dạng file.'})}\n\n"
                # Dừng hàm generator
                return
            # Nếu không đọc được ảnh thủy vân
            if wm_img is None:
                # Gửi thông báo lỗi về frontend
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh watermark. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            
            # Gửi thông báo ảnh hợp lệ
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 3: NHÚNG THỦY VÂN =====
            # Gửi thông báo bắt đầu nhúng thủy vân
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 0, 'message': 'Đang nhúng watermark bằng DWT-DCT-SVD...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Khởi tạo đối tượng DWT_DCT_SVD_Watermark với các tham số
            # alpha: cường độ nhúng thủy vân
            # arnold_iterations: số lần xáo trộn thủy vân
            watermarker = DWT_DCT_SVD_Watermark(
                alpha=alpha, 
                arnold_iterations=arnold_iterations
            )
            # Gọi hàm embed để nhúng thủy vân vào ảnh
            # Tham số: đường dẫn ảnh gốc, đường dẫn ảnh thủy vân, đường dẫn lưu ảnh kết quả
            # Trả về: dict chứa thông tin về quá trình nhúng
            result = watermarker.embed(host_path, wm_path, output_path)
            
            # Gửi thông báo nhúng xong
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 100, 'message': 'Đã nhúng xong watermark'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 4: MÃ HÓA ẢNH THÀNH BASE64 =====
            # Gửi thông báo bắt đầu encode ảnh
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Mở file ảnh đã nhúng thủy vân ở chế độ đọc binary
            with open(output_path, "rb") as f:
                # Đọc toàn bộ nội dung file thành bytes
                watermarked_bytes = f.read()
                # Encode bytes thành chuỗi base64 (để gửi qua JSON)
                # decode('utf-8') để chuyển bytes thành string
                watermarked_base64 = base64.b64encode(watermarked_bytes).decode('utf-8')
            
            # Thêm ảnh đã encode vào kết quả
            result['watermarked_image'] = f"data:image/png;base64,{watermarked_base64}"
            
            # ===== HOÀN THÀNH =====
            # Chuyển dict thành JSON string
            # ensure_ascii=False để giữ nguyên ký tự Unicode (tiếng Việt)
            result_json = json.dumps({
                'stage': 'complete',  # Giai đoạn hoàn thành
                'progress': 100,  # Tiến trình 100%
                'message': 'Hoàn thành!',  # Thông báo
                'result': result  # Kết quả chi tiết
            }, ensure_ascii=False)
            
            # Gửi kết quả cuối cùng về frontend
            yield f"data: {result_json}\n\n"
            
        except Exception as e:  # Bắt mọi lỗi xảy ra trong quá trình xử lý
            # Gửi thông báo lỗi về frontend với message là nội dung lỗi
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    # Trả về StreamingResponse để gửi dữ liệu theo dạng Server-Sent Events
    # media_type="text/event-stream" để frontend có thể nhận stream
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/extract")  # Định nghĩa endpoint POST tại đường dẫn /extract
async def extract_watermark(  # Hàm async để xử lý request trích xuất thủy vân
    watermarked_image: UploadFile = File(...),  # Nhận file ảnh đã nhúng thủy vân (bắt buộc)
    original_image: UploadFile = File(...),  # Nhận file ảnh gốc (bắt buộc để so sánh)
    original_watermark: UploadFile = File(None),  # Nhận file thủy vân gốc (tùy chọn, để tính NC)
    watermark_size: int = Form(32),  # Kích thước thủy vân (phải biết trước)
    arnold_iterations: int = Form(10)  # Số lần xáo trộn (phải giống lúc nhúng)
):
    """Trích xuất thủy vân từ ảnh đã nhúng và gửi tiến trình theo thời gian thực"""
    
    async def generate():  # Hàm generator để stream dữ liệu từng phần về client
        try:
            # ===== BƯỚC 1: UPLOAD ẢNH =====
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
            
            # ===== BƯỚC 2: VALIDATE ẢNH =====
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            wm_img = cv2.imread(wm_path)
            orig_img = cv2.imread(orig_path)
            
            if wm_img is None or orig_img is None:
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh. Vui lòng kiểm tra định dạng file.'})}\n\n"
                return
            
            # Kiểm tra 2 ảnh phải có cùng kích thước
            if wm_img.shape != orig_img.shape:
                error_msg = f"Hai ảnh phải có cùng kích thước. Ảnh đã watermark: {wm_img.shape[1]}x{wm_img.shape[0]}, Ảnh gốc: {orig_img.shape[1]}x{orig_img.shape[0]}"
                yield f"data: {json.dumps({'stage': 'error', 'message': error_msg})}\n\n"
                return
            
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 3: TRÍCH XUẤT THỦY VÂN =====
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 0, 'message': 'Đang trích xuất watermark bằng DWT-DCT-SVD...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Phải dùng cùng cấu hình với lúc nhúng
            watermarker = DWT_DCT_SVD_Watermark(arnold_iterations=arnold_iterations)
            # Gọi hàm extract để trích xuất thủy vân
            extracted = watermarker.extract(wm_path, orig_path, watermark_size)
            
            # Lưu thủy vân đã trích xuất
            extracted_path = os.path.join(temp_dir, "extracted_watermark.png")
            cv2.imwrite(extracted_path, extracted)
            
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 100, 'message': 'Đã trích xuất xong'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 4: MÃ HÓA ẢNH THÀNH BASE64 =====
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            with open(extracted_path, "rb") as f:
                extracted_bytes = f.read()
                extracted_base64 = base64.b64encode(extracted_bytes).decode('utf-8')
            
            result = {
                "extracted_watermark": f"data:image/png;base64,{extracted_base64}",
                "size": watermark_size
            }
            
            # Tính NC (Normalized Correlation) nếu có thủy vân gốc
            if original_watermark:
                orig_wm_path = os.path.join(temp_dir, "original_watermark.png")
                with open(orig_wm_path, "wb") as f:
                    f.write(await original_watermark.read())
                
                # Đọc thủy vân gốc và resize về cùng kích thước
                orig_wm = cv2.imread(orig_wm_path, cv2.IMREAD_GRAYSCALE)
                orig_wm_resized = cv2.resize(orig_wm, (watermark_size, watermark_size))
                
                # Tính NC (độ tương quan chuẩn hóa) giữa thủy vân gốc và đã trích xuất
                nc = calculate_nc(orig_wm_resized, extracted)
                result['nc'] = float(nc)
            
            # ===== HOÀN THÀNH =====
            result_json = json.dumps({
                'stage': 'complete', 
                'progress': 100, 
                'message': 'Hoàn thành!', 
                'result': result
            }, ensure_ascii=False)
            
            yield f"data: {result_json}\n\n"
            
        except Exception as e:  # Bắt mọi lỗi xảy ra trong quá trình trích xuất
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    # Trả về StreamingResponse để gửi dữ liệu theo dạng Server-Sent Events
    return StreamingResponse(generate(), media_type="text/event-stream")
