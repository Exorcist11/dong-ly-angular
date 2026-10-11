import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CurrencyVndPipe } from '../../../../shared/pipes/currency-vnd.pipe';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import {
  CrmRouteStopItem,
  CrmSeatMapItem,
  CrmTripSeatMap,
  SeatOccupancyStatus,
} from '../../models/booking.model';

@Component({
  selector: 'app-crm-seat-map',
  standalone: true,
  imports: [CommonModule, Tooltip, ButtonComponent, CurrencyVndPipe, TranslatePipe],
  templateUrl: './crm-seat-map.component.html',
  styleUrl: './crm-seat-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmSeatMapComponent {
  private readonly i18n = inject(TranslationService);
  /** Dữ liệu sơ đồ ghế từ API backend */
  readonly seatMap = input.required<CrmTripSeatMap>();

  /** Danh sách ID các ghế đang được chọn */
  readonly selectedSeatIds = input<string[]>([]);

  /** Giới hạn số ghế tối đa được chọn cùng lúc */
  readonly maxSeats = input<number>(5);

  /** Trạng thái loading khi thao tác */
  readonly loading = input<boolean>(false);

  /** Phát sự kiện khi danh sách ghế chọn thay đổi */
  readonly selectionChange = output<CrmSeatMapItem[]>();

  /** Phát sự kiện yêu cầu làm mới/tải lại sơ đồ ghế */
  readonly refreshRequested = output<void>();

  /** Tầng đang chọn hiển thị (mặc định tầng 1) */
  readonly activeFloor = signal<number>(1);

  /** Danh sách các tầng của xe */
  readonly floors = computed<number[]>(() => {
    const total = this.seatMap().totalFloors || 1;
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  /** Danh sách ghế thuộc tầng đang kích hoạt */
  readonly currentFloorSeats = computed<CrmSeatMapItem[]>(() => {
    const floor = this.activeFloor();
    return (this.seatMap().seats || []).filter((s) => s.floor === floor);
  });

  /** Ma trận lưới ghế (hàng x cột) của tầng hiện tại */
  readonly seatGrid = computed<(CrmSeatMapItem | null)[][]>(() => {
    const totalRows = this.seatMap().totalRows || 6;
    const totalCols = this.seatMap().totalColumns || 3;
    const seats = this.currentFloorSeats();

    const grid: (CrmSeatMapItem | null)[][] = [];
    for (let r = 1; r <= totalRows; r++) {
      const row: (CrmSeatMapItem | null)[] = [];
      for (let c = 1; c <= totalCols; c++) {
        const found = seats.find((s) => s.rowIndex === r && s.columnIndex === c);
        row.push(found ?? null);
      }
      grid.push(row);
    }
    return grid;
  });

  /** Danh sách chi tiết các ghế đang được chọn */
  readonly selectedSeats = computed<CrmSeatMapItem[]>(() => {
    const selectedIds = new Set(this.selectedSeatIds());
    return (this.seatMap().seats || []).filter((s) => selectedIds.has(s.seatId));
  });

  /** Tổng tiền tạm tính của các ghế đã chọn */
  readonly totalPrice = computed<number>(() => {
    return this.selectedSeats().reduce((sum, s) => sum + s.calculatedPrice, 0);
  });

  selectFloor(floor: number): void {
    this.activeFloor.set(floor);
  }

  isSeatSelected(seatId: string): boolean {
    return this.selectedSeatIds().includes(seatId);
  }

  toggleSeat(seat: CrmSeatMapItem): void {
    if (!seat.isBookable || seat.occupancyStatus !== 'AVAILABLE') {
      return;
    }

    const currentIds = [...this.selectedSeatIds()];
    const index = currentIds.indexOf(seat.seatId);

    if (index > -1) {
      // Bỏ chọn
      currentIds.splice(index, 1);
    } else {
      // Chọn mới - kiểm tra giới hạn maxSeats
      if (currentIds.length >= this.maxSeats()) {
        return;
      }
      currentIds.push(seat.seatId);
    }

    const selectedList = (this.seatMap().seats || []).filter((s) =>
      currentIds.includes(s.seatId)
    );
    this.selectionChange.emit(selectedList);
  }

  getSeatStatusClass(seat: CrmSeatMapItem): string {
    if (this.isSeatSelected(seat.seatId)) {
      return 'seat-selected';
    }
    switch (seat.occupancyStatus) {
      case 'AVAILABLE':
        return 'seat-available';
      case 'HELD':
        return 'seat-held';
      case 'BOOKED':
        return 'seat-booked';
      case 'LOCKED':
        return 'seat-locked';
      default:
        return 'seat-locked';
    }
  }

  getSeatTooltip(seat: CrmSeatMapItem): string {
    const statusText = this.getSeatStatusLabel(seat.occupancyStatus);
    const priceText = this.i18n.formatCurrency(seat.calculatedPrice);

    return this.i18n.translate('bookings.seatMap.seatTooltip', {
      seatCode: seat.seatCode,
      price: priceText,
      status: statusText,
    });
  }

  getSeatStatusLabel(status: SeatOccupancyStatus): string {
    switch (status) {
      case 'AVAILABLE':
        return this.i18n.translate('bookings.seatMap.status.available');
      case 'HELD':
        return this.i18n.translate('bookings.seatMap.status.held');
      case 'BOOKED':
        return this.i18n.translate('bookings.seatMap.status.booked');
      case 'LOCKED':
        return this.i18n.translate('bookings.seatMap.status.locked');
      default:
        return this.i18n.translate('bookings.seatMap.status.unavailable');
    }
  }
}
