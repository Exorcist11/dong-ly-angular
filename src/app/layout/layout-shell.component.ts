import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebarComponent } from './components/app-sidebar/app-sidebar.component';
import { AppTopbarComponent } from './components/app-topbar/app-topbar.component';
import { Toast } from 'primeng/toast';

import { TranslatePipe } from '../core/i18n/translate.pipe';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [RouterOutlet, AppSidebarComponent, AppTopbarComponent, Toast, TranslatePipe],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutShellComponent {}
