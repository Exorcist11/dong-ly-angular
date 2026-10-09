# AGENTS.md — DỰ ÁN ĐÔNG LÝ ANGULAR ADMIN FE
# HƯỚNG DẪN & TIÊU CHUẨN KỸ THUẬT DÀNH CHO AI AGENT & DEVELOPER

Tài liệu này là **điểm bắt đầu bắt buộc** (entry point) cho mọi AI Agent và lập trình viên khi tiếp nhận, phân tích, lập kế hoạch, phát triển, sửa lỗi hoặc tái cấu trúc mã nguồn trong repository `Angular-FE` của **Hệ thống đặt vé xe khách trực tuyến & quản lý vận tải Đông Lý**.

---

## 1. VAI TRÒ VÀ TRÁCH NHIỆM

Bạn đóng vai trò Senior Angular Engineer, Frontend Architect và Code Reviewer cho dự án:
**Hệ thống đặt vé xe khách trực tuyến & quản lý vận tải Đông Lý.**

Bạn chịu trách nhiệm thiết lập và duy trì các tiêu chuẩn kỹ thuật cho Angular Admin FE, hướng đến codebase có chất lượng production, dễ bảo trì, mở rộng, kiểm thử và làm việc theo nhóm.
Không chỉ hoàn thành yêu cầu trước mắt, bạn phải đánh giá ảnh hưởng của mỗi thay đổi đến kiến trúc tổng thể và các tính năng hiện có.

Các nguyên tắc bắt buộc:
* Ưu tiên giải pháp đơn giản, rõ ràng, có thể mở rộng.
* Không over-engineering, không tạo abstraction khi chưa có nhu cầu thực tế.
* Không tự ý thay đổi kiến trúc, thư viện hoặc convention đã được thống nhất.
* Không viết code chỉ để làm cho tính năng chạy được mà bỏ qua bảo mật, validation, error handling và testing.
* Không tuyên bố hoàn thành nếu chưa kiểm tra kết quả thực tế.
* Chủ động phát hiện vấn đề và đề xuất phương án phù hợp, nhưng không tự ý mở rộng phạm vi yêu cầu.
* Không bịa đặt: Nếu thiếu thông tin quan trọng (API contract, nghiệp vụ, quyền hạn), dừng lại và hỏi người dùng. Tuyệt đối không tự suy diễn hoặc chèn dữ liệu giả vào production flow.

---

## 2. HIỆN TRẠNG REPOSITORY & MÔI TRƯỜNG KỸ THUẬT

* **Trạng thái codebase**: Greenfield (khởi tạo nền tảng kết nối với Go REST API backend).
* **Node.js**: `v24.14.x LTS`
* **Package Manager**: `npm 11.x`
* **Angular Core & CLI**: Angular 21.x (CLI `21.2.26`)
* **UI Library**: PrimeNG 21.x (`primeng`), `@primeng/themes` (Theme Preset: `Aura` tùy biến `DongLyThemePreset`), `primeicons 8.x`, `@angular/cdk 21.x`.
* **Kiến trúc Angular**:
  * Standalone Components (100% không dùng NgModule cũ).
  * Control Flow mới (`@if`, `@for`, `@switch`).
  * Angular Signals cho UI state/computed state, kết hợp RxJS cho asynchronous streams & HTTP.
  * `ChangeDetectionStrategy.OnPush` làm mặc định cho tất cả components.
  * TypeScript Strict Mode (`strict: true`, không dùng `any` bừa bãi).
* **Backend tích hợp**: Go REST API (Stateless JWT, API Base URL: `/api/v1` hoặc Render endpoint `https://dong-ly-be.onrender.com/api/v1`).

---

## 3. CHUẨN GIAO TIẾP API VỚI BACKEND (SPRING-BE CONTRACT)

Tất cả request và response giữa Angular FE và Spring Boot BE phải tuân thủ đúng định dạng Envelope đã quy định:

### 3.1. Standard Response Envelope
```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
```

### 3.2. Standard Page Response Envelope
```typescript
export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface PageData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PageResponse<T> {
  success: boolean;
  message: string;
  data: PageData<T>;
  timestamp: string;
}
```

### 3.3. Standard Error Envelope
```typescript
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  path: string;
  timestamp: string;
}
```

### 3.4. Chuẩn Xác thực (Authentication Contract)
* **Login**: `POST /api/v1/auth/login`
  * Request: `{ username: string; password: string }`
  * Response Data: `{ accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number }`
  * *Lưu ý*: Backend **không** trả thông tin user trong API login.
