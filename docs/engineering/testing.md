# TIÊU CHUẨN KIỂM THỬ TỰ ĐỘNG (TESTING STANDARDS)
### Dự án: Đông Lý Angular Admin Portal

---

## 1. Công nghệ & Framework
* **Test Runner**: Vitest (tích hợp trong Angular 21, thực thi cực nhanh trên nền tảng esbuild).
* **DOM Environment**: JSDOM.
* **Lệnh thực thi**:
  ```bash
  # Chạy test một lần (CI/Verification):
  npm test -- --watch=false

  # Chạy test chế độ watch (Development):
  npm test
  ```

---

## 2. Quy tắc Viết Unit Test
1. **Kiểm thử logic, không kiểm thử framework**:
   - Tập trung vào business logic trong services, guards, pipes, utils.
   - Kiểm tra event emissions, inputs, outputs, và state transitions của components.
2. **Kiểm thử các trường hợp biên (Boundary Cases)**:
   - Giá trị `null`, `undefined`, chuỗi rỗng `""`.
   - Lỗi mạng hoặc HTTP error response.
   - Trường hợp không có quyền hạn hoặc token hết hạn.
3. **Mocking**:
   - Sử dụng `HttpTestingController` hoặc mock services để cô lập đơn vị cần kiểm thử.
   - Không gọi network thật trong unit test.
4. **Không báo cáo giả mạo kết quả**:
   - Luôn chạy lệnh `npm test -- --watch=false` trong terminal trước khi báo cáo hoàn thành.
