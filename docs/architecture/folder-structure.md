# CẤU TRÚC THƯ MỤC CHUẨN (FOLDER STRUCTURE)
### Dự án: Đông Lý Angular Admin Portal

---

```text
Angular-FE/
├── AGENTS.md                         # Điểm bắt đầu bắt buộc cho AI Agent & Developer
├── docs/                             # Tài liệu kỹ thuật dự án
│   ├── architecture/
│   │   ├── overview.md               # Kiến trúc tổng thể và phân tầng
│   │   ├── folder-structure.md       # Cấu trúc thư mục chi tiết (file này)
│   │   └── shared-ui-guidelines.md   # Quy chuẩn kiến trúc Shared UI Components
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
│   │   │   ├── guards/               # auth.guard.ts, permission.guard.ts, guest.guard.ts
│   │   │   ├── interceptors/         # auth.interceptor.ts, error.interceptor.ts
│   │   │   ├── services/             # notification.service.ts
│   │   │   ├── models/               # api-response.model.ts (Envelope)
│   │   │   ├── theme/                # theme.config.ts, theme.service.ts
│   │   │   ├── i18n/                 # translation.service.ts, translations/
│   │   │   └── error-handling/       # global-error-handler.ts, not-found/
│   │   ├── layout/                   # Bố cục ứng dụng đang hoạt động (LayoutShellComponent, Topbar, Sidebar)
│   │   ├── shared/                   # Thành phần dùng chung (UI primitives, pipes, directives, models)
│   │   │   ├── components/           # confirm-modal, page-header, loading-spinner, empty-state, stat-card,
│   │   │   │                         # theme-switcher, language-switcher, status-badge, search-input, form-field
│   │   │   ├── directives/           # has-permission.directive.ts
│   │   │   ├── pipes/                # currency-vnd.pipe.ts, date-vi.pipe.ts, translate.pipe.ts
│   │   │   ├── models/               # table.model.ts, select-option.model.ts, dialog-config.model.ts
│   │   │   └── utils/                # date-utils.ts, number-utils.ts (pure functions)
│   │   ├── features/                 # Các miền nghiệp vụ độc lập (Lazy loaded)
│   │   │   ├── auth/                 # Đăng nhập & Xác thực
│   │   │   ├── dashboard/            # Bàn làm việc tổng quan
│   │   │   └── users/                # Quản lý người dùng & phân quyền RBAC
│   │   ├── app.component.html        # Chỉ chứa <router-outlet></router-outlet>
│   │   ├── app.component.ts          # Root component
│   │   ├── app.config.ts             # Application Providers (HttpClient, Router, PrimeNG)
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
4. **Shared Separation**: `shared` chứa các thành phần UI, pipes, utils, và models thực sự dùng chung; tuyệt đối không chứa business logic của feature cụ thể.
5. **Thống nhất Layout Shell**: Ứng dụng hiện đang sử dụng `src/app/layout/` làm shell chính cho router outlet; tránh nhầm lẫn với thư mục nguyên mẫu cũ `src/app/layouts/`.
