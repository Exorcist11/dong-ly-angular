# PROJECT RULES — ĐÔNG LÝ ANGULAR ADMIN FE

Tuân thủ đầy đủ và vô điều kiện các nguyên tắc tại [AGENTS.md](file:///e:/du-an-ma/Angular-FE/AGENTS.md).

## Tóm tắt các quy tắc cốt lõi:
1. **Kiến trúc**: Feature-based, 100% Standalone Components, `ChangeDetectionStrategy.OnPush`, Angular Signals cho UI state/computed values, RxJS cho streams & HTTP calls.
2. **API & Data Contract**: Tuân thủ nghiêm ngặt envelope của `Spring-BE` (`ApiResponse<T>`, `PageResponse<T>`, `ApiErrorResponse`). Tuyệt đối không bịa API hay mock data vào luồng chính.
3. **Authentication & Authorization**: JWT stateless, token rotation tại `/api/v1/auth/refresh`, nạp profile qua `/api/v1/auth/me`. Bắt buộc kiểm soát Refresh Token Mutex / Subject Queue chống race condition.
4. **Forms & Validation**: Reactive Forms, Typed Forms, validation tiếng Việt rõ ràng, không submit khi invalid.
5. **Reusable Code & Clean Code (Mục 17)**:
   - Áp dụng triệt để DRY, KISS, YAGNI, Single Responsibility, Type-safe.
   - Luôn khảo sát tái sử dụng component/service có sẵn trước khi tạo mới.
   - Tách biệt rõ ràng 5 layer: Component/Page, Service, Model/DTO, Utility/Pure Function, Shared Components.
   - Tự review 11 câu hỏi kiểm tra trước khi báo cáo hoàn thành (bao gồm kiểm tra 100% button).
6. **Shared Button Tiêu chuẩn Bắt buộc (Mục 7.7 AGENTS.md)**:
   - 100% button giao diện mới (màn hình, dialog, form, toolbar, bảng) bắt buộc sử dụng `<app-button>`.
   - Nghiêm cấm tạo button riêng, viết CSS riêng, hoặc dùng trực tiếp `<p-button>` / native `<button>` trong feature templates.
   - Không dùng button thay thế link điều hướng (`<a>` kèm `routerLink`) hoặc semantic controls khác.
   - Đảm bảo đúng `[type]`, có accessible name (`label`/`ariaLabel`), trạng thái `loading`/`disabled`, và tự động i18n.
   - Ngoại lệ kỹ thuật phải có lý do bất khả kháng, phạm vi cục bộ, ghi chú `<!-- EXEMPTION [BUTTON]: ... -->` và đồng nhất Design Tokens.
7. **Git & Commit**: Tuyệt đối không tự ý chạy `git commit` hay `git push`. Luôn cung cấp commit message bằng Tiếng Việt theo chuẩn Conventional Commits ở cuối báo cáo.
8. **Xác thực thực tế**: Luôn chạy build, lint, type-check thực tế trước khi báo cáo kết quả.

