import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fare, PartnerCostRow, Rate, rateLabel } from '../partner.models';

const MONEY = [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)];

/**
 * Edit one partner's rate for one vehicle. Starts from the partner's current
 * rate, or the vehicle's standard rate when none is set, and shows what the
 * partner would pay at a few distances beside what a B2C customer pays.
 * Closes with the new Rate, or nothing on cancel.
 */
@Component({
  selector: 'app-partner-cost-dialog',
  template: `
    <h2 mat-dialog-title>Partner rate — {{ row.name }}</h2>
    <mat-dialog-content style="max-width: 560px">
      <p class="text-muted small mb-3">
        Standard (B2C) rate: <strong>{{ standardLabel }}</strong>. Fare = base price for the first base km, then per-km beyond it.
      </p>

      <form [formGroup]="form" class="row g-3">
        <div class="col-4">
          <label class="form-label">Base price (₹)</label>
          <input type="number" min="0" step="0.01" class="form-control" formControlName="basePrice" />
        </div>
        <div class="col-4">
          <label class="form-label">Base km</label>
          <input type="number" min="0" step="0.1" class="form-control" formControlName="baseKm" />
        </div>
        <div class="col-4">
          <label class="form-label">Per km (₹)</label>
          <input type="number" min="0" step="0.01" class="form-control" formControlName="perKm" />
        </div>
      </form>
      <small class="text-danger" *ngIf="form.invalid && form.touched">Enter numbers of 0 or more, with at most 2 decimals.</small>

      <table class="table table-sm table-bordered mt-3 mb-0" *ngIf="form.valid">
        <thead>
          <tr>
            <th>Trip</th>
            <th>Partner pays</th>
            <th>B2C pays</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let km of sampleKm">
            <td>{{ km }} km</td>
            <td><strong>₹{{ partnerFare(km) | number: '1.2-2' }}</strong></td>
            <td>₹{{ standardFare(km) | number: '1.2-2' }}</td>
          </tr>
        </tbody>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Save partner rate</button>
    </mat-dialog-actions>
  `,
})
export class PartnerCostDialogComponent {
  readonly sampleKm = [3, 5, 10, 15];
  readonly standardLabel = rateLabel(this.row.standard);

  readonly form = this.fb.group({
    basePrice: [(this.row.partner ?? this.row.standard).basePrice, MONEY],
    baseKm: [(this.row.partner ?? this.row.standard).baseKm, MONEY],
    perKm: [(this.row.partner ?? this.row.standard).perKm, MONEY],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public row: PartnerCostRow,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PartnerCostDialogComponent, Rate>,
  ) {}

  partnerFare(km: number): number {
    return fare(km, this.value());
  }

  standardFare(km: number): number {
    return fare(km, this.row.standard);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.value());
  }

  private value(): Rate {
    const raw = this.form.value;
    return { basePrice: Number(raw.basePrice), baseKm: Number(raw.baseKm), perKm: Number(raw.perKm) };
  }
}
