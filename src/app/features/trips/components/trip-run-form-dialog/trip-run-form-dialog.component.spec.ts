import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripRunFormDialogComponent } from './trip-run-form-dialog.component';
import { TripRun } from '../../models/trip-run.model';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { By } from '@angular/platform-browser';

describe('TripRunFormDialogComponent', () => {
  let component: TripRunFormDialogComponent;
  let fixture: ComponentFixture<TripRunFormDialogComponent>;

  const mockRouteOptions: SelectOption[] = [
    { label: 'Hà Nội - Hải Phòng', value: 'route-1' },
    { label: 'Hà Nội - Nam Định', value: 'route-2' },
  ];

  const mockVehicleOptions: SelectOption[] = [
    { label: '29B-12345 (Giường nằm 40 chỗ)', value: 'veh-1' },
    { label: '29B-67890 (Limousine 34 chỗ)', value: 'veh-2' },
  ];

  const mockDriverOptions: SelectOption[] = [
    { label: 'Nguyễn Văn A (0987654321)', value: 'drv-1' },
    { label: 'Trần Văn B (0912345678)', value: 'drv-2' },
  ];

  const mockTripRun: TripRun = {
    id: 'tr-1',
    code: 'HN-HP-01',
    name: 'Tuyến sáng HN-HP',
    routeId: 'route-1',
    routeName: 'Hà Nội - Hải Phòng',
    departureTime: '07:30',
    daysOfWeek: '1,2,3,4,5',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    defaultVehicleId: 'veh-1',
    defaultVehiclePlateNumber: '29B-12345',
    defaultDriverId: 'drv-1',
    defaultDriverName: 'Nguyễn Văn A',
    defaultAssistantDriverId: 'drv-2',
    defaultAssistantDriverName: 'Trần Văn B',
    basePrice: 150000,
    status: 'ACTIVE',
    note: 'Chuyến chạy thường nhật',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripRunFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TripRunFormDialogComponent);
    component = fixture.componentInstance;
    component.routeOptions = mockRouteOptions;
    component.vehicleOptions = mockVehicleOptions;
    component.driverOptions = mockDriverOptions;
    fixture.detectChanges();
  });

  it('nên khởi tạo thành công component', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
  });

  it('nên patch đúng dữ liệu khi mở dialog cập nhật', () => {
    component.tripRun = mockTripRun;
    component.ngOnChanges({
      tripRun: {
        currentValue: mockTripRun,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    expect(component.form.get('code')?.value).toBe('HN-HP-01');
    expect(component.form.get('name')?.value).toBe('Tuyến sáng HN-HP');
    expect(component.form.get('routeId')?.value).toBe('route-1');
    expect(component.form.get('departureTime')?.value).toBe('07:30');
    expect(component.form.get('defaultVehicleId')?.value).toBe('veh-1');
    expect(component.form.get('defaultDriverId')?.value).toBe('drv-1');
    expect(component.form.get('defaultAssistantDriverId')?.value).toBe('drv-2');
    expect(component.form.get('basePrice')?.value).toBe(150000);
    expect(component.selectedDays).toEqual([1, 2, 3, 4, 5]);
  });

  it('nên reset form về mặc định khi mở dialog tạo mới', () => {
    component.tripRun = null;
    component.ngOnChanges({
      tripRun: {
        currentValue: null,
        previousValue: mockTripRun,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    expect(component.form.get('code')?.value).toBe('');
    expect(component.form.get('routeId')?.value).toBe('');
    expect(component.selectedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('nên bắt buộc các trường cần thiết khi form rỗng', () => {
    component.tripRun = null;
    component.form.reset();
    component.selectedDays = [];
    fixture.detectChanges();

    expect(component.form.valid).toBe(false);
    expect(component.form.get('code')?.invalid).toBe(true);
    expect(component.form.get('name')?.invalid).toBe(true);
    expect(component.form.get('routeId')?.invalid).toBe(true);
    expect(component.form.get('departureTime')?.invalid).toBe(true);
    expect(component.form.get('startDate')?.invalid).toBe(true);
    expect(component.form.get('basePrice')?.invalid).toBe(true);
  });

  it('nên cập nhật routeId khi thay đổi qua app-select', () => {
    component.visible = true;
    fixture.detectChanges();

    const selectElements = fixture.debugElement.queryAll(By.directive(SelectComponent));
    expect(selectElements.length).toBe(4); // routeId, defaultVehicleId, defaultDriverId, defaultAssistantDriverId

    const routeSelect = selectElements[0].componentInstance as SelectComponent<string>;
    routeSelect.onModelChange('route-2');
    fixture.detectChanges();

    expect(component.form.get('routeId')?.value).toBe('route-2');
  });

  it('nên emit save khi form hợp lệ và gọi onSubmit()', () => {
    let emittedPayload: any = null;
    component.save.subscribe((data) => {
      emittedPayload = data;
    });

    component.tripRun = mockTripRun;
    component.ngOnChanges({
      tripRun: {
        currentValue: mockTripRun,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    component.onSubmit();

    expect(emittedPayload).toBeTruthy();
    expect(emittedPayload.name).toBe('Tuyến sáng HN-HP');
    expect(emittedPayload.routeId).toBe('route-1');
  });

  it('không nên emit save khi submitting = true', () => {
    let emitted = false;
    component.save.subscribe(() => {
      emitted = true;
    });

    component.submitting = true;
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('nên phát visibleChange(false) khi gọi onClose()', () => {
    let closed = false;
    component.visibleChange.subscribe((v) => {
      if (!v) closed = true;
    });

    component.onClose();
    expect(closed).toBe(true);
  });
});
