# 🤝 Contributing to PyStegoWatermark Suite

Cảm ơn bạn đã quan tâm đến việc đóng góp cho project! Tài liệu này hướng dẫn cách contribute hiệu quả.

---

## 📋 Mục lục

1. [Code of Conduct](#code-of-conduct)
2. [Cách đóng góp](#cách-đóng-góp)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

### Cam kết của chúng tôi

- ✅ Tôn trọng mọi người
- ✅ Chấp nhận phản hồi mang tính xây dựng
- ✅ Tập trung vào điều tốt nhất cho cộng đồng
- ✅ Thể hiện sự đồng cảm với người khác

### Không chấp nhận

- ❌ Ngôn ngữ hoặc hình ảnh khiêu dâm
- ❌ Trolling, bình luận xúc phạm
- ❌ Quấy rối công khai hoặc riêng tư
- ❌ Hành vi không chuyên nghiệp khác

---

## 🎯 Cách đóng góp

### Các cách bạn có thể đóng góp:

1. **🐛 Báo cáo bugs**
2. **💡 Đề xuất tính năng mới**
3. **📝 Cải thiện documentation**
4. **🔧 Fix bugs**
5. **✨ Implement tính năng mới**
6. **🧪 Viết tests**
7. **🎨 Cải thiện UI/UX**

---

## 🛠️ Development Setup

### 1. Fork và Clone

```bash
# Fork repository trên GitHub
# Clone fork của bạn
git clone https://github.com/YOUR_USERNAME/PyStegoWatermark.git
cd PyStegoWatermark

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/PyStegoWatermark.git
```

### 2. Tạo Virtual Environment

```bash
# Tạo venv
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 3. Cài đặt Dependencies

```bash
# Install requirements
pip install -r requirements.txt

# Install development dependencies
pip install pytest black flake8 mypy
```

### 4. Setup Project

```bash
python setup.py
python create_sample_images.py
```

### 5. Tạo Branch mới

```bash
git checkout -b feature/your-feature-name
# hoặc
git checkout -b fix/bug-description
```

---

## 📏 Coding Standards

### Python Style Guide

Chúng tôi tuân theo **PEP 8** với một số điều chỉnh:

#### 1. Formatting

```python
# Sử dụng Black formatter
black core/ app.py

# Line length: 100 characters (không phải 79)
# Indentation: 4 spaces
# Quotes: Single quotes cho strings, double cho docstrings
```

#### 2. Naming Conventions

```python
# Classes: PascalCase
class LSB_Stego:
    pass

# Functions/methods: snake_case
def calculate_psnr(image1, image2):
    pass

# Constants: UPPER_SNAKE_CASE
DELIMITER = "<<<END>>>"

# Private methods: _leading_underscore
def _internal_helper(self):
    pass
```

#### 3. Docstrings

```python
def embed_watermark(host_image, watermark, alpha=0.1):
    """
    Nhúng watermark vào ảnh gốc.
    
    Args:
        host_image (np.ndarray): Ảnh gốc
        watermark (np.ndarray): Ảnh watermark
        alpha (float): Hệ số nhúng (0.01-0.5)
    
    Returns:
        np.ndarray: Ảnh đã nhúng watermark
    
    Raises:
        ValueError: Nếu kích thước ảnh không hợp lệ
    
    Example:
        >>> wm = DCT_SVD_Watermark()
        >>> result = wm.embed("host.png", "logo.png", alpha=0.1)
    """
    pass
```

#### 4. Type Hints

```python
from typing import Tuple, Optional
import numpy as np

def process_image(
    image: np.ndarray,
    alpha: float = 0.1
) -> Tuple[np.ndarray, dict]:
    """Process image with type hints"""
    pass
```

#### 5. Error Handling

```python
# Good
try:
    result = risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    raise CustomException("User-friendly message") from e

# Bad
try:
    result = risky_operation()
except:  # Too broad
    pass  # Silent failure
```

### Code Organization

```python
# 1. Standard library imports
import os
import sys

# 2. Third-party imports
import numpy as np
import cv2

# 3. Local imports
from core.utils import calculate_psnr
from core.steganography import LSB_Stego

# 4. Constants
MAX_IMAGE_SIZE = 4096

# 5. Classes and functions
class MyClass:
    pass

def my_function():
    pass
```

---

## 🧪 Testing

### Chạy Tests

```bash
# Chạy tất cả tests
python test_example.py

# Hoặc với pytest (nếu có)
pytest tests/

# Với coverage
pytest --cov=core tests/
```

### Viết Tests

```python
# tests/test_steganography.py
import unittest
from core.steganography import LSB_Stego

class TestLSBStego(unittest.TestCase):
    def setUp(self):
        self.stego = LSB_Stego()
    
    def test_embed_extract(self):
        """Test embed và extract message"""
        message = "Test message"
        # ... test logic
        self.assertEqual(extracted, message)
    
    def test_invalid_input(self):
        """Test error handling"""
        with self.assertRaises(ValueError):
            self.stego.embed(None, "message", "output.png")
```

### Test Coverage

Đảm bảo test coverage > 80% cho code mới:

```bash
pytest --cov=core --cov-report=html
# Xem report tại htmlcov/index.html
```

---

## 🔄 Pull Request Process

### 1. Trước khi submit PR

- [ ] Code đã được format (Black)
- [ ] Đã chạy linter (flake8)
- [ ] Tất cả tests pass
- [ ] Đã thêm tests cho code mới
- [ ] Documentation đã được update
- [ ] Commit messages rõ ràng

### 2. Commit Messages

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: Tính năng mới
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(watermarking): add DWT watermarking algorithm

- Implement DWT transform
- Add extraction method
- Update tests

Closes #123
```

### 3. Submit PR

1. Push branch lên fork của bạn:
```bash
git push origin feature/your-feature-name
```

2. Tạo Pull Request trên GitHub

3. Điền template:
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing done

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### 4. Review Process

- Maintainer sẽ review trong vòng 3-5 ngày
- Có thể yêu cầu changes
- Sau khi approve, PR sẽ được merge

---

## 🐛 Reporting Bugs

### Trước khi báo cáo

1. Tìm kiếm trong Issues xem bug đã được báo cáo chưa
2. Đảm bảo bạn đang dùng version mới nhất
3. Thử reproduce bug

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10]
- Python version: [e.g. 3.10.5]
- Package versions: [run `pip list`]

**Additional context**
Any other context about the problem.
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.

**Would you like to implement this feature?**
- [ ] Yes, I can work on this
- [ ] No, just suggesting
```

---

## 📝 Documentation

### Cải thiện Documentation

Documentation nằm trong:
- `README.md`: Overview
- `QUICKSTART.md`: Quick start
- `ALGORITHMS.md`: Algorithm details
- `DEPLOYMENT.md`: Deployment guide
- Docstrings trong code

### Documentation Style

- Sử dụng Markdown
- Thêm code examples
- Thêm screenshots nếu cần
- Giữ ngôn ngữ đơn giản, rõ ràng
- Hỗ trợ cả tiếng Việt và tiếng Anh

---

## 🎨 UI/UX Contributions

### Streamlit UI

Nếu muốn cải thiện UI:

1. Giữ consistency với design hiện tại
2. Test trên nhiều screen sizes
3. Đảm bảo accessibility
4. Thêm screenshots trong PR

### Design Guidelines

- Colors: Sử dụng Streamlit default theme
- Spacing: Consistent padding/margins
- Typography: Clear hierarchy
- Icons: Emoji hoặc Streamlit icons

---

## 🏆 Recognition

Contributors sẽ được:
- Thêm vào CONTRIBUTORS.md
- Mention trong release notes
- Credit trong documentation

---

## ❓ Questions?

Nếu có câu hỏi:
1. Check documentation
2. Search existing Issues
3. Create new Issue với label "question"
4. Email: [your-email]

---

## 📚 Resources

### Learning Resources
- [PEP 8 Style Guide](https://pep8.org/)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [OpenCV Tutorials](https://docs.opencv.org/master/d9/df8/tutorial_root.html)

### Tools
- [Black](https://black.readthedocs.io/): Code formatter
- [flake8](https://flake8.pycqa.org/): Linter
- [mypy](http://mypy-lang.org/): Type checker
- [pytest](https://pytest.org/): Testing framework

---

**Thank you for contributing! 🎉**

Every contribution, no matter how small, makes a difference!
