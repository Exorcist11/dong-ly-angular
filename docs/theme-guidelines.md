# HƯỚNG DẪN DARK MODE & QUẢN LÝ THEME (THEME GUIDELINES) — NHÀ XE ĐÔNG LÝ

Tài liệu này quy định kiến trúc quản lý Theme, cách thức lưu trữ ưu tiên người dùng (Persistence), tích hợp PrimeNG Theme và phòng chống Flash of Unstyled Theme (FOUT/FOIT).

---

## 1. BA TRẠNG THÁI GIAO DIỆN (THEME MODES)

Hệ thống Đông Lý hỗ trợ chính xác 3 chế độ:

1. **Light Mode (`light`)**: Luôn sử dụng giao diện sáng ấm áp (nền kem `--bg-cream: #FFFBF5`, thẻ trắng `--surface: #FFFFFF`).
2. **Dark Mode (`dark`)**: Luôn sử dụng giao diện tối than chì sang trọng (nền `--color-bg: #121215`, thẻ `--color-surface: #1A1A20`).
3. **System Mode (`system`)**: Tự động đồng bộ theo thiết lập giao diện của hệ điều hành người dùng (`(prefers-color-scheme: dark)`).

---

## 2. QUẢN LÝ STATE VÀ LƯU TRỮ (PERSISTENCE)

* **Key lưu trữ**: `localStorage.getItem('dongly_theme')`.
* **Quy tắc ưu tiên**:
  * Khi người dùng chủ động chọn `light` hoặc `dark`, giá trị này được lưu và ghi đè lựa chọn hệ thống.
  * Khi chọn `system`, hệ thống lưu giá trị `'system'` và gắn listener theo dõi sự kiện đổi theme của hệ điều hành theo thời gian thực mà không yêu cầu tải lại trang.

---

## 3. PHÒNG CHỐNG FLASH OF INCORRECT THEME (FOUT/FOIT)

Để ngăn chặn việc trang web chớp sáng trắng trước khi Angular khởi động, một script bootstrap siêu nhẹ được đặt ngay trong `<head>` của `src/index.html`:

```html
<script>
  (function() {
    try {
      var theme = localStorage.getItem('dongly_theme') || 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
</script>
```

---

## 4. TÍCH HỢP VỚI PRIMENG 21

PrimeNG được cấu hình trong `src/app/app.config.ts` để đồng bộ hoàn toàn với thuộc tính `data-theme`:

```typescript
providePrimeNG({
  theme: {
    preset: DongLyThemePreset,
    options: {
      darkModeSelector: '[data-theme="dark"]',
    },
  },
  ripple: true,
})
```

Khi thuộc tính `data-theme="dark"` xuất hiện trên `<html>`, toàn bộ component PrimeNG (`p-table`, `p-dialog`, `p-toast`, v.v.) tự động chuyển sang Dark Mode Preset mà không cần can thiệp code thủ công.

---

## 5. CHECKLIST KIỂM TRA COMPONENT HỖ TRỢ DARK MODE

Trước khi hoàn thành component mới, kiểm tra các tiêu chí sau:
- [ ] Không có chữ màu đen tuyệt đối biến mất trên nền tối.
- [ ] Mọi đường viền phân tách sử dụng `--color-border` hoặc `--color-border-subtle`.
- [ ] Trạng thái Hover, Focus và Active vẫn rõ nét và nổi bật.
- [ ] Nút chính màu đỏ `--primary` `#D71920` giữ nguyên độ sắc nét và tương phản cao.
- [ ] Nút bấm, toggle hoạt động mượt mà và tôn trọng `prefers-reduced-motion`.
