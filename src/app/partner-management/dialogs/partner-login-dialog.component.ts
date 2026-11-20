import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { copyText, generatePassword } from '../partner-api.service';

export interface PartnerLoginDialogData {
  mode: 'create' | 'reset';
  email?: string;
}

export interface PartnerLoginDialogResult {
  email: string;
  name?: string;
  password: string;
}

/** Create a partner portal login, or set a new password on one. */
@Component({
  selector: 'app-partner-login-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New portal login' : 'Reset password — ' + data.email }}</h2>
    <mat-dialog-content style="max-width: 480px">
      <form [formGroup]="form" class="d-flex flex-column gap-3">
        <ng-container *ngIf="data.mode === 'create'">
          <div>
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="ops@partner.com" />
            <small class="text-danger" *ngIf="form.controls.email.invalid && form.controls.email.touched">Enter a valid email.</small>
          </div>
          <div>
            <label class="form-label">Name <span class="text-muted">(optional)</span></label>
            <input type="text" class="form-control" formControlName="name" maxlength="120" />
          </div>
        </ng-container>
        <div>
          <label class="form-label">Password</label>
          <div class="input-group">
            <input type="text" class="form-control font-monospace" formControlName="password" autocomplete="new-password" />
            <button class="btn btn-outline-secondary" type="button" (click)="generate()" title="Generate">
              <i class="fa fa-wand-magic-sparkles"></i>
            </button>
            <button class="btn btn-outline-secondary" type="button" (click)="copy()" title="Copy">
              <i class="fa fa-copy"></i>
            </button>
          </div>
          <small class="text-muted">At least 12 characters. Share it with the partner securely — it isn't shown again.</small>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.mode === 'create' ? 'Create login' : 'Set password' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class PartnerLoginDialogComponent {
  readonly form = this.fb.group({
    email: [this.data.email ?? '', this.data.mode === 'create' ? [Validators.required, Validators.email, Validators.maxLength(254)] : []],
    name: [''],
    password: [generatePassword(), [Validators.required, Validators.minLength(12), Validators.maxLength(256)]],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PartnerLoginDialogData,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<PartnerLoginDialogComponent, PartnerLoginDialogResult>,
  ) {}

  generate(): void {
    this.form.controls.password.setValue(generatePassword());
  }

  copy(): void {
    copyText(this.form.controls.password.value).then(() => this.toastr.success('Password copied'));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, name, password } = this.form.value;
    this.dialogRef.close({
      email: String(email).trim().toLowerCase(),
      ...(String(name ?? '').trim() ? { name: String(name).trim() } : {}),
      password,
    });
  }
}
