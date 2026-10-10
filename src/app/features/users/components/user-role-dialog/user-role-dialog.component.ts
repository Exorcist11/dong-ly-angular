import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Checkbox } from 'primeng/checkbox';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { Role, User } from '../../models/user.model';

@Component({
  selector: 'app-user-role-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, Dialog, Button, Tag, Checkbox],
  templateUrl: './user-role-dialog.component.html',
  styleUrl: './user-role-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRoleDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() user: User | null = null;
  @Input() availableRoles: Role[] = [];
  @Input() submitting = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saveRoles = new EventEmitter<{ userId: string; roleCodes: string[] }>();

  selectedRoleCodes: Set<string> = new Set();
  initialRoleCodes: Set<string> = new Set();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.user) {
      const current = this.user.roles ?? [];
      this.selectedRoleCodes = new Set(current);
      this.initialRoleCodes = new Set(current);
    }
  }

  isRoleSelected(code: string): boolean {
    return this.selectedRoleCodes.has(code);
  }

  toggleRole(code: string): void {
    if (this.selectedRoleCodes.has(code)) {
      this.selectedRoleCodes.delete(code);
    } else {
      this.selectedRoleCodes.add(code);
    }
    this.selectedRoleCodes = new Set(this.selectedRoleCodes);
  }

  get addedRoles(): string[] {
    return Array.from(this.selectedRoleCodes).filter((c) => !this.initialRoleCodes.has(c));
  }

  get removedRoles(): string[] {
    return Array.from(this.initialRoleCodes).filter((c) => !this.selectedRoleCodes.has(c));
  }

  get hasChanges(): boolean {
    return this.addedRoles.length > 0 || this.removedRoles.length > 0;
  }

  onVisibleChange(val: boolean): void {
    this.visible = val;
    this.visibleChange.emit(val);
  }

  onCancel(): void {
    this.onVisibleChange(false);
  }

  onSave(): void {
    if (!this.user || !this.hasChanges) return;

    this.saveRoles.emit({
      userId: this.user.id,
      roleCodes: Array.from(this.selectedRoleCodes),
    });
  }
}
