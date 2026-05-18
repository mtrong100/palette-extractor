# 🎨 Image Palette Extractor

> Trích xuất bảng màu từ ảnh — dành cho content creators, nhà thiết kế và bất kỳ ai muốn làm việc với màu sắc.

---

## Giới thiệu

**Image Palette Extractor** là một ứng dụng web chạy hoàn toàn trên trình duyệt, giúp bạn:

- Tải ảnh lên và tự động nhận diện các màu chủ đạo
- Xuất bảng màu dưới nhiều định dạng (HEX, RGB, HSL)
- Sao chép mã màu chỉ với một cú nhấp
- Hỗ trợ song ngữ Tiếng Việt / English

Không cần đăng ký, không cần cài đặt — mở trình duyệt là dùng được.

---

## Tính năng

### Trích xuất màu
- Thuật toán **K-Means Clustering** xử lý trực tiếp trên trình duyệt (không gửi ảnh lên server)
- Hỗ trợ từ **2 đến 12 màu** mỗi lần trích xuất
- Tự động đặt tên màu theo ngôn ngữ hiển thị (Đỏ, Xanh lam, Tím... / Red, Blue, Purple...)

### Định dạng màu
| Định dạng | Ví dụ |
|-----------|-------|
| HEX | `#C84B31` |
| RGB | `rgb(200, 75, 49)` |
| HSL | `hsl(12, 60%, 49%)` |

### Xuất dữ liệu
- **CSS Variables** — dán thẳng vào stylesheet
- **JSON** — dành cho developer, bao gồm cả 3 định dạng HEX + RGB + HSL
- **Sao chép tất cả** — danh sách mã màu theo định dạng đang chọn

### Giao diện
- **Ngôn ngữ**: Tiếng Việt / English (chuyển đổi góc trên phải)
- **Theme**: Sáng / Tối / Theo hệ thống
- **Ghi nhớ tuỳ chỉnh**: ngôn ngữ, theme, số màu, định dạng được lưu vào `localStorage`

---

## Cách sử dụng

1. **Tải ảnh** — kéo thả hoặc nhấn vào vùng upload
2. **Chọn số màu** cần trích xuất (mặc định: 6)
3. **Chọn định dạng** hiển thị: HEX / RGB / HSL
4. Nhấn **"Trích xuất bảng màu"**
5. Nhấn vào **bất kỳ ô màu nào** để sao chép mã màu
6. Dùng nút **Export** để xuất toàn bộ palette

---

## Công nghệ sử dụng

| Thành phần | Chi tiết |
|------------|----------|
| Ngôn ngữ | HTML5, CSS3, Vanilla JavaScript |
| Font chữ | [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) + [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) |
| Icons | [Tabler Icons](https://tabler-icons.io/) (outline webfont) |
| Xử lý ảnh | Canvas API + K-Means Clustering tự triển khai |
| Lưu trữ | `localStorage` (toàn bộ xử lý diễn ra client-side) |

> **Bảo mật**: Ảnh của bạn **không bao giờ** rời khỏi thiết bị. Mọi xử lý đều diễn ra trực tiếp trong trình duyệt.

---

## Cấu trúc dự án

```
image-palette-extractor/
├── index.html        # Toàn bộ ứng dụng (single-file)
└── README.md         # Tài liệu này
```

---

## Phát triển thêm (gợi ý)

- [ ] Cho phép lưu palette thành file `.ase` (Adobe Swatch)
- [ ] Hiển thị độ tương phản màu (WCAG accessibility)
- [ ] Thêm chế độ xem Monochromatic / Complementary
- [ ] Hỗ trợ nhập URL ảnh trực tiếp
- [ ] Lịch sử các palette đã trích xuất

---

## Giấy phép

MIT License — tự do sử dụng, chỉnh sửa và phân phối.

---

*Được xây dựng với Claude · Anthropic*
