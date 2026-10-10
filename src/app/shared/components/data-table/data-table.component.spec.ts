import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DataTableComponent } from './data-table.component';
import { TableCellDirective, TableHeaderDirective } from './table-cell.directive';
import { TableColumn } from '../../models/table.model';

interface TestItem {
  id: string;
  name: string;
  category?: string;
  amount: number | null;
}

@Component({
  standalone: true,
  imports: [DataTableComponent, TableCellDirective, TableHeaderDirective],
  template: `
    <app-data-table
      [data]="data()"
      [columns]="columns"
      [loading]="loading()"
      [lazy]="false"
      [paginator]="false"
      [errorMessage]="errorMessage()"
      [selectionMode]="selectionMode()"
      (rowClick)="onRowClick($event)"
      (retry)="onRetry()"
      (selectionChange)="onSelectionChange($event)"
    >
      <ng-template appTableCell="customCategory" let-row>
        <span class="custom-badge">{{ row.category }}</span>
      </ng-template>

      <ng-template appTableHeader="name">
        <span class="custom-header">Tên tùy chỉnh</span>
      </ng-template>
    </app-data-table>
  `,
})
class TestHostComponent {
  readonly data = signal<TestItem[]>([
    { id: '1', name: 'Item 1', category: 'Cat A', amount: 100 },
    { id: '2', name: 'Item 2', category: 'Cat B', amount: null },
  ]);

  readonly columns: TableColumn<TestItem>[] = [
    { field: 'id', header: 'ID', width: '60px' },
    { field: 'name', header: 'Tên' },
    {
      field: 'category',
      header: 'Danh mục',
      template: 'customCategory',
    },
    {
      field: 'amount',
      header: 'Số tiền',
      defaultValue: 'Chưa có',
      formatter: (val) => (val != null ? `${val} đ` : 'Chưa có'),
    },
  ];

  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectionMode = signal<'single' | 'multiple' | null>(null);

  clickedRow: TestItem | null = null;
  retryClicked = false;
  selectedItems: unknown = null;

  onRowClick(row: TestItem): void {
    this.clickedRow = row;
  }

  onRetry(): void {
    this.retryClicked = true;
  }

  onSelectionChange(items: unknown): void {
    this.selectedItems = items;
  }
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, DataTableComponent, TableCellDirective, TableHeaderDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công và render danh sách dòng dữ liệu', () => {
    const rows = fixture.debugElement.queryAll(By.css('.p-datatable-tbody > tr'));
    expect(rows.length).toBe(2);
  });

  it('nên render đúng giá trị cột mặc định và áp dụng formatter', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Item 1');
    expect(textContent).toContain('100 đ');
    expect(textContent).toContain('Chưa có');
  });

  it('nên áp dụng custom cell template khi được khai báo', () => {
    const customBadge = fixture.debugElement.query(By.css('.custom-badge'));
    expect(customBadge).toBeTruthy();
    expect(customBadge.nativeElement.textContent).toContain('Cat A');
  });

  it('nên áp dụng custom header template khi được khai báo', () => {
    const customHeader = fixture.debugElement.query(By.css('.custom-header'));
    expect(customHeader).toBeTruthy();
    expect(customHeader.nativeElement.textContent).toContain('Tên tùy chỉnh');
  });

  it('nên phát sự kiện rowClick khi người dùng bấm vào một dòng', () => {
    const firstRow = fixture.debugElement.query(By.css('.p-datatable-tbody > tr'));
    firstRow.triggerEventHandler('click', null);
    expect(host.clickedRow).toEqual(host.data()[0]);
  });

  it('nên hiển thị error state và phát sự kiện retry khi có errorMessage', () => {
    host.errorMessage.set('Lỗi máy chủ');
    fixture.detectChanges();

    const errorContainer = fixture.debugElement.query(By.css('.table-error-container'));
    expect(errorContainer).toBeTruthy();
    expect(errorContainer.nativeElement.textContent).toContain('Lỗi máy chủ');

    const retryBtn = fixture.debugElement.query(By.css('.table-error-container p-button'));
    retryBtn.triggerEventHandler('onClick', null);
    expect(host.retryClicked).toBe(true);
  });

  it('nên hiển thị empty state khi danh sách rỗng và không loading', () => {
    host.data.set([]);
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });
});
