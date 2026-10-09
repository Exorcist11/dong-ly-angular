# HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM) — NHÀ XE ĐÔNG LÝ

Tài liệu này định nghĩa hệ thống Design Tokens, bảng màu nhận diện thương hiệu, nguyên tắc tương phản WCAG 2.2 AA và hướng dẫn áp dụng cho cả hai chế độ **Light Theme** và **Dark Theme**.

---

## 1. MÀU SẮC NHẬN DIỆN THƯƠNG HIỆU (BRAND PALETTE)

Các màu sắc nhận diện thương hiệu Đông Lý là hằng số bất biến và không được thay đổi giữa các giao diện:

| Tên Token | Mã Hex | Ý nghĩa & Ứng dụng |
|:---|:---|:---|
| `--primary` | `#D71920` | Đỏ thương hiệu Đông Lý, dùng cho các nút hành động chính (Primary CTA), biểu tượng logo |
| `--primary-dark` | `#A50F16` | Trạng thái Hover của nút chính |
| `--charcoal` | `#16161A` | Đen than chì sang trọng, dùng cho tiêu đề, sidebar và nền login |
| `--gold` | `#F2B632` | Vàng kim quý phái, dùng cho đường kẻ nhấn, focus ring, ngôi sao đánh giá |
| `--gold-soft` | `#FFF3D1` | Nền điểm nhấn mềm mại |
| `--bg-cream` | `#FFFBF5` | Kem ấm áp, nền tổng thể giao diện Light Mode |
| `--surface` | `#FFFFFF` | Nền trắng thẻ card trong Light Mode |

---

## 2. SEMANTIC DESIGN TOKENS (LIGHT & DARK THEMES)

Tất cả component **bắt buộc** sử dụng Semantic Tokens để tự động thích ứng mượt mà khi chuyển đổi giao diện:

### 2.1. Tokens Bề Mặt & Nền (Surfaces & Backgrounds)
* `--color-bg`: Nền tổng thể trang (`#FFFBF5` ở Light / `#121215` ở Dark).
* `--color-surface`: Nền của Card, Dialog, Topbar (`#FFFFFF` ở Light / `#1A1A20` ở Dark).
* `--color-surface-raised`: Nền thẻ nâng cao hoặc dropdown nổi (`#FFFFFF` ở Light / `#24242C` ở Dark).
* `--color-surface-sunken`: Nền vùng thụt vào, input background, ô chứa toggle (`#F4F1EC` ở Light / `#0D0D10` ở Dark).
* `--color-surface-hover`: Nền khi hover trên các phần tử danh sách (`#F8F5F0` ở Light / `#2D2D38` ở Dark).

### 2.2. Tokens Văn Bản (Typography Colors)
* `--color-text-primary`: Chữ chính, tiêu đề cấp 1-3 (`#16161A` ở Light / `#F4F1EC` ở Dark).
* `--color-text-secondary`: Chữ phụ, mô tả, nội dung thẻ (`#3A3733` ở Light / `#D9D4CC` ở Dark).
* `--color-text-muted`: Nhãn phụ, placeholder, chú thích thời gian (`#8A857D` ở cả hai chế độ).
* `--color-text-inverse`: Chữ tương phản nghịch đảo khi nằm trên nền đối lập.

### 2.3. Tokens Viền & Shadow (Borders & Shadows)
* `--color-border`: Viền thông thường cho Input, Card, Phân cách (`#D9D4CC` ở Light / `#2E2E3A` ở Dark).
* `--color-border-subtle`: Đường kẻ chia cách mờ nhạt (`#F4F1EC` ở Light / `#22222B` ở Dark).
* `--color-focus`: Vòng sáng chỉ thị focus (`#F2B632`).
* `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-card`: Bóng đổ thích ứng (nhạt mềm ở Light, sâu đậm hơn ở Dark).

---

## 3. NGUYÊN TẮC TYPOGRAPHY & SPACING (8PT GRID)

* **Font chữ chính**: `Be Vietnam Pro` (fallback: Inter, system-ui). Hỗ trợ 100% tiếng Việt có dấu.
* **Cỡ chữ chuẩn**: Body `16px` / Line-height `1.6`. Input `16px` (ngăn zoom trên mobile Safari).
* **Hệ thống khoảng cách (8pt grid)**:
  * Khoảng cách Label đến Input: `8px`.
  * Khoảng cách giữa các trường form: `20px`.
  * Khoảng cách Section / Card Padding: `24px` đến `40px`.
* **Bo góc (Border Radius)**:
  * `--radius-sm`: `4px` (huy hiệu, tag nhỏ).
  * `--radius-md`: `8px` (button phụ, notification toast).
  * `--radius-input`: `12px` (input, button chính, card nhỏ).
  * `--radius-card`: `20px` (card chính, modal).

---

## 4. HƯỚNG DẪN SỬ DỤNG TRONG COMPONENT

```scss
/* Đúng: Sử dụng Semantic Token */
.my-card {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

/* Sai: Hardcode mã hex trực tiếp */
.bad-card {
  background-color: #ffffff; // Sẽ bị chói lóa và sai lệch khi sang Dark Mode!
  color: #16161A;
}
```
