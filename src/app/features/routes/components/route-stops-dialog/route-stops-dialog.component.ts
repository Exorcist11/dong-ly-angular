import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppDialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { SelectOption } from '../../../../shared/models/select-option.model';
import {
  RouteDetail,
  RouteDirectionType,
  RouteStop,
  RouteStopInputDto,
  RouteStopType,
  StopPoint,
  UpdateRouteStopsRequest,
} from '../../models/route.model';

@Component({
  selector: 'app-route-stops-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    AppDialogComponent,
    ButtonComponent,
    SelectComponent,
  ],
  templateUrl: './route-stops-dialog.component.html',
  styleUrl: './route-stops-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteStopsDialogComponent implements OnChanges {
  private readonly translationService = inject(TranslationService);

  @Input() visible = false;
  @Input() route: RouteDetail | null = null;
  @Input() availableStopPoints: StopPoint[] = [];
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<UpdateRouteStopsRequest>();

  readonly activeTab = signal<RouteDirectionType>('OUTBOUND');
  readonly localStops = signal<RouteStop[]>([]);
  readonly selectedPointToAdd = signal<string>('');

  get stopTypeOptions(): SelectOption[] {
    return [
      { label: this.translationService.translate('routes.stopsConfig.typePickup'), value: 'PICKUP' },
      { label: this.translationService.translate('routes.stopsConfig.typeDropoff'), value: 'DROPOFF' },
      { label: this.translationService.translate('routes.stopsConfig.typeBoth'), value: 'BOTH' },
    ];
  }

  get currentDirectionStops(): RouteStop[] {
    const dir = this.activeTab();
    return this.localStops()
      .filter((s) => s.direction === dir)
      .sort((a, b) => a.sequence - b.sequence);
  }

  get stopPointSelectOptions(): SelectOption[] {
    const usedIds = new Set(
      this.localStops()
        .filter((s) => s.direction === this.activeTab())
        .map((s) => s.stopPointId)
    );

    return this.availableStopPoints
      .filter((p) => p.status === 'ACTIVE' && !usedIds.has(p.id))
      .map((p) => ({
        label: `${p.name} — ${p.address} (${p.locationName ?? ''})`,
        value: p.id,
      }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.route) {
      this.initializeStops();
    }
  }

  private initializeStops(): void {
    if (!this.route || !this.route.stops) {
      this.localStops.set([]);
      return;
    }
    // Deep clone danh sách điểm dừng để chỉnh sửa local
    const cloned = this.route.stops.map((s) => ({ ...s }));
    this.localStops.set(cloned);
    this.activeTab.set('OUTBOUND');
    this.selectedPointToAdd.set('');
  }

  setTab(tab: RouteDirectionType): void {
    this.activeTab.set(tab);
    this.selectedPointToAdd.set('');
  }

  addStop(): void {
    const pointId = this.selectedPointToAdd();
    if (!pointId) return;

    const point = this.availableStopPoints.find((p) => p.id === pointId);
    if (!point) return;

    const dir = this.activeTab();
    const currentStops = this.localStops().filter((s) => s.direction === dir);
    const nextSeq = currentStops.length + 1;

    const newStop: RouteStop = {
      stopPointId: point.id,
      stopPointCode: point.code,
      stopPointName: point.name,
      address: point.address,
      locationName: point.locationName,
      direction: dir,
      sequence: nextSeq,
      stopType: nextSeq === 1 ? 'PICKUP' : 'BOTH',
      extraPrice: 0,
      status: 'ACTIVE',
    };

    this.localStops.update((stops) => [...stops, newStop]);
    this.selectedPointToAdd.set('');
  }

  moveUp(stop: RouteStop): void {
    const dir = this.activeTab();
    const dirStops = this.localStops()
      .filter((s) => s.direction === dir)
      .sort((a, b) => a.sequence - b.sequence);

    const index = dirStops.findIndex((s) => s.stopPointId === stop.stopPointId);
    if (index <= 0) return;

    const prevStop = dirStops[index - 1];
    const tempSeq = stop.sequence;
    stop.sequence = prevStop.sequence;
    prevStop.sequence = tempSeq;

    this.reindexDirection(dir);
  }

  moveDown(stop: RouteStop): void {
    const dir = this.activeTab();
    const dirStops = this.localStops()
      .filter((s) => s.direction === dir)
      .sort((a, b) => a.sequence - b.sequence);

    const index = dirStops.findIndex((s) => s.stopPointId === stop.stopPointId);
    if (index === -1 || index >= dirStops.length - 1) return;

    const nextStop = dirStops[index + 1];
    const tempSeq = stop.sequence;
    stop.sequence = nextStop.sequence;
    nextStop.sequence = tempSeq;

    this.reindexDirection(dir);
  }

  removeStop(stop: RouteStop): void {
    const dir = this.activeTab();
    this.localStops.update((stops) =>
      stops.filter(
        (s) => !(s.direction === dir && s.stopPointId === stop.stopPointId)
      )
    );
    this.reindexDirection(dir);
  }

  updateStopType(stop: RouteStop, type: RouteStopType): void {
    stop.stopType = type;
    this.localStops.update((s) => [...s]);
  }

  updateExtraPrice(stop: RouteStop, price: number): void {
    stop.extraPrice = price >= 0 ? price : 0;
    this.localStops.update((s) => [...s]);
  }

  private reindexDirection(dir: RouteDirectionType): void {
    this.localStops.update((allStops) => {
      const otherDir = allStops.filter((s) => s.direction !== dir);
      const targetDir = allStops
        .filter((s) => s.direction === dir)
        .sort((a, b) => a.sequence - b.sequence);

      targetDir.forEach((s, idx) => {
        s.sequence = idx + 1;
      });

      return [...otherDir, ...targetDir];
    });
  }

  onSubmit(): void {
    const allStops = this.localStops();
    const inputStops: RouteStopInputDto[] = allStops.map((s) => ({
      stopPointId: s.stopPointId,
      direction: s.direction,
      sequence: s.sequence,
      stopType: s.stopType,
      extraPrice: s.extraPrice,
    }));

    this.save.emit({ stops: inputStops });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
  }

  onVisibleChange(val: boolean): void {
    this.visibleChange.emit(val);
  }
}
