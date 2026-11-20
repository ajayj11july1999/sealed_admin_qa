import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { copyText } from '../partner-api.service';
import { IssuedCredentials } from '../partner.models';

/**
 * The partner's API credentials, shown exactly once.
 *
 * sealed_partner_api stores the secrets encrypted and has no endpoint that
 * returns them again, so this dialog cannot be dismissed until the admin
 * confirms they have stored them. Nothing here is logged or kept.
 */
@Component({
  selector: 'app-credentials-dialog',
  template: `
    <h2 mat-dialog-title>Partner created — store these credentials now</h2>
    <mat-dialog-content style="max-width: 560px">
      <div class="alert alert-warning py-2">
        <i class="fa fa-triangle-exclamation me-2"></i>
        This is the only time the secrets are shown. They cannot be retrieved later — only rotated.
      </div>

      <div class="mb-3" *ngFor="let field of fields">
        <label class="form-label fw-semibold mb-1">{{ field.label }}</label>
        <div class="input-group">
          <input class="form-control font-monospace" [value]="field.value" readonly />
          <button class="btn btn-outline-secondary" type="button" (click)="copy(field.value, field.label)">
            <i class="fa fa-copy"></i>
          </button>
        </div>
        <small class="text-muted">{{ field.hint }}</small>
      </div>

      <button class="btn btn-link px-0" type="button" (click)="downloadEnv()">
        <i class="fa fa-download me-1"></i> Download as .env
      </button>

      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" id="stored" [(ngModel)]="stored" />
        <label class="form-check-label" for="stored">I have stored these credentials securely</label>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" [disabled]="!stored" [mat-dialog-close]="true">Done</button>
    </mat-dialog-actions>
  `,
})
export class CredentialsDialogComponent {
  stored = false;

  readonly fields = [
    { label: 'Key ID', value: this.credentials.keyId, hint: 'Sent as X-Api-Key. Safe to share and log.' },
    { label: 'Request signing secret', value: this.credentials.secret, hint: 'Signs every API request. Keep it in a secret manager.' },
    { label: 'Webhook signing secret', value: this.credentials.webhookSecret, hint: 'Verifies the webhooks Sealed sends the partner.' },
  ];

  constructor(@Inject(MAT_DIALOG_DATA) private credentials: IssuedCredentials, private toastr: ToastrService) {}

  copy(value: string, label: string): void {
    copyText(value).then(() => this.toastr.success(`${label} copied`));
  }

  downloadEnv(): void {
    const body = [
      `SEALED_KEY_ID=${this.credentials.keyId}`,
      `SEALED_SECRET=${this.credentials.secret}`,
      `SEALED_WEBHOOK_SECRET=${this.credentials.webhookSecret}`,
      '',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.credentials.keyId}.env`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