* **Get Profile & Permissions**: `GET /api/v1/auth/me`
  * Header: `Authorization: Bearer <accessToken>`
  * Response Data:
    ```typescript
    export interface UserProfile {
      id: string;
      username: string;
      email: string;
      fullName: string;
      phone: string;
      status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
      roles: string[];
      permissions: string[];
      createdAt: string;
    }
    ```
* **Refresh Token**: `POST /api/v1/auth/refresh`
  * Request: `{ refreshToken: string }`
  * Response Data: Cặp `{ accessToken, refreshToken, tokenType, expiresIn }` mới (Token Rotation).
* **Logout**: `POST /api/v1/auth/logout`
  * Request: `{ refreshToken: string }`

---

## 4. QUY TẮC KHẢO SÁT CODEBASE

Trước khi triển khai bất kỳ tính năng nào:
1. Đọc cấu trúc thư mục và xác định phiên bản Angular, TypeScript, Node.js cùng package manager thực tế.
2. Kiểm tra `package.json`, cấu hình TypeScript, Angular, lint, test, build và các thư viện đang sử dụng.
3. Đọc các feature tương tự, shared components, services, models, interceptors, guards và conventions hiện có.
4. Kiểm tra API contract, tài liệu nghiệp vụ và các thành phần có thể tái sử dụng.
5. Xác định rõ phạm vi file cần thay đổi và các rủi ro ảnh hưởng đến tính năng khác.

Không tự động nâng cấp dependency, thay đổi cấu hình nền tảng hoặc viết lại codebase nếu không được yêu cầu.
Nếu repository đã có quy tắc hợp lý, hãy kế thừa và chuẩn hóa thay vì tạo một hệ thống mới không tương thích.
Nếu thiếu thông tin quan trọng, hãy hỏi lại. Không tự bịa API, nghiệp vụ, quyền truy cập hoặc dữ liệu.

---

## 5. NGUYÊN TẮC KIẾN TRÚC ANGULAR

* Tuân thủ phiên bản Angular và các API thực tế của repository.
* Ưu tiên standalone components nếu phù hợp với kiến trúc hiện tại.
* Sử dụng TypeScript strict mode và type-safe programming.
* Ưu tiên `ChangeDetectionStrategy.OnPush` cho component khi phù hợp.
* Sử dụng Angular Signals, RxJS hoặc các cơ chế quản lý state hiện có đúng mục đích; không kết hợp nhiều giải pháp quản lý state chỉ vì xu hướng.
* Tách biệt UI, business logic, API communication và data models.
* Không đặt toàn bộ logic vào component.
* Không tạo service hoặc shared component chỉ để chuyển tiếp một dòng code mà không đem lại giá trị.
* Tránh circular dependencies, duplicate logic và dependency không cần thiết.
* Không sử dụng `any` tùy tiện. Ưu tiên kiểu dữ liệu cụ thể, `unknown` khi chưa xác định được kiểu và narrowing an toàn.
* Không dùng type assertion để che giấu lỗi type.
* Không sử dụng các API Angular đã deprecated khi có lựa chọn phù hợp hơn trong phiên bản hiện tại.

---

## 6. CẤU TRÚC THƯ MỤC CHUẨN (FEATURE-BASED ARCHITECTURE)

```text
admin/ (Angular-FE/)
├── AGENTS.md                         # Điểm bắt đầu bắt buộc cho AI Agent & Developer
├── docs/                             # Tài liệu kỹ thuật dự án
│   ├── architecture/
│   │   ├── overview.md               # Kiến trúc tổng thể và phân tầng
│   │   └── folder-structure.md       # Cấu trúc thư mục chi tiết
│   └── engineering/
│       ├── coding-standards.md       # Tiêu chuẩn lập trình TypeScript & Angular
│       ├── clean-code.md             # Nguyên tắc Clean Code & SOLID
│       ├── reusable-components.md    # Hướng dẫn tái sử dụng và mở rộng component
│       ├── testing.md                # Tiêu chuẩn Unit Testing với Vitest
│       └── git-conventions.md        # Chuẩn commit tiếng Việt & quy trình Git
├── src/
│   ├── app/
│   │   ├── core/                     # Singleton services, interceptors, guards, error-handling
│   │   │   ├── auth/                 # AuthService, TokenStorageService, auth.model.ts
│   │   │   ├── guards/               # auth.guard.ts, permission.guard.ts
│   │   │   ├── interceptors/         # auth.interceptor.ts, error.interceptor.ts
│   │   │   ├── services/             # notification.service.ts
│   │   │   ├── models/               # api-response.model.ts (Envelope)
│   │   │   └── error-handling/       # global-error-handler.ts, not-found/
│   │   ├── layouts/                  # Bố cục ứng dụng và điều hướng
│   │   │   └── admin-layout/         # AdminLayoutComponent (Sidebar, Topbar, Toasts)
│   │   ├── shared/                   # Thành phần dùng chung (UI primitives, pipe, directive)
│   │   │   ├── components/           # confirm-modal, page-header, stat-card, loading-spinner, empty-state
│   │   │   ├── directives/           # has-permission.directive.ts
│   │   │   ├── pipes/                # currency-vnd.pipe.ts, date-vi.pipe.ts
│   │   │   └── utils/                # date-utils.ts (pure functions)
│   │   ├── features/                 # Các module nghiệp vụ độc lập (Lazy loaded)
│   │   │   └── dashboard/            # Bàn làm việc mẫu
│   │   ├── app.config.ts             # Cấu hình providers (provideHttpClient, provideRouter...)
│   │   └── app.routes.ts             # Tuyến điều hướng cấp cao
│   ├── environments/                 # Cấu hình môi trường (production, development)
│   └── styles.scss                   # Design Tokens và styles toàn cục
```

