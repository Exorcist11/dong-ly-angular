import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Directive định danh template tùy biến cho cell của DataTableComponent
 * Cách dùng: <ng-template appTableCell="fieldName" let-row>...</ng-template>
 */
@Directive({
  selector: '[appTableCell]',
  standalone: true,
})
export class TableCellDirective {
  /** Tên trường (field) hoặc tên template tương ứng trong TableColumn */
  readonly name = input.required<string>({ alias: 'appTableCell' });
  readonly templateRef = inject(TemplateRef<unknown>);
}

/**
 * Directive định danh template tùy biến cho header của DataTableComponent
 * Cách dùng: <ng-template appTableHeader="fieldName">...</ng-template>
 */
@Directive({
  selector: '[appTableHeader]',
  standalone: true,
})
export class TableHeaderDirective {
  readonly name = input.required<string>({ alias: 'appTableHeader' });
  readonly templateRef = inject(TemplateRef<unknown>);
}
