# HƯỚNG DẪN ĐA NGÔN NGỮ (I18N GUIDELINES) — NHÀ XE ĐÔNG LÝ

Tài liệu này hướng dẫn quản lý bản dịch tập trung, quy tắc đặt translation key, xử lý interpolation và định dạng theo locale cho website và cổng quản trị Đông Lý.

---

## 1. DANH SÁCH NGÔN NGỮ ĐƯỢC HỖ TRỢ

* **Tiếng Việt (`vi`)**: Ngôn ngữ mặc định chính thức của toàn hệ thống (Locale: `vi-VN`).
* **Tiếng Anh (`en`)**: Ngôn ngữ bổ sung cho khách nước ngoài và mở rộng toàn cầu (Locale: `en-US`).

---

## 2. CẤU TRÚC THƯ MỤC TRANSLATION FILES

Hệ thống lưu trữ song song bản dịch JSON tại thư mục `public/i18n/` và đồng bộ trong từ điển TypeScript tại `src/app/core/i18n/translations/` để đảm bảo khởi tạo tức thì (Zero Latency):

```text
public/i18n/
├── vi/
│   ├── common.json        # Nút bấm, trạng thái chung, ngôn ngữ, theme
│   ├── navigation.json    # Menu điều hướng, breadcrumbs
│   ├── auth.json          # Đăng nhập, phân quyền, bảo mật
│   ├── dashboard.json     # Bàn làm việc, thống kê
│   ├── home.json          # Trang chủ, banner, tính năng xe
│   ├── booking.json       # Luồng đặt vé, chọn ghế, tổng tiền
│   ├── trip.json          # Chuyến xe, giờ chạy, lộ trình
│   ├── passenger.json     # Thông tin hành khách, ghi chú
│   ├── payment.json       # Thanh toán, QR, phương thức
│   ├── ticket.json        # Tra cứu vé, mã vé, trạng thái
│   └── validation.json    # Thông báo lỗi form, validation
└── en/
    └── (Cấu trúc tương ứng 100% với vi/)
```

---

## 3. QUY TẮC ĐẶT TRANSLATION KEY

1. Phân cấp theo namespace rõ ràng bằng dấu chấm: `<namespace>.<feature>.<element>`.
   * Ví dụ: `common.actions.continue`, `auth.adminLoginTitle`, `validation.usernameRequired`.
2. Không sử dụng câu tiếng Việt thô làm key (ví dụ: ~~`"Đăng nhập hệ thống": "..."`~~).
3. Không đặt key mơ hồ kỹ thuật (ví dụ: ~~`text1`, `label2`, `msg3`~~).
4. Key phải mang tính ổn định ngay cả khi câu chữ quảng cáo thay đổi.

---

## 4. CÁCH SỬ DỤNG TRONG COMPONENT & TEMPLATE

### 4.1. Trong Template (Sử dụng `TranslatePipe`)
Import `TranslatePipe` vào component standalone:

```html
<!-- Dịch văn bản thông thường -->
<h1>{{ 'auth.adminLoginTitle' | translate }}</h1>

<!-- Dịch có tham số truyền vào (Interpolation) -->
<p>{{ 'auth.loginSuccess' | translate: { name: user.fullName } }}</p>

<!-- Dịch placeholder & thuộc tính HTML -->
<input [placeholder]="'auth.usernamePlaceholder' | translate" />
```

### 4.2. Trong Code TypeScript (Sử dụng `TranslationService`)
```typescript
import { inject } from '@angular/core';
import { TranslationService } from 'src/app/core/i18n/translation.service';

export class ExampleComponent {
  private readonly i18n = inject(TranslationService);

  showNotification(): void {
    const message = this.i18n.translate('common.states.success');
    console.log(message);
  }
}
```

---

## 5. ĐỊNH DẠNG NGÀY GIỜ, SỐ VÀ TIỀN TỆ THEO LOCALE

Không format tiền tệ hoặc ngày giờ bằng cách nối chuỗi thủ công. Sử dụng các phương thức có sẵn của `TranslationService`:

* **Định dạng ngày**: `i18n.formatDate(date)` (ra định dạng `DD/MM/YYYY` ở `vi` hoặc `MM/DD/YYYY` ở `en`).
* **Định dạng tiền tệ**: `i18n.formatCurrency(amount)` (luôn giữ đồng tiền VND: `250.000 ₫` ở `vi` và `VND 250,000` ở `en`). **Tuyệt đối không tự ý đổi tỷ giá tiền tệ sang USD.**
* **Định dạng số**: `i18n.formatNumber(12500)` -> `12.500` ở `vi`.

---

## 6. QUY TẮC FALLBACK VÀ PHÁT HIỆN MISSING KEY

* Khi thiếu key trong tiếng Anh (`en`), hệ thống sẽ tự động fallback sang bản dịch tiếng Việt (`vi`).
* Khi thiếu key ở cả hai ngôn ngữ:
  * Trong môi trường **Development**, console sẽ log cảnh báo: `[i18n] Missing translation key: "..."`.
  * Trong môi trường **Production**, hệ thống hiển thị chính key đó để không làm gãy giao diện.
