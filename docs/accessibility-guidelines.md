# TIÊU CHUẨN TRUY CẬP (ACCESSIBILITY GUIDELINES — WCAG 2.2 AA) — NHÀ XE ĐÔNG LÝ

Tài liệu này quy định các tiêu chuẩn bắt buộc về khả năng tiếp cận (Accessibility) cho mọi lập trình viên và AI Agent khi xây dựng giao diện người dùng cho Nhà xe Đông Lý.

---

## 1. TIÊU CHUẨN TƯƠNG PHẢN MÀU SẮC (COLOR CONTRAST)

* **Văn bản thông thường (< 18pt hoặc < 14pt bold)**: Tỷ lệ tương phản tối thiểu đạt **4.5:1** so với nền.
* **Văn bản lớn (>= 18pt hoặc >= 14pt bold)**: Tỷ lệ tương phản tối thiểu đạt **3:1**.
* **Thành phần tương tác & Icon**: Tỷ lệ tương phản viền và biểu tượng đạt tối thiểu **3:1** so với nền lân cận.
* Mọi cặp màu trong bảng semantic tokens của cả Light và Dark Theme đã được thẩm định đạt chuẩn WCAG 2.2 AA.

---

## 2. VÙNG CHẠM TỐI THIỂU (TAP TARGETS)

* Mọi phần tử có thể click/tap (nút bấm, checkbox, radio, toggle icon, link) trên màn hình cảm ứng phải đạt diện tích tối thiểu **44 x 44px**.
* Đối với các icon nhỏ hơn (ví dụ icon con mắt ẩn/hiện mật khẩu 20x20px), phải bao bọc bởi button có padding sao cho kích thước vùng tương tác đạt ít nhất 44x44px.

---

## 3. ĐIỀU HƯỚNG BẰNG BÀN PHÍM (KEYBOARD ACCESSIBILITY)

* Mọi chức năng tương tác bằng chuột phải thực hiện được bằng phím (Phím `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow keys`, `Escape`).
* **Trật tự Tab logic**: Phải theo đúng thứ tự đọc tự nhiên từ trên xuống dưới, từ trái sang phải.
* **Focus Visible**: Không được ẩn `outline: none` nếu không có vòng sáng thay thế rõ ràng. Focus ring mặc định sử dụng màu vàng kim thương hiệu `--color-focus: #F2B632` với `outline-offset: 2px`.

---

## 4. NHÃN TRỢ NĂNG (ACCESSIBLE LABELS & ARIA)

* Mọi thẻ `<input>`, `<select>`, `<textarea>` phải có `<label>` liên kết thông qua `for` và `id`.
* Các nút chỉ có icon (icon-only button như nút đóng, nút đổi theme, nút đổi mật khẩu) bắt buộc phải có thuộc tính `aria-label` mô tả rõ ràng hành động (ví dụ: `aria-label="Hiện mật khẩu"` / `aria-label="Ẩn mật khẩu"`).
* Các vùng thông báo lỗi phải có `role="alert"` và `aria-live="assertive"` hoặc `aria-live="polite"` để Screen Reader thông báo tức thời.

---

## 5. TÔN TRỌNG TÙY CHỌN NGƯỜI DÙNG (PREFERS-REDUCED-MOTION)

Mọi hiệu ứng chuyển động, chuyển đổi theme và spinner loading phải tôn trọng cài đặt `prefers-reduced-motion: reduce`:

```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