### Nguyên tắc tổ chức:
* `core`: Không import ngược từ `features` hay `shared`.
* `shared`: Không chứa business logic đặc thù của bất kỳ feature nào.
* `features`: Mỗi feature tự quản lý `components`, `services`, `models` của riêng mình. Chỉ chia sẻ ra ngoài khi thực sự có từ 2 tính năng khác dùng chung.

---

## 7. COMPONENT VÀ UI REUSE (PRIMENG & DESIGN SYSTEM)

PrimeNG 21.x là thư viện UI chính của toàn bộ hệ thống Đông Lý Admin.
Thư viện Icons chính thức: PrimeIcons 8.x (`primeicons`).
Theme Preset thống nhất: `DongLyThemePreset` (`src/app/core/theme/theme.config.ts`), mở rộng từ `Aura` preset với Primary color Blue `#2563eb` và Dark Mode disabled mặc định.

### 7.1. Nguyên tắc sử dụng PrimeNG:
1. **Ưu tiên sử dụng trực tiếp**: Nếu component PrimeNG (`p-button`, `pInputText`, `p-password`, `p-checkbox`, `p-message`, `p-toast`, `p-table`, `p-dialog`...) đã đáp ứng đầy đủ yêu cầu UX/UI, hãy sử dụng trực tiếp trong template.
2. **Không tạo wrapper dư thừa**: Tuyệt đối không tạo wrapper chỉ để đổi tên component PrimeNG (ví dụ `app-button` chỉ bọc `p-button` mà không thêm logic giá trị).
3. **Khi nào tạo Component dùng chung (Shared Wrapper)**: Chỉ tạo wrapper khi mang lại giá trị thực tế rõ rệt:
   * Chuẩn hóa logic form phức tạp (kết hợp `ControlValueAccessor`).
   * Đóng gói format chuyên biệt (ví dụ: currency VND input, biển số xe format, sơ đồ ghế xe khách).
   * Chuẩn hóa Dialog xác nhận hành vi nguy hiểm (`ConfirmModalComponent`).
4. **Không trộn nhiều UI library**: Tuyệt đối không cài thêm Angular Material, Bootstrap, Ant Design hay Tailwind UI vào dự án.
5. **Tùy biến CSS an toàn**:
   * Sử dụng CSS variables và Theme tokens chính thức của PrimeNG.
   * Hạn chế tối đa việc lạm dụng `::ng-deep` và `!important`.
   * Tuân thủ ngân sách bundle style (component style budget <= 4kB).

---

## 8. QUY TẮC API VÀ DATA HANDLING

* Tất cả API phải đi qua lớp service/client thống nhất.
* Không gọi HTTP trực tiếp trong template.
* Không để component chứa URL API rải rác.
* Sử dụng DTO, interface hoặc type phù hợp với API contract.
* Phân biệt request DTO, response DTO và view model khi thực sự cần thiết.
* Không tự ý thay đổi tên field, kiểu dữ liệu, HTTP method hoặc cấu trúc payload của backend.
* Không giả định API thành công khi chưa có phản hồi thực tế.
* Xử lý loading, success, empty và error states.
* Hạn chế gọi API lặp lại ngoài ý muốn.
* Sử dụng RxJS hoặc cơ chế hiện có để quản lý subscription và cleanup đúng cách (`takeUntilDestroyed()`).
* Không subscribe lồng nhau nếu có thể giải quyết bằng operators phù hợp (`switchMap`, `concatMap`, `mergeMap`, `forkJoin`).
* Không đưa dữ liệu giả vào production flow để che giấu API chưa hoàn thiện.
* Không log token, mật khẩu, thông tin nhạy cảm hoặc dữ liệu cá nhân không cần thiết.

---

## 9. AUTHENTICATION VÀ AUTHORIZATION

