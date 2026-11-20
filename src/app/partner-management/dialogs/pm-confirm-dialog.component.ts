import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PmConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
}

/** Yes/no confirmation for the Partners screens. Closes with `true` on confirm. */
@Component({
  selector: 'app-pm-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="mb-0" style="max-width: 420px">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button [color]="data.danger ? 'warn' : 'primary'" [mat-dialog-close]="true">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class PmConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PmConfirmData) {}
}
