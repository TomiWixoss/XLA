"""
LSB Steganography - Giấu tin mật trong ảnh sử dụng thuật toán LSB (Bit Cuối Cùng)
"""

# Thư viện numpy để xử lý mảng số (ảnh là mảng 3 chiều)
import numpy as np
# Thư viện OpenCV để đọc/ghi ảnh và xử lý ảnh
import cv2
# Thư viện AES từ PyCryptodome để mã hóa tin nhắn
from Crypto.Cipher import AES
# Thư viện pad/unpad để làm tròn dữ liệu cho AES (AES yêu cầu dữ liệu chia hết cho 16 byte)
from Crypto.Util.Padding import pad, unpad
# Thư viện get_random_bytes để tạo chuỗi ngẫu nhiên cho AES
from Crypto.Random import get_random_bytes
# Thư viện hashlib để băm mật khẩu thành khóa 256-bit cho AES
import hashlib


class LSB_Stego:
    """
    Lớp xử lý giấu tin sử dụng thuật toán LSB (Bit Cuối Cùng)
    
    Nguyên lý LSB:
    - Mỗi điểm ảnh có 3 kênh màu (Xanh dương, Xanh lá, Đỏ), mỗi kênh 8 bit (0-255)
    - Bit cuối cùng thay đổi ít ảnh hưởng đến màu sắc (thay đổi ±1)
    - Nhúng tin bằng cách thay thế bit cuối của mỗi kênh màu bằng bit của tin nhắn
    
    Tính năng:
    - Mã hóa AES-256: Mã hóa tin nhắn trước khi nhúng để bảo mật
    """
    
    # Chuỗi đánh dấu kết thúc tin nhắn (dùng khi trích xuất)
    DELIMITER = "<<<END_OF_MESSAGE>>>"
    
    def __init__(self, use_encryption=False, password=None):
        """
        Khởi tạo đối tượng LSB_Stego
        
        Tham số:
            use_encryption (bool): Có mã hóa tin nhắn trước khi nhúng không
                - True: Mã hóa bằng AES-256 (cần mật khẩu)
                - False: Nhúng trực tiếp (không bảo mật)
            password (str): Mật khẩu để mã hóa/giải mã (bắt buộc nếu use_encryption=True)
        """
        # Lưu các tham số vào thuộc tính của đối tượng
        self.use_encryption = use_encryption
        self.password = password
        
        # Kiểm tra: nếu bật mã hóa mà không có mật khẩu thì báo lỗi
        if use_encryption and not password:
            raise ValueError("Password is required when encryption is enabled")
    
    def _get_key(self):
        """
        Tạo khóa AES 256-bit từ mật khẩu
        
        AES-256 yêu cầu khóa dài 32 byte (256 bit)
        Dùng SHA-256 để băm mật khẩu thành khóa cố định 32 byte
        
        Trả về:
            bytes: Khóa 32 byte để dùng cho AES-256
        """
        # Băm mật khẩu bằng SHA-256 (kết quả luôn là 32 byte)
        # encode() chuyển chuỗi thành byte
        # digest() trả về kết quả băm dạng byte (không phải chuỗi hex)
        return hashlib.sha256(self.password.encode()).digest()
    
    def _encrypt_message(self, message):
        """
        Mã hóa tin nhắn bằng AES-256-CBC
        
        AES-CBC (Mã Hóa Khối Xích):
        - Chia tin nhắn thành các khối 16 byte
        - Mỗi khối được XOR với khối trước rồi mã hóa
        - Khối đầu tiên XOR với chuỗi khởi tạo ngẫu nhiên
        
        Tham số:
            message (str): Tin nhắn cần mã hóa
        
        Trả về:
            bytes: Chuỗi khởi tạo (16 byte) + văn bản đã mã hóa
        """
        # Lấy khóa 32 byte từ mật khẩu
        key = self._get_key()
        # Tạo bộ mã hóa AES với chế độ CBC (cần chuỗi khởi tạo ngẫu nhiên)
        cipher = AES.new(key, AES.MODE_CBC)
        # Mã hóa tin nhắn:
        # 1. message.encode(): chuyển chuỗi thành byte (UTF-8)
        # 2. pad(..., AES.block_size): làm tròn để chia hết cho 16 byte
        # 3. cipher.encrypt(): mã hóa
        ct_bytes = cipher.encrypt(pad(message.encode(), AES.block_size))
        # Lấy chuỗi khởi tạo - cần lưu để giải mã
        iv = cipher.iv
        # Trả về chuỗi khởi tạo + văn bản đã mã hóa (chuỗi khởi tạo cần để giải mã)
        return iv + ct_bytes
    
    def _decrypt_message(self, encrypted_data):
        """
        Giải mã tin nhắn đã được mã hóa bằng AES-256-CBC
        
        Tham số:
            encrypted_data (bytes): Chuỗi khởi tạo (16 byte đầu) + văn bản đã mã hóa
        
        Trả về:
            str: Tin nhắn gốc đã giải mã
        """
        # Lấy khóa 32 byte từ mật khẩu (phải giống lúc mã hóa)
        key = self._get_key()
        # Tách chuỗi khởi tạo từ 16 byte đầu
        iv = encrypted_data[:16]
        # Phần còn lại là văn bản đã mã hóa
        ct = encrypted_data[16:]
        # Tạo bộ mã hóa AES với chế độ CBC và chuỗi khởi tạo đã lưu
        cipher = AES.new(key, AES.MODE_CBC, iv)
        # Giải mã:
        # 1. cipher.decrypt(ct): giải mã văn bản
        # 2. unpad(..., AES.block_size): bỏ phần làm tròn
        # 3. .decode(): chuyển byte thành chuỗi (UTF-8)
        return unpad(cipher.decrypt(ct), AES.block_size).decode()
    
    def _text_to_binary(self, text):
        """
        Chuyển văn bản sang chuỗi nhị phân (UTF-8)
        
        Ví dụ: "Hi" → "0100100001101001"
        - 'H' = 72 = 01001000
        - 'i' = 105 = 01101001
        
        Tham số:
            text (str): Chuỗi văn bản cần chuyển
        
        Trả về:
            str: Chuỗi nhị phân (chỉ chứa '0' và '1')
        """
        # text.encode('utf-8'): chuyển chuỗi thành byte (hỗ trợ tiếng Việt)
        # for byte in ...: duyệt từng byte
        # format(byte, '08b'): chuyển byte thành nhị phân 8 bit (có số 0 đứng đầu)
        # ''.join(...): nối tất cả chuỗi nhị phân lại
        return ''.join(format(byte, '08b') for byte in text.encode('utf-8'))
    
    def _binary_to_text(self, binary):
        """
        Chuyển chuỗi nhị phân sang văn bản (UTF-8)
        
        Ví dụ: "0100100001101001" → "Hi"
        
        Tham số:
            binary (str): Chuỗi nhị phân (chỉ chứa '0' và '1')
        
        Trả về:
            str: Văn bản đã giải mã
        """
        # Chia nhị phân thành các nhóm 8 bit (1 byte)
        # range(0, len(binary), 8): bắt đầu từ 0, bước nhảy 8
        # binary[i:i+8]: lấy 8 bit
        # int(..., 2): chuyển chuỗi nhị phân thành số nguyên (cơ số 2)
        # if len(...) == 8: chỉ lấy nhóm đủ 8 bit (bỏ bit thừa cuối)
        bytes_list = [int(binary[i:i+8], 2) for i in range(0, len(binary), 8) if len(binary[i:i+8]) == 8]
        # bytearray(bytes_list): tạo mảng byte từ danh sách số nguyên
        # .decode('utf-8', errors='ignore'): chuyển byte thành chuỗi
        # errors='ignore': bỏ qua byte không hợp lệ (tránh lỗi)
        return bytearray(bytes_list).decode('utf-8', errors='ignore')

    
    def embed(self, cover_image_path, secret_message, output_path):
        """
        Nhúng thông điệp vào ảnh sử dụng thuật toán LSB Chuẩn
        
        Quy trình:
        1. Đọc ảnh gốc
        2. Mã hóa tin nhắn (nếu bật mã hóa)
        3. Thêm chuỗi đánh dấu kết thúc
        4. Chuyển tin nhắn sang nhị phân
        5. Nhúng nhị phân vào bit cuối của các điểm ảnh (tuần tự)
        6. Lưu ảnh đã nhúng tin
        
        Tham số:
            cover_image_path (str): Đường dẫn ảnh gốc (PNG, BMP, JPG)
            secret_message (str): Thông điệp cần giấu
            output_path (str): Đường dẫn lưu ảnh đã nhúng tin (nên dùng PNG)
        
        Trả về:
            dict: Thông tin về quá trình nhúng
        """
        # ===== BƯỚC 1: ĐỌC ẢNH GỐC =====
        # cv2.imread: đọc ảnh thành mảng numpy (chiều_cao, chiều_rộng, 3)
        # 3 kênh: BGR (Xanh dương, Xanh lá, Đỏ)
        image = cv2.imread(cover_image_path)
        # Kiểm tra ảnh có đọc được không
        if image is None:
            raise ValueError(f"Cannot read image: {cover_image_path}")
        
        # ===== BƯỚC 2: MÃ HÓA TIN NHẮN (NẾU CẦN) =====
        if self.use_encryption:  # Nếu bật mã hóa
            # Mã hóa tin nhắn bằng AES-256-CBC
            encrypted = self._encrypt_message(secret_message)
            # Chuyển byte thành chuỗi hex để dễ xử lý
            # Ví dụ: b'\x01\x02' → "0102"
            message_to_hide = encrypted.hex()
        else:  # Không mã hóa
            # Dùng tin nhắn gốc
            message_to_hide = secret_message
        
        # ===== BƯỚC 3: THÊM CHUỖI ĐÁNH DẤU KẾT THÚC =====
        # Thêm chuỗi đặc biệt để đánh dấu kết thúc tin nhắn
        # Khi trích xuất, sẽ dừng lại khi gặp chuỗi này
        message_to_hide += self.DELIMITER
        
        # ===== BƯỚC 4: CHUYỂN TIN NHẮN SANG NHỊ PHÂN =====
        # Chuyển chuỗi thành chuỗi '0' và '1'
        # Ví dụ: "Hi" → "0100100001101001"
        binary_message = self._text_to_binary(message_to_hide)
        # Đếm số bit cần nhúng
        message_length = len(binary_message)
        
        # ===== BƯỚC 5: KIỂM TRA DUNG LƯỢNG =====
        # Tính tổng số bit có thể nhúng trong ảnh
        # image.shape[0]: chiều cao
        # image.shape[1]: chiều rộng
        # 3: số kênh (Xanh dương, Xanh lá, Đỏ) - mỗi kênh có thể nhúng 1 bit
        image_capacity = image.shape[0] * image.shape[1] * 3
        # Kiểm tra tin nhắn có vừa không
        if message_length > image_capacity:
            raise ValueError(f"Message too large. Max capacity: {image_capacity} bits, Message: {message_length} bits")
        
        # ===== BƯỚC 6: NHÚNG TIN NHẮN VÀO ẢNH (LSB CHUẨN) =====
        # Sao chép ảnh gốc để không làm thay đổi ảnh gốc
        stego_image = image.copy()
        
        # chỉ_số_dữ_liệu: vị trí hiện tại trong chuỗi nhị phân tin nhắn
        data_index = 0
        # Duyệt qua từng điểm ảnh của ảnh (tuần tự từ trái sang phải, trên xuống dưới)
        for i in range(image.shape[0]):  # Duyệt theo chiều cao (hàng)
            for j in range(image.shape[1]):  # Duyệt theo chiều rộng (cột)
                for k in range(3):  # Duyệt 3 kênh: Xanh_dương(0), Xanh_lá(1), Đỏ(2)
                    if data_index < message_length:
                        # Lấy giá trị điểm ảnh gốc
                        original_value = image[i, j, k]
                        
                        # ===== NHÚNG 1 BIT VÀO BIT CUỐI =====
                        # Thay bit cuối bằng bit của tin nhắn
                        # original_value & 0xFE: xóa bit cuối (AND với 11111110)
                        # | int(binary_message[data_index]): đặt bit cuối bằng bit của tin nhắn
                        # Ví dụ: gốc=100 (01100100), bit=1
                        #   → 01100100 & 11111110 = 01100100
                        #   → 01100100 | 00000001 = 01100101 (101)
                        stego_value = (original_value & 0xFE) | int(binary_message[data_index])
                        
                        # Lưu giá trị mới vào ảnh
                        stego_image[i, j, k] = stego_value
                        data_index += 1
                    else:
                        break
                # Nếu đã nhúng hết tin nhắn thì thoát vòng lặp cột
                if data_index >= message_length:
                    break
            # Nếu đã nhúng hết tin nhắn thì thoát vòng lặp hàng
            if data_index >= message_length:
                break
        
        # ===== BƯỚC 7: LƯU ẢNH ĐÃ NHÚNG TIN =====
        # Dùng PNG để tránh mất dữ liệu do nén (JPG sẽ làm mất bit cuối)
        # cv2.imwrite: ghi ảnh ra tệp tin
        cv2.imwrite(output_path, stego_image)
        
        # ===== BƯỚC 8: TRẢ VỀ THÔNG TIN =====
        # Trả về từ điển chứa thông tin về quá trình nhúng
        return {
            'success': True,  # Trạng thái thành công
            'message_length': len(secret_message),  # Độ dài tin nhắn gốc (ký tự)
            'bits_used': message_length,  # Số bit đã nhúng (bao gồm chuỗi đánh dấu)
            'capacity': image_capacity,  # Tổng số bit có thể nhúng
            'usage_percent': (message_length / image_capacity) * 100,  # % dung lượng đã dùng
            'encrypted': self.use_encryption,  # Có mã hóa không
            'algorithm': 'LSB-Chuẩn'  # Thuật toán đã dùng
        }
    
    def extract(self, stego_image_path):
        """
        Trích xuất thông điệp từ ảnh đã nhúng tin sử dụng thuật toán LSB Chuẩn
        
        Quy trình:
        1. Đọc ảnh đã nhúng tin
        2. Trích xuất bit cuối từ các điểm ảnh (tuần tự)
        3. Chuyển nhị phân thành văn bản
        4. Tìm và loại bỏ chuỗi đánh dấu kết thúc
        5. Giải mã tin nhắn (nếu đã mã hóa)
        
        Tham số:
            stego_image_path (str): Đường dẫn ảnh đã nhúng tin (PNG, BMP)
        
        Trả về:
            str: Thông điệp đã giấu (đã giải mã nếu có)
        """
        # ===== BƯỚC 1: ĐỌC ẢNH ĐÃ NHÚNG TIN =====
        # cv2.imread: đọc ảnh thành mảng numpy
        image = cv2.imread(stego_image_path)
        # Kiểm tra ảnh có đọc được không
        if image is None:
            raise ValueError(f"Cannot read image: {stego_image_path}")
        
        # ===== BƯỚC 2: TRÍCH XUẤT BIT CUỐI (LSB CHUẨN) =====
        # Khởi tạo chuỗi nhị phân rỗng để lưu các bit trích xuất
        binary_message = ""
        
        # Duyệt qua từng điểm ảnh theo thứ tự giống lúc nhúng (tuần tự)
        for i in range(image.shape[0]):  # Duyệt theo chiều cao
            for j in range(image.shape[1]):  # Duyệt theo chiều rộng
                for k in range(3):  # Duyệt 3 kênh
                    # Lấy bit cuối của điểm ảnh
                    # image[i, j, k] & 1: AND với 00000001 → lấy bit cuối
                    # Ví dụ: điểm_ảnh=101 (01100101) & 1 = 1
                    binary_message += str(image[i, j, k] & 1)
        
        # ===== BƯỚC 3: CHUYỂN NHỊ PHÂN SANG VĂN BẢN =====
        # Chia nhị phân thành các nhóm 8 bit (1 byte)
        # int(binary_message[i:i+8], 2): chuyển 8 bit thành số nguyên
        # if len(...) == 8: chỉ lấy nhóm đủ 8 bit
        bytes_list = [int(binary_message[i:i+8], 2) for i in range(0, len(binary_message), 8) if len(binary_message[i:i+8]) == 8]
        # bytearray(bytes_list): tạo mảng byte
        # .decode('utf-8', errors='ignore'): chuyển byte thành chuỗi
        decoded_message = bytearray(bytes_list).decode('utf-8', errors='ignore')
        
        # ===== BƯỚC 4: TÌM VÀ LOẠI BỎ CHUỖI ĐÁNH DẤU KẾT THÚC =====
        # Kiểm tra có chuỗi đánh dấu không
        if self.DELIMITER in decoded_message:
            # Tách tin nhắn tại chuỗi đánh dấu, lấy phần trước chuỗi đánh dấu
            # split(DELIMITER)[0]: lấy phần đầu tiên (tin nhắn thật)
            decoded_message = decoded_message.split(self.DELIMITER)[0]
        else:
            # Không tìm thấy chuỗi đánh dấu → ảnh không có tin nhắn hoặc bị hỏng
            raise ValueError("No hidden message found or image corrupted")
        
        # ===== BƯỚC 5: GIẢI MÃ TIN NHẮN (NẾU ĐÃ MÃ HÓA) =====
        if self.use_encryption:  # Nếu đã mã hóa lúc nhúng
            # Chuyển chuỗi hex thành byte
            # Ví dụ: "0102" → b'\x01\x02'
            encrypted_bytes = bytes.fromhex(decoded_message)
            # Giải mã bằng AES-256-CBC
            decoded_message = self._decrypt_message(encrypted_bytes)
        
        # Trả về tin nhắn gốc
        return decoded_message
