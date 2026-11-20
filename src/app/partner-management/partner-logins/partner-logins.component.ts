import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import {
  PartnerLoginDialogComponent,
  PartnerLoginDialogData,
  PartnerLoginDialogResult,
} from '../dialogs/partner-login-dialog.component';
import { PmConfirmDialogComponent } from '../dialogs/pm-confirm-dialog.component';
import { PartnerApiService, partnerApiError } from '../partner-api.service';
import { PartnerUser } from '../partner.models';

/**
 * The people at this partner who can sign in to the partner portal. Partners
 * can't create their own logins; an admin creates each one and shares the
 * password with them.
 */
@Component({
  selector: 'app-partner-logins',
  templateUrl: './partner-logins.component.html',
})
export class PartnerLoginsComponent implements OnInit {
  @Input() keyId = '';

  users: PartnerUser[] = [];
  loading = false;
  error: string | null = null;
  busyUserId: string | null = null;

  constructor(private api: PartnerApiService, private dialog: MatDialog, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.listUsers(this.keyId).subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = partnerApiError(err);
      },
    });
  }

  create(): void {
    this.openLoginDialog({ mode: 'create' }).subscribe(result => {
      if (!result) {
        return;
      }
      this.api.createUser(this.keyId, result).subscribe({
        next: user => {
          this.users = [...this.users, user];
          this.toastr.success(`Share the password with ${user.email} securely — it isn't shown again.`, 'Login created');
        },
        error: err => this.toastr.error(partnerApiError(err), 'Create login'),
      });
    });
  }

  resetPassword(user: PartnerUser): void {
    this.openLoginDialog({ mode: 'reset', email: user.email }).subscribe(result => {
      if (!result) {
        return;
      }
      this.busyUserId = user.id;
      this.api.setUserPassword(this.keyId, user.id, result.password).subscribe({
        next: () => {
          this.busyUserId = null;
          this.toastr.success(`New password set for ${user.email}`);
        },
        error: err => {
          this.busyUserId = null;
          this.toastr.error(partnerApiError(err), 'Reset password');
        },
      });
    });
  }

  toggle(user: PartnerUser): void {
    const disabling = user.status === 'active';
    this.dialog
      .open(PmConfirmDialogComponent, {
        data: {
          title: disabling ? `Disable ${user.email}?` : `Enable ${user.email}?`,
          message: disabling
            ? 'They are signed out of the partner portal on their next click and cannot sign in until enabled again.'
            : 'They can sign in to the partner portal again with their current password.',
          confirmText: disabling ? 'Disable' : 'Enable',
          danger: disabling,
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }
        this.busyUserId = user.id;
        this.api.setUserStatus(this.keyId, user.id, disabling ? 'disabled' : 'active').subscribe({
          next: updated => {
            this.busyUserId = null;
            this.users = this.users.map(u => (u.id === updated.id ? updated : u));
          },
          error: err => {
            this.busyUserId = null;
            this.toastr.error(partnerApiError(err), 'Update login');
          },
        });
      });
  }

  private openLoginDialog(data: PartnerLoginDialogData): Observable<PartnerLoginDialogResult | undefined> {
    return this.dialog
      .open<PartnerLoginDialogComponent, PartnerLoginDialogData, PartnerLoginDialogResult>(PartnerLoginDialogComponent, {
        data,
        width: '520px',
      })
      .afterClosed();
  }
}
