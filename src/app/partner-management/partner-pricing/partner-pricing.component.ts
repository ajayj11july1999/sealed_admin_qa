import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PartnerCostDialogComponent } from '../dialogs/partner-cost-dialog.component';
import { PmConfirmDialogComponent } from '../dialogs/pm-confirm-dialog.component';
import { PartnerApiService, partnerApiError } from '../partner-api.service';
import { CostPreview, PartnerCostRow, Rate, rateLabel } from '../partner.models';

interface PreviewStop {
  latitude: number | null;
  longitude: number | null;
}

/**
 * A partner's price per vehicle (`partner_cost`). A vehicle with no partner
 * rate is billed at its standard B2C rate; setting one changes only that
 * vehicle for only this partner.
 */
@Component({
  selector: 'app-partner-pricing',
  templateUrl: './partner-pricing.component.html',
})
export class PartnerPricingComponent implements OnInit {
  @Input() keyId = '';

  rows: PartnerCostRow[] = [];
  loading = false;
  error: string | null = null;
  busyVehicleId: string | null = null;

  showPreview = false;
  pickup: PreviewStop = { latitude: null, longitude: null };
  drops: PreviewStop[] = [{ latitude: null, longitude: null }];
  previewing = false;
  preview: CostPreview | null = null;

  readonly rateLabel = rateLabel;

  constructor(private api: PartnerApiService, private dialog: MatDialog, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  get customCount(): number {
    return this.rows.filter(row => row.partner).length;
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.listCosts(this.keyId).subscribe({
      next: rows => {
        this.rows = rows;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = partnerApiError(err);
      },
    });
  }

  edit(row: PartnerCostRow): void {
    this.dialog
      .open(PartnerCostDialogComponent, { data: row, width: '600px' })
      .afterClosed()
      .subscribe((rate: Rate | undefined) => {
        if (!rate) {
          return;
        }
        this.busyVehicleId = row.vehicleId;
        this.api.setCost(this.keyId, row.vehicleId, rate).subscribe({
          next: updated => {
            this.busyVehicleId = null;
            this.rows = this.rows.map(r => (r.vehicleId === updated.vehicleId ? updated : r));
            this.toastr.success(`${row.name}: ${rateLabel(rate)}`, 'Partner rate saved');
          },
          error: err => {
            this.busyVehicleId = null;
            this.toastr.error(partnerApiError(err), 'Save partner rate');
          },
        });
      });
  }

  reset(row: PartnerCostRow): void {
    this.dialog
      .open(PmConfirmDialogComponent, {
        data: {
          title: `Reset ${row.name} to the standard rate?`,
          message: `This partner will pay the standard B2C rate (${rateLabel(row.standard)}) on ${row.name} from the next price they request.`,
          confirmText: 'Reset to standard',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }
        this.busyVehicleId = row.vehicleId;
        this.api.removeCost(this.keyId, row.vehicleId).subscribe({
          next: () => {
            this.busyVehicleId = null;
            this.rows = this.rows.map(r => (r.vehicleId === row.vehicleId ? { ...r, partner: null } : r));
            this.toastr.success(`${row.name} is back on the standard rate`);
          },
          error: err => {
            this.busyVehicleId = null;
            this.toastr.error(partnerApiError(err), 'Reset partner rate');
          },
        });
      });
  }

  addDrop(): void {
    if (this.drops.length < 15) {
      this.drops.push({ latitude: null, longitude: null });
    }
  }

  removeDrop(index: number): void {
    if (this.drops.length > 1) {
      this.drops.splice(index, 1);
    }
  }

  get previewReady(): boolean {
    return [this.pickup, ...this.drops].every(stop => isCoordinate(stop.latitude, 90) && isCoordinate(stop.longitude, 180));
  }

  runPreview(): void {
    if (!this.previewReady) {
      this.toastr.warning('Enter a latitude and longitude for the pickup and every drop.');
      return;
    }
    this.previewing = true;
    this.preview = null;
    const point = (stop: PreviewStop) => ({ latitude: Number(stop.latitude), longitude: Number(stop.longitude) });
    this.api.previewCost(this.keyId, point(this.pickup), this.drops.map(point)).subscribe({
      next: preview => {
        this.preview = preview;
        this.previewing = false;
      },
      error: err => {
        this.previewing = false;
        this.toastr.error(partnerApiError(err), 'Price check');
      },
    });
  }
}

function isCoordinate(value: number | null, limit: number): boolean {
  return value !== null && value !== undefined && String(value) !== '' && Math.abs(Number(value)) <= limit;
}
