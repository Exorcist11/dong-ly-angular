import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import {
  ConfigureSeatLayoutRequest,
  SeatItemDto,
  SeatStatus,
  SeatType,
  VehicleSeat,
  VehicleSummary,
} from '../../models/fleet.model';

interface GridCell {
  floor: number;
  row: number;
  col: number;
  seat?: SeatItemDto;
}

@Component({
  selector: 'app-seat-layout-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppDialogComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TranslatePipe,
  ],
  templateUrl: './seat-layout-dialog.component.html',
  styleUrls: ['./seat-layout-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatLayoutDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() vehicle: VehicleSummary | null = null;
  @Input() initialSeats: VehicleSeat[] = [];
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saveLayout = new EventEmitter<ConfigureSeatLayoutRequest>();
  @Output() toggleSeatStatus = new EventEmitter<{ seatId: string; status: SeatStatus }>();

  // Reactive state
  readonly vehicleData = signal<VehicleSummary | null>(null);
  readonly activeFloor = signal<number>(1);
  readonly selectedSeat = signal<SeatItemDto | null>(null);
  readonly currentSeats = signal<SeatItemDto[]>([]);

  readonly seatTypeOptions: SelectOption[] = [
    { label: 'Phòng VIP / Cung Điện (LUXURY_ROOM)', value: 'LUXURY_ROOM' },
    { label: 'Giường Nằm Thường (SLEEPER)', value: 'SLEEPER' },
    { label: 'Ghế VIP (VIP)', value: 'VIP' },
    { label: 'Ghế Tiêu Chuẩn (STANDARD)', value: 'STANDARD' },
  ];

  readonly seatStatusOptions: SelectOption[] = [
    { label: 'Mở bán (ACTIVE)', value: 'ACTIVE' },
    { label: 'Tạm khóa (BLOCKED)', value: 'BLOCKED' },
    { label: 'Không dùng (INACTIVE)', value: 'INACTIVE' },
  ];

  // Computed layout grids for floor 1 & floor 2
  readonly floor1Grid = computed(() => this.buildGrid(1));
  readonly floor2Grid = computed(() => this.buildGrid(2));

  readonly totalActiveSeats = computed(() =>
    this.currentSeats().filter((s) => s.status === 'ACTIVE').length
  );

  readonly currentFloorSeatsCount = computed(() => {
    const target = this.activeFloor();
    return this.currentSeats().filter((s) => Number(s.floor) === target).length;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicle']) {
      this.vehicleData.set(this.vehicle);
    }

    if (changes['initialSeats'] || changes['vehicle']) {
      this.vehicleData.set(this.vehicle);
      if (this.initialSeats && this.initialSeats.length > 0) {
        this.currentSeats.set(
          this.initialSeats.map((s) => ({
            seatCode: s.seatCode,
            floor: Number(s.floor),
            rowIndex: Number(s.rowIndex),
            columnIndex: Number(s.columnIndex),
            seatType: s.seatType,
            extraPrice: Number(s.extraPrice) || 0,
            status: s.status,
          }))
        );
      } else {
        this.currentSeats.set([]);
      }
      this.selectedSeat.set(null);
      this.activeFloor.set(1);
    }
  }

  private buildGrid(floor: number): GridCell[][] {
    const v = this.vehicleData();
    if (!v) return [];

    const rows = Number(v.totalRows) || 6;
    const cols = Number(v.totalColumns) || 3;
    const matrix: GridCell[][] = [];

    const seatMap = new Map<string, SeatItemDto>();
    for (const seat of this.currentSeats()) {
      if (Number(seat.floor) === Number(floor)) {
        seatMap.set(`${Number(seat.rowIndex)}_${Number(seat.columnIndex)}`, seat);
      }
    }

    for (let r = 1; r <= rows; r++) {
      const rowList: GridCell[] = [];
      for (let c = 1; c <= cols; c++) {
        const key = `${r}_${c}`;
        rowList.push({
          floor,
          row: r,
          col: c,
          seat: seatMap.get(key),
        });
      }
      matrix.push(rowList);
    }

    return matrix;
  }

  onSelectCell(cell: GridCell): void {
    if (cell.seat) {
      // Chọn ghế đang có
      this.selectedSeat.set({ ...cell.seat });
    } else {
      // Vị trí trống -> Khởi tạo ghế mới mặc định tại tọa độ này
      const prefix = cell.floor === 1 ? 'A' : 'B';
      const num = cell.row * (this.vehicleData()?.totalColumns || 3) + cell.col;
      const defaultCode = `${prefix}${cell.row}${cell.col}`;

      this.selectedSeat.set({
        seatCode: defaultCode,
        floor: cell.floor,
        rowIndex: cell.row,
        columnIndex: cell.col,
        seatType: this.vehicleData()?.vehicleType === 'LIMOUSINE' ? 'LUXURY_ROOM' : 'SLEEPER',
        extraPrice: 0,
        status: 'ACTIVE',
      });
    }
  }

  onSaveSeatToLayout(): void {
    const seat = this.selectedSeat();
    if (!seat || !seat.seatCode.trim()) return;

    const list = [...this.currentSeats()];
    const index = list.findIndex(
      (s) =>
        Number(s.floor) === Number(seat.floor) &&
        Number(s.rowIndex) === Number(seat.rowIndex) &&
        Number(s.columnIndex) === Number(seat.columnIndex)
    );

    const cleanSeat: SeatItemDto = {
      ...seat,
      floor: Number(seat.floor),
      rowIndex: Number(seat.rowIndex),
      columnIndex: Number(seat.columnIndex),
      seatCode: seat.seatCode.trim().toUpperCase(),
      extraPrice: Number(seat.extraPrice) || 0,
    };

    if (index >= 0) {
      list[index] = cleanSeat;
    } else {
      list.push(cleanSeat);
    }

    this.currentSeats.set(list);
    this.selectedSeat.set(null);
  }

  onRemoveSeatFromLayout(seat: SeatItemDto): void {
    const list = this.currentSeats().filter(
      (s) =>
        !(
          Number(s.floor) === Number(seat.floor) &&
          Number(s.rowIndex) === Number(seat.rowIndex) &&
          Number(s.columnIndex) === Number(seat.columnIndex)
        )
    );
    this.currentSeats.set(list);
    this.selectedSeat.set(null);
  }

  /**
   * Tự động sinh sơ đồ ghế chuẩn theo quy cách của xe (hàng x cột x tầng)
   */
  autoGenerateLayout(): void {
    const v = this.vehicleData();
    if (!v) return;

    const floors = Number(v.totalFloors) || 1;
    const rows = Number(v.totalRows) || 6;
    const cols = Number(v.totalColumns) || 3;
    const defaultType: SeatType =
      v.vehicleType === 'LIMOUSINE'
        ? 'LUXURY_ROOM'
        : v.vehicleType === 'SLEEPER'
          ? 'SLEEPER'
          : 'STANDARD';

    const generated: SeatItemDto[] = [];

    for (let f = 1; f <= floors; f++) {
      const prefix = f === 1 ? 'A' : 'B';
      let seatCounter = 1;

      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          // Đối với xe 3 cột (Limousine/Giường nằm): cột 2 thường là lối đi, trừ hàng cuối
          const isAisle = cols === 3 && c === 2 && r < rows;
          if (!isAisle) {
            const code = `${prefix}${seatCounter < 10 ? '0' : ''}${seatCounter}`;
            seatCounter++;
            generated.push({
              seatCode: code,
              floor: f,
              rowIndex: r,
              columnIndex: c,
              seatType: defaultType,
              extraPrice: defaultType === 'LUXURY_ROOM' ? (f === 1 ? 50000 : 30000) : 0,
              status: 'ACTIVE',
            });
          }
        }
      }
    }

    this.currentSeats.set(generated);
    this.selectedSeat.set(null);
  }

  /**
   * Xóa toàn bộ sơ đồ ghế để thiết lập lại từ đầu
   */
  clearAllSeats(): void {
    this.currentSeats.set([]);
    this.selectedSeat.set(null);
  }

  onApplyFullLayout(): void {
    const v = this.vehicleData();
    if (!v) return;

    const payload: ConfigureSeatLayoutRequest = {
      totalFloors: Number(v.totalFloors),
      totalRows: Number(v.totalRows),
      totalColumns: Number(v.totalColumns),
      seats: this.currentSeats(),
    };

    this.saveLayout.emit(payload);
  }

  onClose(): void {
    this.visibleChange.emit(false);
  }
}
