import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() overlay = false;
}
