import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutShellComponent } from '../../layout/layout-shell.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [LayoutShellComponent],
  template: `<app-layout-shell />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {}