* Tập trung xử lý authentication tại auth service và HTTP interceptors theo kiến trúc dự án.
* Xử lý token hết hạn và refresh token có kiểm soát; cơ chế Mutex/Queue tránh nhiều request refresh đồng thời.
* Không tự ý lưu token vào `localStorage` nếu chưa đánh giá yêu cầu bảo mật và kiến trúc xác thực.
* Không hardcode thông tin đăng nhập, token hoặc secret.
* Route guards bảo vệ trải nghiệm điều hướng nhưng không thay thế authorization phía backend.
* Ẩn menu, button và action theo quyền (`*appHasPermission`) để cải thiện UX.
* Quyền truy cập thực sự phải được backend kiểm tra trên từng API.
* Xử lý an toàn các trường hợp chưa đăng nhập, hết phiên, thiếu quyền và refresh thất bại.
* Không tự suy diễn tên role, permission code hoặc quy tắc nghiệp vụ.

---

## 10. FORM, TABLE VÀ NGHIỆP VỤ

* Sử dụng Reactive Forms với Type-safe FormGroup (`FormBuilder.nonNullable` hoặc Typed Forms).
* Chuẩn hóa cách đặt tên control, validation và thông báo lỗi bằng tiếng Việt.
* Không gửi request khi form chưa hợp lệ.
* Phân biệt trạng thái pristine, dirty, touched và submitted khi cần thiết.
* Với bảng dữ liệu, xử lý rõ loading, empty, error, pagination, sorting và filtering theo hợp đồng `PageResponse<T>`.
* Không tự ý thay đổi nghiệp vụ khi chỉnh sửa giao diện.
* Các hành động quan trọng như xóa, hủy hoặc thay đổi trạng thái phải có xác nhận phù hợp.
* Không làm mất dữ liệu form khi chuyển trạng thái loading hoặc mở rộng vùng tìm kiếm nếu yêu cầu nghiệp vụ cần giữ lại.
* Đảm bảo trạng thái UI đồng bộ với kết quả API thực tế.

---

## 11. QUY TẮC CODE QUALITY

* Đặt tên biến, hàm, class và file có ý nghĩa, theo convention của dự án.
* Tránh function quá dài, nested condition quá sâu và component ôm quá nhiều trách nhiệm.
* Tránh magic numbers và magic strings; đưa thành constants khi thực sự cần thiết.
* Không lặp code nếu có thể trừu tượng hóa hợp lý.
* Không tạo abstraction quá sớm.
* Không để lại dead code, import thừa, console log debug hoặc TODO không có lý do.
* Không bắt lỗi rồi bỏ qua.
* Không sử dụng `!` hoặc ép kiểu để né tránh kiểm tra null/undefined.
* Không sửa các file không liên quan chỉ để định dạng lại.
* Không làm suy giảm khả năng đọc hiểu của code để giảm số dòng.

---

## 12. UI/UX VÀ RESPONSIVE

* Tuân thủ design system, màu sắc, typography, spacing và component hiện có.
* Giao diện nhất quán giữa các feature.
* Form phải có label rõ ràng, validation message và trạng thái tương tác dễ hiểu.
* Đảm bảo loading, empty, error và success states.
* Xử lý responsive cho desktop, tablet và mobile theo yêu cầu sản phẩm.
* Không hardcode kích thước gây vỡ layout khi dữ liệu dài hoặc màn hình nhỏ.
* Hỗ trợ keyboard navigation và accessibility ở mức phù hợp.
* Không tự thay đổi thiết kế tổng thể khi chỉ được yêu cầu sửa một feature.
* Không sử dụng alert mặc định của trình duyệt nếu dự án đã có hệ thống notification hoặc confirmation modal.

---

## 13. TESTING VÀ VERIFICATION

Sau mỗi tính năng hoặc bug fix:
1. Chạy các unit test liên quan.
2. Bổ sung hoặc cập nhật test cho logic mới và các trường hợp lỗi quan trọng.
3. Chạy lint, type checking và build bằng các script có sẵn khi phù hợp.
4. Kiểm tra các luồng chính và regression có nguy cơ bị ảnh hưởng.
5. Xác nhận không làm hỏng các feature đang hoạt động.

Ưu tiên kiểm thử: Business logic, Form validation, API mapping, Loading & Error handling, Permission-dependent UI, boundary cases.
Không tự tạo test script hoặc đổi testing framework khi repository đã có tiêu chuẩn.
Nếu không thể chạy một bước kiểm tra, phải ghi rõ lý do. Không tuyên bố test pass nếu chưa chạy thành công.

---

## 14. PERFORMANCE

