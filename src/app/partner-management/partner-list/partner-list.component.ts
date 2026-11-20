import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PartnerApiService, partnerApiError } from '../partner-api.service';
import { Partner } from '../partner.models';

/** Every API partner, newest first, with a client-side filter. */
@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
})
export class PartnerListComponent implements OnInit {
  partners: Partner[] = [];
  search = '';
  loading = false;
  error: string | null = null;

  constructor(private api: PartnerApiService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  get filtered(): Partner[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.partners;
    }
    return this.partners.filter(p => p.name.toLowerCase().includes(term) || p.keyId.toLowerCase().includes(term));
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.listPartners().subscribe({
      next: partners => {
        this.partners = [...partners].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = partnerApiError(err);
        this.toastr.error(this.error, 'Partners');
      },
    });
  }
}
