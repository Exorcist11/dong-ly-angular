import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TableLazyLoadEvent as PrimeNgLazyLoadEvent,
  TableModule,
} from 'primeng/table';
import { ButtonComponent } from '../button/button.component';
import {
  TableColumn,
  TableFilterChangeEvent,
  TableFilterConfig,
  TableLazyLoadEvent,
} from '../../models/table.model';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { SelectComponent } from '../select/select.component';
import {
  TableCellDirective,
  TableHeaderDirective,
} from './table-cell.directive';

import { TranslationService } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

/**
 * Component Bảng dữ liệu tái sử dụng cao (Generic Data Table) Đông Lý Admin.
 * Hỗ trợ Server-side / Client-side pagination, sorting, row selection, custom cell templates,
 * tích hợp sẵn toolbar tìm kiếm (search) và bộ lọc (filters).
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonComponent,
    SelectComponent,
    EmptyStateComponent,
    SearchInputComponent,
    TranslatePipe,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends Record<string, any> = Record<string, any>> {
  private readonly i18n = inject(TranslationService);
  /** Danh sách dữ liệu bảng */
  readonly data = input.required<T[]>();

  /** Danh sách cấu hình cột */
  readonly columns = input.required<TableColumn<T>[]>();

  /** Trạng thái đang tải dữ liệu */
  readonly loading = input<boolean>(false);

  /** Chế độ Lazy Load (phân trang & sort server-side). Mặc định là true */
  readonly lazy = input<boolean>(true);

  /** Tổng số bản ghi (dành cho server-side pagination) */
  readonly totalRecords = input<number>(0);

  /** Chỉ số phần tử bắt đầu của trang (first index) */
  readonly first = input<number>(0);

  /** Số dòng trên mỗi trang */
  readonly pageSize = input<number>(10);

  /** Các tùy chọn số dòng trên mỗi trang */
  readonly rowsPerPageOptions = input<number[]>([10, 20, 50]);

  /** Bật/tắt thanh phân trang */
  readonly paginator = input<boolean>(true);

  /** Hiển thị báo cáo vị trí trang hiện tại */
  readonly showCurrentPageReport = input<boolean>(true);

  /** Mẫu chuỗi hiển thị vị trí trang */
  readonly currentPageReportTemplate = input<string | undefined>(undefined);

  /** Bật cuộn nội dung bảng */
  readonly scrollable = input<boolean>(false);

  /** Chiều cao vùng cuộn (vd: '360px', '50vh') */
  readonly scrollHeight = input<string | undefined>(undefined);

  /** Độ rộng tối thiểu của bảng */
  readonly minWidth = input<string>('800px');

  /** Chế độ chọn dòng ('single' | 'multiple' | null) */
  readonly selectionMode = input<'single' | 'multiple' | null>(null);

  /** Dữ liệu các dòng đang được chọn */
  readonly selection = input<T | T[] | null>(null);

  /** Thuộc tính định danh duy nhất của mỗi dòng */
  readonly dataKey = input<string>('id');

  /** Hiệu ứng hover dòng */
  readonly rowHover = input<boolean>(true);

  /** Hiển thị màu dòng xen kẽ (striped) */
  readonly stripedRows = input<boolean>(false);

  /** Tiêu đề hiển thị khi không có dữ liệu */
  readonly emptyTitle = input<string | undefined>(undefined);

  /** Thông điệp hiển thị khi không có dữ liệu */
  readonly emptyMessage = input<string | undefined>(undefined);

  /** Icon hiển thị ở trạng thái empty */
  readonly emptyIcon = input<string>('pi pi-inbox');

  /** Thông điệp báo lỗi từ server (nếu có) */
  readonly errorMessage = input<string | null>(null);

  /** CSS class tùy biến cho p-table */
  readonly tableStyleClass = input<string>('p-datatable-sm saas-data-table');

  /** Hàm tính class CSS động hoặc tên class tĩnh cho từng dòng */
  readonly rowClass = input<string | ((row: T) => string | Record<string, boolean>) | null>(null);

  /** Số dòng skeleton hiển thị khi đang tải */
  readonly skeletonRows = input<number>(5);

  /** Bố cục responsive */
  readonly responsiveLayout = input<'scroll' | 'stack'>('scroll');

  // --- TÙY CHỌN TOOLBAR, TÌM KIẾM & BỘ LỌC ---
  /** Bật/tắt thanh tìm kiếm tích hợp */
  readonly searchable = input<boolean>(false);

  /** Giá trị tìm kiếm hiện tại */
  readonly searchValue = input<string>('');

  /** Placeholder cho ô tìm kiếm */
  readonly searchPlaceholder = input<string | undefined>(undefined);

  /** Nhãn hiển thị phía trên ô tìm kiếm (mặc định 'Tìm kiếm' nếu không truyền) */
  readonly searchLabel = input<string | undefined>(undefined);

  /** Thời gian trễ debounce (ms) cho tìm kiếm */
  readonly searchDebounce = input<number>(300);

  /** Danh sách cấu hình bộ lọc dropdown */
  readonly filters = input<TableFilterConfig<any>[] | null>(null);

  /** Hiển thị nút "Đặt lại" bộ lọc */
  readonly showResetFilters = input<boolean>(false);

  /** Nhãn nút đặt lại bộ lọc */
  readonly resetFiltersLabel = input<string | undefined>(undefined);

  /** Hiển thị nút làm mới dữ liệu */
  readonly showRefresh = input<boolean>(false);

  /** Tooltip cho nút làm mới */
  readonly refreshTooltip = input<string | undefined>(undefined);

  /** Cưỡng chế ẩn/hiện thanh toolbar (nếu null sẽ tự tính) */
  readonly showToolbar = input<boolean | null>(null);

  readonly effectivePageReportTemplate = computed(() => {
    this.i18n.currentLang();
    return this.currentPageReportTemplate() ?? this.i18n.translate('common.table.pageReport');
  });

  readonly effectiveEmptyTitle = computed(() => {
    this.i18n.currentLang();
    return this.emptyTitle() ?? this.i18n.translate('common.table.emptyTitle');
  });

  readonly effectiveEmptyMessage = computed(() => {
    this.i18n.currentLang();
    return this.emptyMessage() ?? this.i18n.translate('common.table.emptyMessage');
  });

  readonly effectiveSearchPlaceholder = computed(() => {
    this.i18n.currentLang();
    return this.searchPlaceholder() ?? (this.i18n.translate('common.actions.search') + '...');
  });

  readonly effectiveSearchLabel = computed(() => {
    this.i18n.currentLang();
    const custom = this.searchLabel();
    if (custom !== undefined) {
      if (!custom) return undefined;
      return custom.includes('.') ? this.i18n.translate(custom) : custom;
    }
    return this.i18n.translate('common.actions.search');
  });

  readonly effectiveResetFiltersLabel = computed(() => {
    this.i18n.currentLang();
    return this.resetFiltersLabel() ?? this.i18n.translate('common.actions.reset');
  });

  readonly effectiveRefreshTooltip = computed(() => {
    this.i18n.currentLang();
    return this.refreshTooltip() ?? this.i18n.translate('common.actions.reloadList');
  });

  // OUTPUTS
  /** Phát sự kiện khi giá trị tìm kiếm thay đổi */
  readonly searchChange = output<string>();

  /** Phát sự kiện khi một bộ lọc dropdown thay đổi giá trị */
  readonly filterChange = output<TableFilterChangeEvent<any>>();

  /** Phát sự kiện khi bấm nút đặt lại bộ lọc */
  readonly resetFilters = output<void>();

  /** Phát sự kiện khi bấm nút làm mới */
  readonly refresh = output<void>();

  /** Sự kiện khi thay đổi trang, số dòng hoặc sort ở chế độ lazy */
  readonly lazyLoad = output<TableLazyLoadEvent>();

  /** Sự kiện khi thay đổi dòng được chọn */
  readonly selectionChange = output<T | T[]>();

  /** Sự kiện click vào một dòng */
  readonly rowClick = output<T>();

  /** Sự kiện người dùng nhấn nút Thử lại khi có lỗi */
  readonly retry = output<void>();

  // CONTENT CHILDREN
  readonly cellDirectives = contentChildren(TableCellDirective);
  readonly headerDirectives = contentChildren(TableHeaderDirective);

  /** Kiểm tra có hiển thị thanh toolbar tìm kiếm / lọc hay không */
  readonly hasToolbar = computed(() => {
    if (this.showToolbar() !== null) {
      return !!this.showToolbar();
    }
    return (
      this.searchable() ||
      (this.filters() != null && this.filters()!.length > 0) ||
      this.showResetFilters() ||
      this.showRefresh()
    );
  });

  /** Danh sách các cột hiển thị (không bị hidden) */
  readonly visibleColumns = computed(() => {
    return this.columns().filter((col) => !col.hidden);
  });

  /** Tổng số cột (đã bao gồm cột checkbox nếu có) phục vụ colspan */
  readonly totalColspan = computed(() => {
    return this.visibleColumns().length + (this.selectionMode() ? 1 : 0);
  });

  /** Danh sách mảng giả lập skeleton */
  readonly skeletonArray = computed(() => {
    return Array.from({ length: this.skeletonRows() }, (_, i) => i);
  });

  /** Lấy template cell tùy biến cho cột */
  getCellTemplate(column: TableColumn<T>): TemplateRef<unknown> | null {
    const targetName = column.template || String(column.field);
    const directive = this.cellDirectives().find((d) => d.name() === targetName);
    return directive ? directive.templateRef : null;
  }

  /** Lấy template header tùy biến cho cột */
  getHeaderTemplate(column: TableColumn<T>): TemplateRef<unknown> | null {
    const targetName = column.template || String(column.field);
    const directive = this.headerDirectives().find((d) => d.name() === targetName);
    return directive ? directive.templateRef : null;
  }

  /** Chuyển field của column thành string an toàn cho sort */
  getFieldString(column: TableColumn<T>): string {
    return String(column.field);
  }

  /**
   * Truy xuất giá trị hiển thị cho cell (hỗ trợ nested key path và formatter)
   */
  getCellValue(row: T, column: TableColumn<T>): unknown {
    const field = String(column.field);
    let value: unknown;

    if (field.includes('.')) {
      const parts = field.split('.');
      let current: any = row;
      for (const part of parts) {
        if (current == null) {
          current = undefined;
          break;
        }
        current = current[part];
      }
      value = current;
    } else {
      value = (row as Record<string, unknown>)[field];
    }

    if (column.formatter) {
      return column.formatter(value, row);
    }

    if (value === null || value === undefined || value === '') {
      return column.defaultValue ?? '—';
    }

    return value;
  }

  /** Lấy class CSS động hoặc tĩnh cho dòng */
  getRowClasses(row: T): string | Record<string, boolean> | null {
    const val = this.rowClass();
    if (!val) return null;
    return typeof val === 'function' ? val(row) : val;
  }

  /** Xử lý sự kiện Lazy Load của PrimeNG */
  handleLazyLoad(event: PrimeNgLazyLoadEvent): void {
    this.lazyLoad.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.pageSize(),
      sortField: typeof event.sortField === 'string' ? event.sortField : undefined,
      sortOrder: event.sortOrder ?? undefined,
    });
  }

  /** Xử lý sự kiện thay đổi selection */
  handleSelectionChange(value: T | T[]): void {
    this.selectionChange.emit(value);
  }

  /** Xử lý sự kiện click dòng */
  handleRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  /** Xử lý nhấn nút thử lại */
  handleRetry(): void {
    this.retry.emit();
  }

  /** Xử lý tìm kiếm từ search input */
  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  /** Xử lý thay đổi filter select */
  onFilterSelectChange(key: string, value: unknown): void {
    this.filterChange.emit({ key, value });
  }

  /** Xử lý nhấn nút đặt lại bộ lọc */
  onResetFiltersClick(): void {
    this.resetFilters.emit();
  }

  /** Xử lý nhấn nút làm mới */
  onRefreshClick(): void {
    this.refresh.emit();
  }
}