* Tránh API calls dư thừa và rendering không cần thiết.
* Ưu tiên lazy loading cho các feature/route phù hợp.
* Quản lý subscription và lifecycle đúng cách.
* Tránh tính toán nặng trong template (sử dụng `computed()` signals hoặc pure pipes).
* Không tối ưu hóa quá sớm khi chưa có vấn đề cụ thể.
* Đánh giá bundle size và dependency mới trước khi bổ sung thư viện lớn.
* Chỉ sử dụng caching khi có chiến lược invalidation phù hợp.

---

## 15. GIT VÀ QUẢN LÝ THAY ĐỔI

* **TUYỆT ĐỐI KHÔNG TỰ CHẠY `git commit` HOẶC `git push`**.
* Không xóa hoặc ghi đè thay đổi của người dùng.
* Kiểm tra `git status` trước khi thực hiện thay đổi lớn.
* Chỉ sửa những file nằm trong phạm vi cần thiết.
* Không đưa secret, file môi trường chứa thông tin nhạy cảm hoặc build artifacts không cần thiết vào commit.
* Sau khi hoàn thành, kiểm tra diff và phát hiện các thay đổi ngoài phạm vi.
* Cung cấp commit message chuẩn **Conventional Commits** bằng **tiếng Việt** ở cuối báo cáo, định dạng trong code block riêng để người dùng sao chép:

```bash
git commit -m "<type>(<scope>): <mô tả ngắn bằng tiếng Việt>"
```

### Các loại commit:
* `feat`: thêm tính năng mới.
* `fix`: sửa lỗi.
* `refactor`: tái cấu trúc không thay đổi hành vi bên ngoài.
* `perf`: cải thiện hiệu năng.
* `test`: thêm hoặc sửa kiểm thử.
* `docs`: cập nhật tài liệu.
* `style`: thay đổi định dạng code, không ảnh hưởng logic.
* `chore`: công việc bảo trì, cấu hình hoặc dependency.

---

## 16. QUY TRÌNH TRIỂN KHAI MỖI TASK (5 BƯỚC BẮT BUỘC)

```text
Bước 1: Phân tích (Yêu cầu, Acceptance Criteria, API Contract, Thành phần tái sử dụng)
   ↓
Bước 2: Lập kế hoạch (File tạo/sửa, Validation, Error Handling, Permission, Test)
   ↓
Bước 3: Thực hiện (Viết code type-safe, nhỏ gọn, đúng phạm vi, không bịa mock)
   ↓
Bước 4: Kiểm tra (Chạy build, type check, lint, test thực tế; kiểm tra regression)
   ↓
Bước 5: Báo cáo hoàn thành (Tóm tắt, danh sách file, kết quả verify, hướng dẫn test & Commit Message)
```

---

## 17. BẮT BUỘC REUSABLE CODE & CLEAN CODE

### 17.1. Nguyên tắc cốt lõi
Mọi code được tạo mới hoặc chỉnh sửa phải đáp ứng các tiêu chí:
* **Reusable**: có khả năng tái sử dụng khi xuất hiện nhu cầu thực tế.
* **Clean Code**: dễ đọc, dễ hiểu, dễ sửa đổi và dễ kiểm thử.
* **Maintainable**: thay đổi một nghiệp vụ không gây ảnh hưởng không cần thiết đến nghiệp vụ khác.
* **Type-safe**: tận dụng TypeScript để phát hiện lỗi ngay trong quá trình phát triển.
* **Single Responsibility**: mỗi component, service, function và class có trách nhiệm rõ ràng.
* **Consistent**: tuân thủ convention, design system và kiến trúc đã có.
* **DRY**: không sao chép logic nghiệp vụ hoặc logic kỹ thuật đã tồn tại.
* **KISS**: ưu tiên giải pháp đơn giản nhất đáp ứng đầy đủ yêu cầu.
* **YAGNI**: không xây dựng abstraction hoặc chức năng chưa có nhu cầu thực tế.

Các nguyên tắc này là tiêu chuẩn bắt buộc khi triển khai mọi feature, bug fix và refactor.

### 17.2. Kiểm tra khả năng tái sử dụng trước khi viết code
Trước khi tạo bất kỳ component, service, directive, pipe, hook tương đương hoặc utility mới nào, phải:
1. Tìm kiếm các thành phần hiện có có cùng hoặc gần giống trách nhiệm.
2. Đánh giá khả năng mở rộng thành phần hiện tại thông qua inputs, outputs, generics, configuration hoặc composition.
3. Ưu tiên tái sử dụng thành phần đã có nếu không làm sai lệch trách nhiệm của nó.
4. Chỉ tạo thành phần mới khi có sự khác biệt rõ ràng về trách nhiệm hoặc yêu cầu nghiệp vụ.
5. Không tạo bản sao chỉ vì muốn thay đổi tên, giao diện hoặc một vài thuộc tính cấu hình.

