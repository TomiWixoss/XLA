"""
Steganography API Routes - API endpoints cho chức năng giấu tin
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
# Import class LSB_Stego chứa thuật toán giấu tin
from app.core.steganography import LSB_Stego
# Import hàm tính chất lượng ảnh (PSNR, SSIM)
from app.core.utils import calculate_psnr, calculate_ssim
# cv2 (OpenCV) để đọc và xử lý ảnh
import cv2

# Tạo router để định nghĩa các API endpoints
router = APIRouter()

@router.post("/embed")  # Định nghĩa endpoint POST tại đường dẫn /embed
async def embed_message(  # Hàm async để xử lý request nhúng tin
    cover_image: UploadFile = File(...),  # Nhận file ảnh gốc từ form-data (bắt buộc)
    message: str = Form(...),  # Nhận tin nhắn cần giấu từ form-data (bắt buộc)
    use_encryption: bool = Form(False),  # Có mã hóa tin nhắn không (mặc định False)
    password: str = Form(None)  # Mật khẩu để mã hóa (nếu use_encryption=True)
):
    """Nhúng tin nhắn vào ảnh và gửi tiến trình theo thời gian thực qua Server-Sent Events"""
    
    async def generate():  # Hàm generator để stream dữ liệu từng phần về client
        try:
            # ===== BƯỚC 1: UPLOAD ẢNH =====
            # Gửi thông báo bắt đầu upload về frontend (progress 0%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            # Đợi 0.1 giây để frontend kịp hiển thị
            await asyncio.sleep(0.1)
            
            # Tạo thư mục tạm để lưu file (tự động xóa sau khi xong)
            temp_dir = tempfile.mkdtemp()
            # Đường dẫn file ảnh gốc (cover image)
            cover_path = os.path.join(temp_dir, "cover.png")
            # Đường dẫn file ảnh sau khi nhúng tin (stego image)
            stego_path = os.path.join(temp_dir, "stego.png")
            
            # Mở file để ghi (write binary mode)
            with open(cover_path, "wb") as f:
                # Đọc nội dung file upload và ghi vào đĩa
                f.write(await cover_image.read())
            
            # Gửi thông báo upload xong (progress 100%)
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 2: VALIDATE ẢNH =====
            # Gửi thông báo bắt đầu kiểm tra ảnh
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Đọc ảnh bằng OpenCV (trả về numpy array hoặc None nếu lỗi)
            cover_img = cv2.imread(cover_path)
            # Nếu không đọc được ảnh (file hỏng hoặc format không hỗ trợ)
            if cover_img is None:
                # Gửi thông báo lỗi về frontend
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh. Vui lòng kiểm tra định dạng file (PNG, BMP, JPG).'})}\n\n"
                # Dừng hàm generator
                return
            
            # Gửi thông báo ảnh hợp lệ
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 3: NHÚNG TIN NHẮN VÀO ẢNH =====
            # Gửi thông báo bắt đầu nhúng tin
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 0, 'message': 'Đang nhúng tin nhắn...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Khởi tạo đối tượng LSB_Stego với các tham số
            # use_encryption: có mã hóa tin nhắn trước khi nhúng không
            # password: mật khẩu để mã hóa (nếu use_encryption=True)
            stego = LSB_Stego(use_encryption=use_encryption, password=password)
            # Gọi hàm embed để nhúng tin nhắn vào ảnh
            # Tham số: đường dẫn ảnh gốc, tin nhắn, đường dẫn lưu ảnh stego
            # Trả về: dict chứa thông tin về quá trình nhúng
            result = stego.embed(cover_path, message, stego_path)
            
            # Gửi thông báo nhúng xong
            yield f"data: {json.dumps({'stage': 'embedding', 'progress': 100, 'message': 'Đã nhúng xong tin nhắn'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 4: TÍNH CHẤT LƯỢNG ẢNH (METRICS) =====
            # Gửi thông báo bắt đầu tính metrics
            yield f"data: {json.dumps({'stage': 'metrics', 'progress': 0, 'message': 'Đang tính chất lượng...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Đọc lại ảnh gốc (để so sánh)
            original_img = cv2.imread(cover_path)
            # Đọc ảnh sau khi nhúng tin
            stego_img = cv2.imread(stego_path)
            # Tính PSNR (Peak Signal-to-Noise Ratio) - đo độ nhiễu, càng cao càng tốt (>40dB là tốt)
            psnr = calculate_psnr(original_img, stego_img)
            # Tính SSIM (Structural Similarity Index) - đo độ tương đồng cấu trúc, từ 0-1 (càng gần 1 càng giống)
            ssim = calculate_ssim(original_img, stego_img)
            
            # Gửi thông báo tính xong metrics
            yield f"data: {json.dumps({'stage': 'metrics', 'progress': 100, 'message': 'Đã tính xong metrics'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 5: MÃ HÓA ẢNH THÀNH BASE64 =====
            # Gửi thông báo bắt đầu encode ảnh
            yield f"data: {json.dumps({'stage': 'encoding', 'progress': 0, 'message': 'Đang mã hóa ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Mở file ảnh stego ở chế độ đọc binary
            with open(stego_path, "rb") as f:
                # Đọc toàn bộ nội dung file thành bytes
                stego_bytes = f.read()
                # Encode bytes thành chuỗi base64 (để gửi qua JSON)
                # decode('utf-8') để chuyển bytes thành string
                stego_base64 = base64.b64encode(stego_bytes).decode('utf-8')
            
            # ===== TẠO KẾT QUẢ CUỐI CÙNG =====
            # Tạo dict chứa tất cả thông tin kết quả
            final_result = {
                "success": True,  # Trạng thái thành công
                "message_length": result['message_length'],  # Độ dài tin nhắn gốc (ký tự)
                "bits_used": result['bits_used'],  # Số bits đã sử dụng để nhúng
                "capacity": result['capacity'],  # Tổng số bits có thể nhúng trong ảnh
                "usage_percent": result['usage_percent'],  # Phần trăm dung lượng đã dùng
                "encrypted": result['encrypted'],  # Có mã hóa hay không
                "psnr": float(psnr),  # PSNR (chuyển sang float để JSON serialize)
                "ssim": float(ssim),  # SSIM (chuyển sang float để JSON serialize)
                "stego_image": f"data:image/png;base64,{stego_base64}"  # Ảnh stego dạng data URL
            }
            
            # Chuyển dict thành JSON string
            # ensure_ascii=False để giữ nguyên ký tự Unicode (tiếng Việt)
            result_json = json.dumps({
                'stage': 'complete',  # Giai đoạn hoàn thành
                'progress': 100,  # Tiến trình 100%
                'message': 'Hoàn thành!',  # Thông báo
                'result': final_result  # Kết quả chi tiết
            }, ensure_ascii=False)
            
            # Gửi kết quả cuối cùng về frontend
            yield f"data: {result_json}\n\n"
            
        except Exception as e:  # Bắt mọi lỗi xảy ra trong quá trình xử lý nhúng tin
            # Gửi thông báo lỗi về frontend với message là nội dung lỗi
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    # Trả về StreamingResponse để gửi dữ liệu theo dạng Server-Sent Events
    # media_type="text/event-stream" để frontend có thể nhận stream
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/extract")  # Định nghĩa endpoint POST tại đường dẫn /extract
async def extract_message(  # Hàm async để xử lý request trích xuất tin
    stego_image: UploadFile = File(...),  # Nhận file ảnh stego từ form-data (bắt buộc)
    use_decryption: bool = Form(False),  # Có giải mã tin nhắn không (mặc định False)
    password: str = Form(None)  # Mật khẩu để giải mã (nếu use_decryption=True)
):
    """Trích xuất tin nhắn ẩn từ ảnh stego và gửi tiến trình theo thời gian thực"""
    
    async def generate():  # Hàm generator để stream dữ liệu từng phần về client
        try:
            # ===== BƯỚC 1: UPLOAD ẢNH STEGO =====
            # Gửi thông báo bắt đầu upload về frontend
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 0, 'message': 'Đang tải ảnh lên...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Tạo thư mục tạm để lưu file
            temp_dir = tempfile.mkdtemp()
            # Đường dẫn file ảnh stego
            stego_path = os.path.join(temp_dir, "stego.png")
            
            # Mở file để ghi (write binary mode)
            with open(stego_path, "wb") as f:
                # Đọc nội dung file upload và ghi vào đĩa
                f.write(await stego_image.read())
            
            # Gửi thông báo upload xong
            yield f"data: {json.dumps({'stage': 'upload', 'progress': 100, 'message': 'Đã tải xong ảnh'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 2: VALIDATE ẢNH STEGO =====
            # Gửi thông báo bắt đầu kiểm tra ảnh
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 0, 'message': 'Đang kiểm tra ảnh...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Đọc ảnh stego bằng OpenCV
            stego_img = cv2.imread(stego_path)
            # Nếu không đọc được ảnh (file hỏng hoặc format không hỗ trợ)
            if stego_img is None:
                # Gửi thông báo lỗi về frontend
                yield f"data: {json.dumps({'stage': 'error', 'message': 'Không thể đọc ảnh stego. Vui lòng kiểm tra định dạng file (PNG, BMP).'})}\n\n"
                # Dừng hàm generator
                return
            
            # Gửi thông báo ảnh hợp lệ
            yield f"data: {json.dumps({'stage': 'validate', 'progress': 100, 'message': 'Ảnh hợp lệ'})}\n\n"
            await asyncio.sleep(0.1)
            
            # ===== BƯỚC 3: TRÍCH XUẤT TIN NHẮN =====
            # Gửi thông báo bắt đầu trích xuất
            yield f"data: {json.dumps({'stage': 'extracting', 'progress': 0, 'message': 'Đang trích xuất tin nhắn...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Khởi tạo đối tượng LSB_Stego với các tham số
            # use_encryption: có giải mã tin nhắn sau khi trích xuất không
            # password: mật khẩu để giải mã (phải giống lúc nhúng)
            stego = LSB_Stego(use_encryption=use_decryption, password=password)
            # Gọi hàm extract để trích xuất tin nhắn từ ảnh stego
            # Tham số: đường dẫn ảnh stego
            # Trả về: tin nhắn đã giấu (string)
            message = stego.extract(stego_path)
            
            # ===== TẠO KẾT QUẢ CUỐI CÙNG =====
            # Tạo dict chứa tin nhắn và độ dài
            final_result = {
                "message": message,  # Tin nhắn đã trích xuất
                "length": len(message)  # Độ dài tin nhắn (số ký tự)
            }
            # Gửi kết quả hoàn thành về frontend
            yield f"data: {json.dumps({'stage': 'complete', 'progress': 100, 'message': 'Hoàn thành!', 'result': final_result})}\n\n"
            
        except Exception as e:  # Bắt mọi lỗi xảy ra trong quá trình trích xuất
            # Gửi thông báo lỗi về frontend với message là nội dung lỗi
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"
    
    # Trả về StreamingResponse để gửi dữ liệu theo dạng Server-Sent Events
    # media_type="text/event-stream" để frontend có thể nhận stream
    return StreamingResponse(generate(), media_type="text/event-stream")
