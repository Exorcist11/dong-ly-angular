import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() icon?: string;
}
