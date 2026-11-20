import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PmConfirmDialogComponent, PmConfirmData } from '../dialogs/pm-confirm-dialog.component';
import { copyText, PartnerApiService, partnerApiError } from '../partner-api.service';
import { Partner, PartnerStatus } from '../partner.models';

const STATUS_CONFIRM: Record<PartnerStatus, PmConfirmData> = {
  active: {
    title: 'Activate partner?',
    message: 'The partner’s API key and portal logins start working again immediately.',
    confirmText: 'Activate',
  },
  suspended: {
    title: 'Suspend partner?',
    message: 'Every API request and portal session for this partner is refused until you activate it again. Reversible.',
    confirmText: 'Suspend',
    danger: true,
  },
  revoked: {
    title: 'Revoke partner?',
    message: 'Use this for a leaked or retired key. The partner is locked out of the API and the portal. Treat it as permanent.',
    confirmText: 'Revoke',
    danger: true,
  },
};

/** One partner: identity and status, with its pricing and portal logins as tabs. */
@Component({
  selector: 'app-partner-detail',
  templateUrl: './partner-detail.component.html',
})
export class PartnerDetailComponent implements OnInit {
  keyId = '';
  partner: Partner | null = null;
  loading = false;
  notFound = false;
  error: string | null = null;
  updatingStatus = false;

  constructor(
    private route: ActivatedRoute,
    private api: PartnerApiService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.keyId = params.get('keyId') ?? '';
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.notFound = false;
    this.error = null;
    this.api.getPartner(this.keyId).subscribe({
      next: partner => {
        this.partner = partner;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.notFound = true;
          return;
        }
        this.error = partnerApiError(err);
      },
    });
  }

  copyKeyId(): void {
    copyText(this.keyId).then(() => this.toastr.success('Key ID copied'));
  }

  setStatus(status: PartnerStatus): void {
    this.dialog
      .open(PmConfirmDialogComponent, { data: STATUS_CONFIRM[status] })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }
        this.updatingStatus = true;
        this.api.setPartnerStatus(this.keyId, status).subscribe({
          next: partner => {
            this.partner = partner;
            this.updatingStatus = false;
            this.toastr.success(`Partner is now ${partner.status}`);
          },
          error: err => {
            this.updatingStatus = false;
            this.toastr.error(partnerApiError(err), 'Update status');
          },
        });
      });
  }
}
