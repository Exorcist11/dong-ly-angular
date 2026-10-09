# CẤU TRÚC THƯ MỤC CHUẨN (FOLDER STRUCTURE)
### Dự án: Đông Lý Angular Admin Portal

---

```text
Angular-FE/
├── AGENTS.md                         # Điểm bắt đầu bắt buộc cho AI Agent & Developer
├── docs/                             # Tài liệu kỹ thuật dự án
│   ├── architecture/
│   │   ├── overview.md               # Kiến trúc tổng thể và phân tầng
│   │   └── folder-structure.md       # Cấu trúc thư mục chi tiết (file này)
│   └── engineering/
│       ├── coding-standards.md       # Tiêu chuẩn lập trình TypeScript & Angular
│       ├── clean-code.md             # Nguyên tắc Clean Code & SOLID
│       ├── reusable-components.md    # Hướng dẫn tái sử dụng và mở rộng component
│       ├── testing.md                # Tiêu chuẩn Unit Testing với Vitest
│       └── git-conventions.md        # Chuẩn commit tiếng Việt & quy trình Git
├── src/
│   ├── app/
│   │   ├── core/                     # Singleton services, interceptors, guards, error-handling
│   │   │   ├── auth/                 # AuthService, TokenStorageService, auth models
│   │   │   ├── guards/               # auth.guard.ts, permission.guard.ts
│   │   │   ├── interceptors/         # auth.interceptor.ts, error.interceptor.ts
│   │   │   ├── services/             # notification.service.ts
│   │   │   ├── models/               # api-response.model.ts (Envelope)
│   │   │   └── error-handling/       # global-error-handler.ts, not-found/
│   │   ├── layouts/                  # Layouts khung ứng dụng
│   │   │   └── admin-layout/         # AdminLayoutComponent (Sidebar, Header, Toasts)
│   │   ├── shared/                   # Thành phần dùng chung (UI primitives, pipes, directives)
│   │   │   ├── components/           # page-header, loading-spinner, empty-state, stat-card, confirm-modal
│   │   │   ├── directives/           # has-permission.directive.ts
│   │   │   ├── pipes/                # currency-vnd.pipe.ts, date-vi.pipe.ts
│   │   │   └── utils/                # date-utils.ts (pure functions)
│   │   ├── features/                 # Các miền nghiệp vụ độc lập (Lazy loaded)
│   │   │   └── dashboard/            # Bàn làm việc mẫu
│   │   ├── app.component.html        # Chỉ chứa <router-outlet></router-outlet>
│   │   ├── app.component.ts          # Root component
│   │   ├── app.config.ts             # Application Providers (HttpClient, Router, ErrorHandler)
│   │   └── app.routes.ts             # Tuyến điều hướng cấp cao
│   ├── environments/                 # Cấu hình môi trường
│   │   ├── environment.ts            # Production
│   │   └── environment.development.ts# Local Development
│   ├── styles.scss                   # Design Tokens và styles toàn cục
│   ├── index.html
│   └── main.ts
├── angular.json                      # Cấu hình Angular CLI
├── package.json
└── tsconfig.json                     # Cấu hình TypeScript Strict Mode
```

---

## Nguyên tắc tổ chức:
1. **Không tạo thư mục rỗng**: Chỉ tạo thư mục khi có ít nhất một file thành phần cụ thể phục vụ mục đích rõ ràng.
2. **Feature Isolation**: Mỗi feature trong `features/` quản lý components, services, models nội bộ. Chỉ đưa ra `shared` khi có từ 2 feature trở lên sử dụng cùng một thành phần.
3. **Core Isolation**: `core` không phụ thuộc vào `features` hay `shared`.