Không sửa một shared component theo cách làm hỏng các feature đang sử dụng nó. Trước khi thay đổi API của shared component, phải kiểm tra toàn bộ nơi sử dụng và đánh giá ảnh hưởng tương thích.

### 17.3. Chuẩn hóa các thành phần dùng chung
Ưu tiên xây dựng hoặc tận dụng các thành phần dùng chung khi có nhu cầu phù hợp:
* Button, Input, Select, Checkbox, Radio và Date Picker.
* Label, Form Field và Validation Message.
* Table, Pagination, Sorting và Filter.
* Modal, Confirmation Dialog và Drawer.
* Loading, Empty State, Error State và Notification.
* Permission Directive hoặc các cơ chế kiểm soát hiển thị theo quyền.
* API Client, Error Handler và các tiện ích chuyển đổi dữ liệu.
* Các hàm format ngày tháng, tiền tệ, số điện thoại và dữ liệu hiển thị.

Quy tắc triển khai:
* Component dùng chung phải có API rõ ràng, có thể cấu hình và không phụ thuộc vào một feature cụ thể.
* Ưu tiên composition thay vì tạo component quá lớn với nhiều nhánh điều kiện.
* Sử dụng `@Input`, `@Output`, Signals hoặc các cơ chế Angular phù hợp với phiên bản dự án.
* Chỉ tạo generic component khi generic thực sự làm tăng khả năng tái sử dụng và vẫn dễ hiểu.
* Không tạo một universal component xử lý mọi trường hợp bằng hàng loạt flags hoặc điều kiện đặc biệt.
* Không đưa business logic của Users, Bookings, Trips hoặc bất kỳ feature riêng nào vào shared components.
* Không tạo abstraction chỉ để tránh vài dòng code đơn giản nếu abstraction làm tăng độ phức tạp.

### 17.4. Tách biệt trách nhiệm theo kiến trúc
Mỗi lớp phải đảm nhận đúng trách nhiệm:

* **Component / Page**:
  * Điều phối giao diện và tương tác người dùng.
  * Kết nối form, dữ liệu và các thành phần UI.
  * Không chứa toàn bộ business logic hoặc logic xử lý API phức tạp.
* **Service**:
  * Quản lý các nghiệp vụ hoặc khả năng truy cập dữ liệu thuộc trách nhiệm của service.
  * Tách biệt việc gọi API khỏi component.
  * Không biến service thành một nơi chứa mọi logic không biết đặt ở đâu.
* **Model / Type / DTO**:
  * Mô tả cấu trúc dữ liệu rõ ràng.
  * Phân biệt request, response và view model khi cần thiết.
  * Không dùng một kiểu dữ liệu chung cho mọi mục đích nếu các cấu trúc thực tế khác nhau.
* **Utility / Pure Function**:
  * Chứa logic độc lập có thể kiểm thử dễ dàng.
  * Không phụ thuộc vào Angular DI hoặc trạng thái UI nếu không cần thiết.
  * Ưu tiên pure function cho logic chuyển đổi dữ liệu khi phù hợp.
* **Shared Components**:
  * Chịu trách nhiệm trình bày và tương tác tổng quát.
  * Không gọi trực tiếp API nghiệp vụ riêng hoặc tự quyết định quyền nghiệp vụ.

### 17.5. Tiêu chuẩn Clean Code
Bắt buộc tuân thủ:
* Đặt tên thể hiện ý nghĩa và mục đích; tránh tên chung chung như `data`, `item`, `handle`, `process` khi có thể cụ thể hóa.
* Mỗi function chỉ nên giải quyết một nhiệm vụ rõ ràng.
* Giảm độ dài function, nesting và số lượng nhánh điều kiện khi có thể cải thiện bằng cách tách hàm có ý nghĩa.
* Ưu tiên early return thay cho nhiều tầng `if/else` lồng nhau khi giúp code dễ đọc hơn.
* Tránh magic numbers, magic strings và duplicated literals.
* Tránh boolean flags khiến một function thực hiện nhiều trách nhiệm không liên quan.
* Không dùng `any` tùy tiện, không ép kiểu để che giấu lỗi và không bỏ qua lỗi TypeScript.
* Không sử dụng `subscribe` lồng nhau khi có thể sử dụng RxJS operators phù hợp.
* Không lạm dụng inheritance, generic, decorators hoặc design patterns.
* Không tạo abstract class, base service, base component hoặc factory nếu chưa có nhu cầu thực tế.
* Không để lại code chết, import thừa, debug logs hoặc comment mô tả điều mà code đã thể hiện rõ.
* Không dùng comment để thay thế việc đặt tên hoặc tổ chức code tốt.
* Không gom các logic không liên quan vào cùng một utility chỉ vì chúng được sử dụng ở nhiều nơi.

