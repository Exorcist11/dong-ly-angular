import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslatePipe],
  template: `
    <div class="qr-container">
      <div class="qr-canvas-wrapper" [class.blurred]="isExpired()">
        <canvas #qrCanvas></canvas>
        @if (isExpired()) {
          <div class="expired-overlay">
            <i class="pi pi-exclamation-triangle text-rose-500 text-2xl"></i>
            <span class="text-xs font-semibold text-rose-700 mt-1">
              {{ 'bookings.ticket.qrExpired' | translate }}
            </span>
          </div>
        }
      </div>

      @if (allowRefresh() && isExpired()) {
        <app-button
          class="mt-2"
          variant="secondary"
          size="small"
          icon="pi pi-refresh"
          [label]="'bookings.ticket.refreshQr' | translate"
          [loading]="refreshing()"
          (clicked)="refreshRequested.emit()"
        />
      }
    </div>
  `,
  styles: [
    `
      .qr-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .qr-canvas-wrapper {
        position: relative;
        background: #ffffff;
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .qr-canvas-wrapper.blurred canvas {
        filter: blur(2px);
        opacity: 0.5;
      }
      .expired-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 8px;
      }
      canvas {
        display: block;
        max-width: 100%;
        height: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrDisplayComponent {
  readonly qrData = input<string>('');
  readonly size = input<number>(140);
  readonly isExpired = input<boolean>(false);
  readonly allowRefresh = input<boolean>(false);
  readonly refreshing = input<boolean>(false);

  readonly refreshRequested = output<void>();

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');

  constructor() {
    effect(() => {
      const data = this.qrData();
      const canvasEl = this.canvasRef()?.nativeElement;
      const qrSize = this.size();

      if (canvasEl && data) {
        QRCode.toCanvas(canvasEl, data, {
          width: qrSize,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        }).catch((err) => {
          console.error('Error rendering QR code:', err);
        });
      }
    });
  }
}
