# QUY ƯỚC GIT & COMMIT CONVENTIONS
### Dự án: Đông Lý Angular Admin Portal

---

## 1. Nguyên tắc An toàn Tuyệt đối
* **AI Agent TUYỆT ĐỐI KHÔNG TỰ CHẠY `git commit` HOẶC `git push`**.
* Mọi thay đổi phải được người dùng xem xét (review diff) và tự tay thực thi commit.
* Không sửa đổi file ngoài phạm vi yêu cầu (No out-of-scope refactoring).

---

## 2. Định dạng Commit Message Tiếng Việt
Tuân thủ chuẩn **Conventional Commits** với phần mô tả bằng **Tiếng Việt**:

```bash
git commit -m "<type>(<scope>): <mô tả ngắn bằng tiếng Việt>"
```

### Các loại Commit Type:
* `feat`: Thêm tính năng mới (Feature).
* `fix`: Sửa lỗi (Bug Fix).
* `refactor`: Tái cấu trúc mã nguồn không làm thay đổi hành vi bên ngoài.
* `perf`: Cải thiện hiệu năng.
* `test`: Thêm hoặc sửa đổi bài kiểm thử tự động.
* `docs`: Cập nhật tài liệu kỹ thuật.
* `style`: Thay đổi định dạng code (khoảng trắng, formatting), không ảnh hưởng logic.
* `chore`: Công việc bảo trì cấu hình, cập nhật dependency.

### Scope định danh:
* `core`: Các thay đổi hạ tầng, auth, interceptors, error handling.
* `layout`: Các thay đổi trong admin-layout, sidebar, navigation.
* `shared`: Các components, pipes, directives dùng chung.
* `users`, `trips`, `bookings`, `routes`, `vehicles`: Tên các feature module nghiệp vụ.

### Ví dụ chuẩn:
```bash
git commit -m "feat(core): thiết lập nền tảng dự án Angular 21 và danh mục thành phần tái sử dụng chuẩn Clean Code"
git commit -m "feat(users): xây dựng màn hình quản lý người dùng và gán vai trò"
git commit -m "fix(auth): sửa lỗi race-condition khi đồng thời gọi refresh token"
```