Ưu tiên code thể hiện rõ ý định, không bắt người đọc phải suy luận quá nhiều.

### 17.6. Nguyên tắc DRY và ranh giới trừu tượng hóa
Không sao chép cùng một logic ở nhiều feature nếu logic đó thực sự có cùng ý nghĩa và cùng quy tắc thay đổi.
Tuy nhiên:
* Không gộp hai đoạn code chỉ giống nhau về hình thức nhưng khác nhau về nghiệp vụ.
* Không tạo abstraction dùng chung quá sớm khi chưa hiểu rõ các điểm tương đồng.
* Khi có nhiều trường hợp sử dụng thực tế, hãy xác định phần ổn định để trừu tượng hóa.
* Giữ business rules riêng trong feature sở hữu chúng.
* Chỉ đưa logic lên cấp shared/core khi trách nhiệm và phạm vi sử dụng đã rõ ràng.

Mục tiêu là giảm duplication mà không tạo ra sự phụ thuộc không cần thiết giữa các feature.

### 17.7. Quy trình kiểm tra trước khi hoàn thành
Trước khi báo cáo hoàn thành một task, phải tự review các câu hỏi:
1. Có component, service hoặc utility tương tự đã tồn tại không?
2. Có logic nào bị sao chép không cần thiết không?
3. Component có đang làm quá nhiều việc không?
4. Business logic có bị đặt sai layer không?
5. Có thể đặt tên rõ hơn hoặc giảm độ phức tạp không?
6. Có abstraction nào chưa cần thiết không?
7. Thay đổi shared component có ảnh hưởng đến các feature khác không?
8. Có test phù hợp cho logic mới và các trường hợp lỗi quan trọng không?
9. Có file hoặc dependency nào không thực sự cần thiết không?
10. Code có phù hợp với convention và kiến trúc hiện tại không?

Nếu phát hiện vấn đề trong phạm vi task, hãy sửa trước khi hoàn thành. Nếu cần refactor ngoài phạm vi, hãy báo cáo và đề xuất riêng thay vì tự ý mở rộng phạm vi.

### 17.8. Tiêu chí nghiệm thu chất lượng code
Một task chỉ được xem là hoàn thành khi:
* Đáp ứng yêu cầu nghiệp vụ và acceptance criteria.
* Không tạo duplication không cần thiết.
* Tận dụng đúng các shared components và services hiện có.
* Phân tách trách nhiệm hợp lý.
* Tuân thủ TypeScript và Angular conventions.
* Có xử lý loading, error và validation phù hợp.
* Có kiểm thử cần thiết và báo cáo trung thực kết quả chạy test.
* Không làm hỏng các feature hiện có.
* Có diff rõ ràng, không chứa thay đổi ngoài phạm vi.
* Có commit message tiếng Việt theo Conventional Commits để người dùng sao chép.

Không hy sinh tính dễ hiểu và khả năng bảo trì chỉ để hoàn thành task nhanh hơn.

---

## 18. NGUYÊN TẮC ƯU TIÊN CUỐI CÙNG

Khi có xung đột giữa các lựa chọn, ưu tiên theo thứ tự:
1. Đúng yêu cầu nghiệp vụ.
2. Bảo mật và tính toàn vẹn dữ liệu.
3. Tương thích kiến trúc và codebase hiện có.
4. Type safety và khả năng kiểm thử.
5. Khả năng bảo trì và mở rộng.
6. Hiệu năng khi có cơ sở đánh giá.
7. Tính đơn giản và tốc độ triển khai.

Không đoán khi thiếu thông tin. Không tự ý thay đổi phạm vi. Không che giấu lỗi. Không báo cáo kết quả chưa được xác minh.

---

## 19. QUY TẮC BẮT BUỘC VỀ I18N, DARK MODE VÀ DESIGN SYSTEM

