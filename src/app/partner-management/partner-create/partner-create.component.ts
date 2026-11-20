import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CredentialsDialogComponent } from '../dialogs/credentials-dialog.component';
import { PartnerApiService, partnerApiError } from '../partner-api.service';
import { B2bCustomer, CreatePartnerPayload } from '../partner.models';

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/** One IPv4 / IPv4-CIDR / IPv6 entry per line or comma. Empty is allowed. */
function ipAllowlistValidator(control: AbstractControl): ValidationErrors | null {
  const bad = splitList(control.value).filter(entry => !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(entry) && !entry.includes(':'));
  return bad.length ? { ipList: bad[0] } : null;
}

function splitList(value: unknown): string[] {
  return String(value ?? '')
    .split(/[\n,]/)
    .map(entry => entry.trim())
    .filter(Boolean);
}

/**
 * Onboard a partner: who they are, which sealed_new_b account owns their
 * orders, and where their webhooks go. The API answers with the credentials
 * exactly once; they are shown in a dialog that can't be dismissed unread.
 */
@Component({
  selector: 'app-partner-create',
  templateUrl: './partner-create.component.html',
})
export class PartnerCreateComponent implements OnInit {
  customers: B2bCustomer[] = [];
  customersLoading = false;
  manualActor = false;
  saving = false;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    env: ['test', Validators.required],
    coreActorId: ['', [Validators.required, Validators.pattern(OBJECT_ID)]],
    defaultWebhookUrl: ['', Validators.pattern(/^https:\/\/\S+$/)],
    ipAllowlist: ['', ipAllowlistValidator],
  });

  constructor(
    private api: PartnerApiService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.customersLoading = true;
    this.api.listB2bCustomers().subscribe({
      next: customers => {
        this.customers = customers;
        this.customersLoading = false;
        // No customers to pick from (or none verified yet): fall back to typing the id.
        if (!customers.length) {
          this.manualActor = true;
        }
      },
      error: () => {
        this.customersLoading = false;
        this.manualActor = true;
      },
    });
  }

  invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Fill in the highlighted fields.');
      return;
    }

    const value = this.form.value;
    const ipAllowlist = splitList(value.ipAllowlist);
    const webhook = String(value.defaultWebhookUrl ?? '').trim();

    // Optional fields are omitted, never sent empty: the API rejects unknown or empty values.
    const payload: CreatePartnerPayload = {
      name: String(value.name).trim(),
      env: value.env,
      coreActorId: String(value.coreActorId).trim(),
      ...(ipAllowlist.length ? { ipAllowlist } : {}),
      ...(webhook ? { defaultWebhookUrl: webhook } : {}),
    };

    this.saving = true;
    this.api.createPartner(payload).subscribe({
      next: credentials => {
        this.saving = false;
        this.dialog
          .open(CredentialsDialogComponent, { data: credentials, disableClose: true, width: '600px' })
          .afterClosed()
          .subscribe(() => this.router.navigate(['/partners-api', credentials.keyId]));
      },
      error: err => {
        this.saving = false;
        this.toastr.error(partnerApiError(err), 'Create partner');
      },
    });
  }
}
