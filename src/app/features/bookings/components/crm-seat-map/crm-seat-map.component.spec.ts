import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmSeatMapComponent } from './crm-seat-map.component';
import { CrmSeatMapItem, CrmTripSeatMap } from '../../models/booking.model';

describe('CrmSeatMapComponent', () => {
  let component: CrmSeatMapComponent;
  let fixture: ComponentFixture<CrmSeatMapComponent>;

  const mockSeatAvailable: CrmSeatMapItem = {
    seatId: 'seat-1',
    seatCode: 'A01',
    floor: 1,
    rowIndex: 1,
    columnIndex: 1,
    seatType: 'LUXURY_ROOM' as any,
    extraPrice: 0,
    calculatedPrice: 250000,
    occupancyStatus: 'AVAILABLE',
    isBookable: true,
  };

  const mockSeatHeld: CrmSeatMapItem = {
    seatId: 'seat-2',
    seatCode: 'A02',
    floor: 1,
    rowIndex: 1,
    columnIndex: 2,
    seatType: 'LUXURY_ROOM' as any,
    extraPrice: 0,
    calculatedPrice: 250000,
    occupancyStatus: 'HELD',
    isBookable: false,
  };

  const mockSeatMap: CrmTripSeatMap = {
    tripId: 'trip-1',
    tripCode: 'TRP-01',
    departureTime: '2026-10-15T07:00:00Z',
    routeName: 'Hà Nội - Thanh Hóa',
    vehiclePlateNumber: '36B-028.68',
    vehicleTypeName: 'Limousine',
    totalFloors: 2,
    totalRows: 6,
    totalColumns: 3,
    totalSeats: 22,
    availableSeats: 20,
    basePrice: 250000,
    seats: [mockSeatAvailable, mockSeatHeld],
    stops: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmSeatMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrmSeatMapComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('seatMap', mockSeatMap);
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công CrmSeatMapComponent', () => {
    expect(component).toBeTruthy();
  });

  it('nên tính toán đúng danh sách floors [1, 2]', () => {
    expect(component.floors()).toEqual([1, 2]);
  });

  it('toggleSeat: không cho chọn ghế HELD hoặc LOCKED (không bookable)', () => {
    let emittedSeats: CrmSeatMapItem[] | undefined;
    component.selectionChange.subscribe((seats) => {
      emittedSeats = seats;
    });

    component.toggleSeat(mockSeatHeld);
    expect(emittedSeats).toBeUndefined();
  });

  it('toggleSeat: cho phép chọn ghế AVAILABLE và phát selectionChange', () => {
    let emittedSeats: CrmSeatMapItem[] = [];
    component.selectionChange.subscribe((seats) => {
      emittedSeats = seats;
    });

    component.toggleSeat(mockSeatAvailable);
    expect(emittedSeats.length).toBe(1);
    expect(emittedSeats[0].seatId).toBe('seat-1');
  });

  it('toggleSeat: giới hạn số ghế tối đa theo maxSeats', () => {
    fixture.componentRef.setInput('maxSeats', 1);
    fixture.componentRef.setInput('selectedSeatIds', ['seat-other']);
    fixture.detectChanges();

    let emitted = false;
    component.selectionChange.subscribe(() => {
      emitted = true;
    });

    component.toggleSeat(mockSeatAvailable);
    expect(emitted).toBe(false);
  });
});