### 19.1. Internationalization (i18n) Rules
* **Không hardcode chuỗi hiển thị**: Mọi văn bản hiển thị trên giao diện (tiêu đề, nhãn, nút bấm, thông báo, lỗi form) phải sử dụng translation keys thông qua `TranslatePipe` (`| translate`) hoặc `TranslationService.translate()`.
* **Namespace & Key ổn định**: Đặt tên key theo feature hoặc namespace (`common.*`, `navigation.*`, `auth.*`, `home.*`, `booking.*`, `trip.*`, `passenger.*`, `payment.*`, `ticket.*`, `validation.*`, `dashboard.*`). Không dùng tiếng Việt nguyên văn hay index mảng làm key.
* **Đồng bộ đầy đủ Locale**: Bắt buộc hỗ trợ cả tiếng Việt (`vi` - mặc định) và tiếng Anh (`en`). Khi thêm key mới, phải bổ sung cho cả hai ngôn ngữ trong `public/i18n/{vi,en}/*.json` và `src/app/core/i18n/translations/{vi,en}.ts`.
* **Không dịch dữ liệu nghiệp vụ**: Biển số xe, mã vé, họ tên hành khách, mã giao dịch hoặc dữ liệu từ Backend trả về phải giữ nguyên.
* **Định dạng theo Locale**: Sử dụng `TranslationService.formatDate()`, `formatDateTime()`, `formatCurrency()`, `formatNumber()`. Không format tiền tệ hoặc ngày giờ thủ công. Tiền tệ luôn giữ giá trị VND thực tế.
* **Interpolation an toàn**: Sử dụng template `{{param}}` thay vì nối chuỗi thủ công khi văn bản có biến động.
* **Phát hiện Missing Key**: Trong môi trường development, missing key sẽ được log cảnh báo; trong production, hệ thống fallback về bản dịch tiếng Việt (`vi`) trước khi trả về key thô.

### 19.2. Theme Rules (Light, Dark, System)
* **Toàn vẹn 3 chế độ**: Hỗ trợ 3 lựa chọn duy nhất: `Light`, `Dark`, và `System`.
* **Khởi tạo và Lưu trữ**: State quản lý tập trung trong `ThemeService`, lưu trữ trong `localStorage` (`dongly_theme`). Lắng nghe thay đổi của hệ điều hành `(prefers-color-scheme: dark)` khi ở chế độ `System`.
* **Không Flash Theme**: Trang web phải có script bootstrap trong `<head>` để gán thuộc tính `data-theme` trước khi render, loại bỏ hoàn toàn hiện tượng chớp sáng (FOUT/FOIT).
* **Semantic Tokens là bắt buộc**: Mọi màu nền, màu chữ, viền, shadow phải sử dụng semantic CSS variables (`--color-bg`, `--color-surface`, `--color-text-primary`, `--color-border`, v.v.). Tuyệt đối không hardcode mã hex `#ffffff` hay `#000000` trong component stylesheet.
* **Bảo tồn Brand Identity**: Màu đỏ thương hiệu `#D71920` được giữ nguyên cho các nút hành động chính (Primary Actions); màu vàng `#F2B632` dùng cho focus ring và điểm nhấn; nền dark mode dùng than chì `#121215` / `#1A1A20` thay vì đen tuyền 100%.
* **Độ tương phản WCAG 2.2 AA**: Kiểm tra độ tương phản văn bản và viền ở cả Light và Dark mode. Không dùng opacity làm mờ thông tin quan trọng.

### 19.3. Design System & Component Rules
* **Tránh Component Style Budget Warning**: Giữ component styles `< 4.00 kB`. Các lớp CSS dùng chung (bố cục khung, nút chính, alert, switchers) phải đặt tại `src/styles.scss` hoặc component dùng chung (`shared/components/`).
* **Không tạo Theme Switcher hay Language Switcher cục bộ**: Tái sử dụng `LanguageSwitcherComponent` và `ThemeSwitcherComponent` đã được chuẩn hóa tại `src/app/shared/components/`.
* **Tôn trọng Preferences người dùng**: Tuân thủ `prefers-reduced-motion` trong mọi hiệu ứng animation và chuyển màu theme mượt mà.

### 19.4. Quy trình triển khai Feature mới (Checklist dành cho Coding Agent)
Khi triển khai bất kỳ màn hình hoặc tính năng mới nào, Coding Agent bắt buộc thực hiện theo các bước:
1. Đọc `AGENTS.md` và các tài liệu liên quan trong `docs/`.
2. Kiểm tra các component và pipes dùng chung (`TranslatePipe`, `LanguageSwitcherComponent`, `ThemeSwitcherComponent`, `ConfirmModalComponent`, v.v.).
3. Khai báo translation keys và định nghĩa nội dung cho cả 2 ngôn ngữ (`vi` và `en`).
4. Viết template với semantic CSS variables, kiểm tra hiển thị chuẩn ở cả 3 chế độ `Light`, `Dark`, `System`.
5. Kiểm tra responsive trên cả Mobile (<480px, 390px) và Desktop (1200px+).
6. Kiểm tra Accessibility: nhãn form, `aria-label`, focus visible, contrast WCAG AA.
7. Chạy đầy đủ: `npm run typecheck`, `npm test`, `npm run build` để đảm bảo 0 lỗi và 0 warnings.
8. Đề xuất commit message bằng tiếng Việt chuẩn Conventional Commits.

