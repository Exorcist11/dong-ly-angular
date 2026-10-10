import { Directive, ElementRef, TemplateRef, inject } from '@angular/core';

/**
 * Directive đánh dấu vùng header tùy biến cho `<app-dialog>`.
 * Hỗ trợ cả trên thẻ DOM (`<div dialogHeader>`) lẫn `<ng-template dialogHeader>`.
 */
@Directive({
  selector: '[dialogHeader], [appDialogHeader]',
  standalone: true,
})
export class DialogHeaderDirective {
  readonly templateRef = inject(TemplateRef, { optional: true });
  readonly elementRef = inject(ElementRef, { optional: true });
}

/**
 * Directive đánh dấu vùng footer tùy biến cho `<app-dialog>`.
 * Hỗ trợ cả trên thẻ DOM (`<div dialogFooter>`) lẫn `<ng-template dialogFooter>`.
 */
@Directive({
  selector: '[dialogFooter], [appDialogFooter]',
  standalone: true,
})
export class DialogFooterDirective {
  readonly templateRef = inject(TemplateRef, { optional: true });
  readonly elementRef = inject(ElementRef, { optional: true });
}
