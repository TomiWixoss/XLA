"""
LSB Steganography - Giấu tin mật trong ảnh
"""

import numpy as np
import cv2
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import hashlib


class LSB_Stego:
    """Class xử lý giấu tin sử dụng thuật toán LSB (Least Significant Bit)"""
    
    DELIMITER = "<<<END_OF_MESSAGE>>>"
    
    def __init__(self, use_encryption=False, password=None):
        """
        Args:
            use_encryption: Có mã hóa message trước khi nhúng không
            password: Mật khẩu để mã hóa (nếu use_encryption=True)
        """
        self.use_encryption = use_encryption
        self.password = password
        
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
        data_index = 0
        stego_image = image.copy()
        
        for i in range(image.shape[0]):
            for j in range(image.shape[1]):
                for k in range(3):  # BGR channels
                    if data_index < message_length:
                        # Thay LSB bằng bit của message
                        stego_image[i, j, k] = (image[i, j, k] & 0xFE) | int(binary_message[data_index])
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
            'encrypted': self.use_encryption
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
