# 🎨 Image Palette Extractor

Ứng dụng web trích xuất bảng màu từ hình ảnh, được xây dựng theo chuẩn **Material Design 3** với hỗ trợ **PWA (Progressive Web App)**.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🖼️ Tải ảnh linh hoạt | Kéo thả, chọn tệp, nhập URL, hoặc dán từ clipboard |
| 🎨 Trích xuất bảng màu | Hai thuật toán: K-Means & Median Cut |
| 🔢 Tùy chỉnh số màu | Từ 2 đến 20 màu |
| 🔀 Sắp xếp màu | Theo độ sáng, tần suất, hoặc màu sắc (Hue) |
| 📋 Sao chép nhanh | Click vào ô màu để sao chép HEX |
| 🔍 Chi tiết màu | HEX, RGB, HSL, CMYK |
| 📤 Xuất bảng màu | CSS, SCSS, JSON, TXT, PNG |
| 🌐 Đa ngôn ngữ | Tiếng Việt và Tiếng Anh |
| 🌓 Chế độ sáng/tối | Sáng, Tối, Theo hệ thống |
| 💾 Lưu cài đặt | Ghi nhớ mọi tùy chỉnh qua `localStorage` |
| 📱 PWA | Cài đặt như ứng dụng native trên mọi thiết bị |
| 📊 Phân tích ảnh | Kích thước, độ sáng TB, độ bão hòa TB |

---

## 🚀 Cách dùng

### 1. Mở trực tiếp
Mở `index.html` trong trình duyệt (Chrome, Edge, Firefox, Safari).

### 2. Chạy server cục bộ (khuyến nghị cho PWA)
```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code Live Server extension
```

Truy cập: `http://localhost:8080`

---

## 📁 Cấu trúc dự án

```
palette-extractor/
├── index.html          # Trang chính (App Shell)
├── style.css           # Giao diện Material Design 3
├── app.js              # Logic ứng dụng
├── sw.js               # Service Worker (PWA)
├── manifest.json       # Web App Manifest (PWA)
├── favicon.svg         # Favicon (One UI 8 style)
├── icons/
│   ├── icon-192.png    # PWA icon 192×192
│   └── icon-512.png    # PWA icon 512×512
└── README.md           # Tài liệu này
```

---

## 🎛️ Tùy chỉnh & Cài đặt

Tất cả cài đặt được lưu tự động vào `localStorage` với key `palette-prefs`:

```json
{
  "lang": "vi",
  "theme": "system",
  "colorCount": 8,
  "algorithm": "kmeans",
  "sortBy": "luminance"
}
```

| Cài đặt | Giá trị | Mô tả |
|---------|---------|-------|
| `lang` | `"vi"` / `"en"` | Ngôn ngữ hiển thị |
| `theme` | `"system"` / `"light"` / `"dark"` | Chủ đề màu sắc |
| `colorCount` | `2–20` | Số màu cần trích xuất |
| `algorithm` | `"kmeans"` / `"median"` | Thuật toán trích xuất |
| `sortBy` | `"luminance"` / `"frequency"` / `"hue"` | Cách sắp xếp màu |

---

## 🧠 Thuật toán

### K-Means Clustering
- Phân cụm pixel theo màu sắc
- 12 vòng lặp tối ưu hóa
- Tốt cho ảnh phức tạp, nhiều màu

### Median Cut
- Chia không gian màu theo trung vị
- Nhanh hơn, tốt cho ảnh đơn giản
- Phù hợp trích xuất màu chủ đạo

---

## 📤 Định dạng xuất

| Định dạng | Mô tả |
|-----------|-------|
| **CSS Variables** | `:root { --color-1: #HEX; }` |
| **SCSS Variables** | `$color-1: #HEX;` |
| **JSON** | Object với HEX, RGB, HSL, % |
| **Text** | Danh sách HEX mỗi dòng |
| **PNG Swatch** | Ảnh bảng màu đẹp để share |

---

## 📱 PWA — Cài đặt ứng dụng

### Trên Android (Chrome)
1. Mở trang trong Chrome
2. Nhấn menu ⋮ → **"Thêm vào màn hình chính"**
3. Xác nhận → Ứng dụng xuất hiện như app native

### Trên iOS (Safari)
1. Mở trang trong Safari
2. Nhấn nút **Chia sẻ** ↑ → **"Thêm vào Màn hình chính"**
3. Xác nhận

### Trên Desktop (Chrome/Edge)
1. Mở trang
2. Nhấn biểu tượng **cài đặt** ⊕ trên thanh địa chỉ
3. Hoặc: Menu → **"Cài đặt [tên app]"**

---

## 🎨 Thiết kế

- **Design System**: Material Design 3 (Material You)
- **Font**: [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) — hỗ trợ đầy đủ tiếng Việt
- **Icons**: Google Material Symbols Rounded
- **Color**: Blue primary (#1565C0) với surface containers tự điều chỉnh
- **Favicon**: Phong cách One UI 8 — squircle bo góc, 4 chấm màu

---

## 🔒 Bảo mật & Quyền riêng tư

- **Hoàn toàn offline** sau lần tải đầu tiên (Service Worker)
- **Không gửi dữ liệu** lên server — mọi xử lý trên client
- **Không cần đăng ký**, không theo dõi người dùng
- Ảnh tải từ URL yêu cầu server hỗ trợ **CORS**

---

## 🌐 Trình duyệt hỗ trợ

| Trình duyệt | Phiên bản |
|-------------|-----------|
| Chrome / Edge | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Samsung Internet | 14+ |
| Opera | 76+ |

---

## 📝 Giấy phép

MIT License — Tự do sử dụng, chỉnh sửa và phân phối.

---

*Được xây dựng với ❤️ bằng Vanilla HTML, CSS & JavaScript — không framework, không dependency nặng.*
