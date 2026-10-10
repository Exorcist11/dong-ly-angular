import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TableLazyLoadEvent as PrimeNgLazyLoadEvent,
  TableModule,
} from 'primeng/table';
import { Button } from 'primeng/button';
import { TableColumn, TableLazyLoadEvent } from '../../models/table.model';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import {
  TableCellDirective,
  TableHeaderDirective,
} from './table-cell.directive';

/**
 * Component Bảng dữ liệu tái sử dụng cao (Generic Data Table) Đông Lý Admin.
 * Hỗ trợ Server-side / Client-side pagination, sorting, row selection, custom cell templates.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    Button,
    EmptyStateComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends Record<string, any> = Record<string, any>> {
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
  readonly currentPageReportTemplate = input<string>(
    'Hiển thị {first} - {last} trong tổng số {totalRecords} bản ghi',
  );

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
  readonly emptyTitle = input<string>('Không có dữ liệu');

  /** Thông điệp hiển thị khi không có dữ liệu */
  readonly emptyMessage = input<string>(
    'Hiện tại chưa có bản ghi nào phù hợp để hiển thị.',
  );

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

  // OUTPUTS
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
}
