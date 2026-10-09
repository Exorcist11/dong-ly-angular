import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div class="header-left">
        @if (breadcrumbs && breadcrumbs.length > 0) {
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              @for (item of breadcrumbs; track item.label; let last = $last) {
                <li [class.active]="last">
                  @if (item.url && !last) {
                    <a [routerLink]="item.url">{{ item.label }}</a>
                    <span class="separator">/</span>
                  } @else {
                    <span>{{ item.label }}</span>
                  }
                </li>
              }
            </ol>
          </nav>
        }
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-subtitle">{{ subtitle }}</p>
        }
      </div>

      <div class="header-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .breadcrumbs ol {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0 0 6px 0;
      font-size: 13px;
      color: #64748b;
    }
    .breadcrumbs li {
      display: flex;
      align-items: center;
    }
    .breadcrumbs a {
      color: #3b82f6;
      text-decoration: none;
    }
    .breadcrumbs a:hover {
      text-decoration: underline;
    }
    .breadcrumbs .separator {
      margin: 0 8px;
      color: #94a3b8;
    }
    .breadcrumbs .active {
      color: #334155;
      font-weight: 500;
    }
    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.25;
    }
    .page-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 4px 0 0 0;
    }
    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
}
