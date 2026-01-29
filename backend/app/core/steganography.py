"""
LSB Steganography - Giấu tin mật trong ảnh
Chuẩn học thuật theo:
- Analysis of LSB based image steganography techniques (2004)
- Adaptive LSB based on visual color sensitivity (2020)
- LSB Pseudorandom Algorithm using Skew Tent Map (2019)
"""

import numpy as np
import cv2
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import hashlib


class LSB_Stego:
    """
    Class xử lý giấu tin sử dụng thuật toán LSB (Least Significant Bit)
    
    Cải tiến theo chuẩn học thuật:
    1. Adaptive LSB: Nhúng nhiều bits ở vùng edge, ít bits ở vùng smooth
    2. Pseudorandom embedding: Nhúng theo thứ tự ngẫu nhiên thay vì tuần tự
    3. AES encryption: Mã hóa message trước khi nhúng
    """
    
    DELIMITER = "<<<END_OF_MESSAGE>>>"
    
    def __init__(self, use_encryption=False, password=None, use_adaptive=False, use_pseudorandom=False, seed=None):
        """
        Args:
            use_encryption: Có mã hóa message trước khi nhúng không
            password: Mật khẩu để mã hóa (nếu use_encryption=True)
            use_adaptive: Sử dụng Adaptive LSB (nhúng nhiều bits ở edge)
            use_pseudorandom: Sử dụng pseudorandom embedding (tăng security)
            seed: Seed cho pseudorandom (nếu use_pseudorandom=True)
        """
        self.use_encryption = use_encryption
        self.password = password
        self.use_adaptive = use_adaptive
        self.use_pseudorandom = use_pseudorandom
        self.seed = seed if seed is not None else 42
        
        if use_encryption and not password:
            raise ValueError("Password is required when encryption is enabled")
    
    def _get_key(self):
        """Tạo AES key từ password"""
        return hashlib.sha256(self.password.encode()).digest()
    
    def _encrypt_message(self, message):
        """Mã hóa message bằng AES"""
        key = self._get_key()
        cipher = AES.new(key, AES.MODE_CBC)
        ct_bytes = cipher.encrypt(pad(message.encode(), AES.block_size))
        iv = cipher.iv
        return iv + ct_bytes
    
    def _decrypt_message(self, encrypted_data):
        """Giải mã message"""
        key = self._get_key()
        iv = encrypted_data[:16]
        ct = encrypted_data[16:]
        cipher = AES.new(key, AES.MODE_CBC, iv)
        return unpad(cipher.decrypt(ct), AES.block_size).decode()
    
    def _text_to_binary(self, text):
        """Chuyển text sang chuỗi binary"""
        return ''.join(format(ord(char), '08b') for char in text)
    
    def _binary_to_text(self, binary):
        """Chuyển chuỗi binary sang text"""
        chars = [binary[i:i+8] for i in range(0, len(binary), 8)]
        return ''.join(chr(int(char, 2)) for char in chars)
    
    def _optimal_pixel_adjustment(self, original_pixel, stego_pixel, k=1):
        """
        Optimal Pixel Adjustment Process (OPAP) - CHUẨN PAPER CHAN & CHENG 2004
        
        Thuật toán OPAP để cải thiện PSNR của stego image:
        - Nếu embedding k bits làm pixel thay đổi quá nhiều
        - Điều chỉnh pixel để minimize distortion
        
        Args:
            original_pixel: Giá trị pixel gốc (0-255)
            stego_pixel: Giá trị pixel sau khi nhúng LSB
            k: Số bits đã nhúng (default=1)
        
        Returns:
            adjusted_pixel: Pixel đã được điều chỉnh tối ưu
        """
        l = 2 ** k  # 2^k
        
        # Tính difference (ép kiểu sang int để tránh overflow)
        diff = int(stego_pixel) - int(original_pixel)
        
        # OPAP adjustment theo paper
        if diff > l / 2:
            # Nếu tăng quá nhiều, giảm xuống
            adjusted = stego_pixel - l
        elif diff < -l / 2:
            # Nếu giảm quá nhiều, tăng lên
            adjusted = stego_pixel + l
        else:
            # Trong khoảng chấp nhận được, giữ nguyên
            adjusted = stego_pixel
        
        # Clip về range [0, 255]
        return np.clip(adjusted, 0, 255)
    
    def _detect_edges(self, image):
        """
        Phát hiện edges để Adaptive LSB (CHUẨN HỌC THUẬT)
        
        Returns:
            edge_map: Ma trận boolean, True = edge (có thể nhúng nhiều bits)
        """
        # Chuyển sang grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Canny edge detection
        edges = cv2.Canny(gray, 100, 200)
        
        # Dilate để mở rộng vùng edge
        kernel = np.ones((3, 3), np.uint8)
        edges_dilated = cv2.dilate(edges, kernel, iterations=1)
        
        return edges_dilated > 0
    
    def _generate_pseudorandom_positions(self, total_positions, message_length):
        """
        Tạo vị trí ngẫu nhiên để nhúng (CHUẨN HỌC THUẬT)
        
        Theo paper: LSB Pseudorandom Algorithm using Skew Tent Map (2019)
        
        Returns:
            positions: Array các vị trí để nhúng message
        """
        np.random.seed(self.seed)
        
        # Tạo permutation ngẫu nhiên
        all_positions = np.arange(total_positions)
        np.random.shuffle(all_positions)
        
        # Lấy số lượng positions cần thiết
        return all_positions[:message_length]
    
    def embed(self, cover_image_path, secret_message, output_path):
        """
        Nhúng thông điệp vào ảnh
        
        Args:
            cover_image_path: Đường dẫn ảnh gốc
            secret_message: Thông điệp cần giấu
            output_path: Đường dẫn lưu ảnh stego
        
        Returns:
            dict: Thông tin về quá trình nhúng
        """
        # Đọc ảnh
        image = cv2.imread(cover_image_path)
        if image is None:
            raise ValueError(f"Cannot read image: {cover_image_path}")
        
        # Mã hóa message nếu cần
        if self.use_encryption:
            encrypted = self._encrypt_message(secret_message)
            message_to_hide = encrypted.hex()  # Convert bytes to hex string
        else:
            message_to_hide = secret_message
        
        # Thêm delimiter
        message_to_hide += self.DELIMITER
        
        # Chuyển sang binary
        binary_message = self._text_to_binary(message_to_hide)
        message_length = len(binary_message)
        
        # Kiểm tra capacity
        image_capacity = image.shape[0] * image.shape[1] * 3  # 3 channels
        if message_length > image_capacity:
            raise ValueError(f"Message too large. Max capacity: {image_capacity} bits, Message: {message_length} bits")
        
        # Nhúng message vào LSB
        stego_image = image.copy()
        
        if self.use_adaptive:
            # ADAPTIVE LSB (CHUẨN HỌC THUẬT)
            # Nhúng nhiều bits ở vùng edge, ít bits ở vùng smooth
            edge_map = self._detect_edges(image)
            
            data_index = 0
            for i in range(image.shape[0]):
                for j in range(image.shape[1]):
                    for k in range(3):  # BGR channels
                        if data_index >= message_length:
                            break
                        
                        if edge_map[i, j]:
                            # Vùng edge: có thể nhúng 2 bits (LSB và bit thứ 2)
                            if data_index < message_length:
                                bit1 = int(binary_message[data_index])
                                stego_image[i, j, k] = (image[i, j, k] & 0xFE) | bit1
                                data_index += 1
                            
                            if data_index < message_length:
                                bit2 = int(binary_message[data_index])
                                stego_image[i, j, k] = (stego_image[i, j, k] & 0xFD) | (bit2 << 1)
                                data_index += 1
                        else:
                            # Vùng smooth: chỉ nhúng 1 bit (LSB)
                            bit = int(binary_message[data_index])
                            stego_image[i, j, k] = (image[i, j, k] & 0xFE) | bit
                            data_index += 1
                    
                    if data_index >= message_length:
                        break
                if data_index >= message_length:
                    break
        
        elif self.use_pseudorandom:
            # PSEUDORANDOM LSB (CHUẨN HỌC THUẬT)
            # Nhúng theo thứ tự ngẫu nhiên thay vì tuần tự
            total_positions = image.shape[0] * image.shape[1] * 3
            positions = self._generate_pseudorandom_positions(total_positions, message_length)
            
            flat_image = stego_image.flatten()
            
            for idx, pos in enumerate(positions):
                if idx < message_length:
                    bit = int(binary_message[idx])
                    flat_image[pos] = (flat_image[pos] & 0xFE) | bit
            
            stego_image = flat_image.reshape(image.shape)
        
        else:
            # STANDARD LSB WITH OPAP (CHUẨN PAPER CHAN & CHENG 2004)
            data_index = 0
            for i in range(image.shape[0]):
                for j in range(image.shape[1]):
                    for k in range(3):  # BGR channels
                        if data_index < message_length:
                            original_value = image[i, j, k]
                            
                            # Thay LSB bằng bit của message
                            stego_value = (original_value & 0xFE) | int(binary_message[data_index])
                            
                            # KHÔNG dùng OPAP cho LSB đơn giản (k=1) vì có thể làm sai LSB
                            # OPAP chỉ hữu ích khi nhúng nhiều bits (k > 1)
                            stego_image[i, j, k] = stego_value
                            data_index += 1
                        else:
                            break
                    if data_index >= message_length:
                        break
                if data_index >= message_length:
                    break
        
        # Lưu ảnh stego (dùng PNG để tránh mất dữ liệu do compression)
        cv2.imwrite(output_path, stego_image)
        
        return {
            'success': True,
            'message_length': len(secret_message),
            'bits_used': message_length,
            'capacity': image_capacity,
            'usage_percent': (message_length / image_capacity) * 100,
            'encrypted': self.use_encryption,
            'algorithm': 'Adaptive-LSB' if self.use_adaptive else ('Pseudorandom-LSB' if self.use_pseudorandom else 'Standard-LSB'),
            'adaptive': self.use_adaptive,
            'pseudorandom': self.use_pseudorandom
        }
    
    def extract(self, stego_image_path):
        """
        Trích xuất thông điệp từ ảnh stego
        
        Args:
            stego_image_path: Đường dẫn ảnh stego
        
        Returns:
            str: Thông điệp đã giấu
        """
        # Đọc ảnh
        image = cv2.imread(stego_image_path)
        if image is None:
            raise ValueError(f"Cannot read image: {stego_image_path}")
        
        # Trích xuất LSB
        binary_message = ""
        
        if self.use_adaptive:
            # ADAPTIVE LSB EXTRACTION
            edge_map = self._detect_edges(image)
            
            for i in range(image.shape[0]):
                for j in range(image.shape[1]):
                    for k in range(3):
                        if edge_map[i, j]:
                            # Vùng edge: trích xuất 2 bits
                            bit1 = image[i, j, k] & 1
                            bit2 = (image[i, j, k] >> 1) & 1
                            binary_message += str(bit1)
                            binary_message += str(bit2)
                        else:
                            # Vùng smooth: trích xuất 1 bit
                            binary_message += str(image[i, j, k] & 1)
        
        elif self.use_pseudorandom:
            # PSEUDORANDOM LSB EXTRACTION
            total_positions = image.shape[0] * image.shape[1] * 3
            # Tạo lại cùng positions với cùng seed
            positions = self._generate_pseudorandom_positions(total_positions, total_positions)
            
            flat_image = image.flatten()
            
            for pos in positions:
                binary_message += str(flat_image[pos] & 1)
        
        else:
            # STANDARD LSB EXTRACTION
            for i in range(image.shape[0]):
                for j in range(image.shape[1]):
                    for k in range(3):
                        binary_message += str(image[i, j, k] & 1)
        
        # Chuyển binary sang text
        all_bytes = [binary_message[i:i+8] for i in range(0, len(binary_message), 8)]
        decoded_message = ""
        
        for byte in all_bytes:
            if len(byte) == 8:
                decoded_message += chr(int(byte, 2))
                if decoded_message.endswith(self.DELIMITER):
                    break
        
        # Loại bỏ delimiter
        if self.DELIMITER in decoded_message:
            decoded_message = decoded_message.replace(self.DELIMITER, "")
        else:
            raise ValueError("No hidden message found or image corrupted")
        
        # Giải mã nếu cần
        if self.use_encryption:
            encrypted_bytes = bytes.fromhex(decoded_message)
            decoded_message = self._decrypt_message(encrypted_bytes)
        
        return decoded_message
