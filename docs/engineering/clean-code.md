# NGUYÊN TẮC CLEAN CODE & SOLID
### Dự án: Đông Lý Angular Admin Portal

---

## 1. Các Nguyên tắc Cốt lõi
* **Single Responsibility Principle (SRP)**: Mỗi component, service, utility chỉ chịu trách nhiệm cho một công việc duy nhất. Component chỉ điều phối UI; Service quản lý API và state; Utility xử lý pure logic.
* **Open/Closed Principle (OCP)**: Mở rộng component thông qua Inputs, Outputs, Content Projection (`<ng-content>`) thay vì sửa đổi phá vỡ API hiện có.
* **DRY (Don't Repeat Yourself)**: Không copy-paste logic giữa các feature. Tái sử dụng `date-utils.ts`, Pipes và Shared Components.
* **KISS (Keep It Simple, Stupid)**: Ưu tiên giải pháp đơn giản nhất đáp ứng đúng yêu cầu.
* **YAGNI (You Aren't Gonna Need It)**: Không viết abstraction hoặc hàm tiện ích trước khi thực sự có nhu cầu sử dụng.

---

## 2. Tiêu chuẩn Hàm và Lớp
* **Hàm ngắn gọn, có chủ đích**: Mỗi hàm chỉ làm 1 việc và đặt tên thể hiện rõ mục đích.
* **Early Return**: Sử dụng early return để giảm độ sâu của các tầng `if/else` lồng nhau:
  ```typescript
  // Khuyến nghị:
  if (!accessToken) {
    this._currentUser.set(null);
    return throwError(() => new Error('Chưa đăng nhập'));
  }
  return this.http.get(...);
  ```
* **Không dùng boolean flags để gộp nhiều trách nhiệm**: Tránh tạo hàm `processUser(user, isDelete, isExport, isSendMail)`. Hãy tách thành các hàm riêng biệt.
* **Không để lại dead code**: Xóa sạch console.log debug, biến không dùng, và import thừa trước khi hoàn thành task.
