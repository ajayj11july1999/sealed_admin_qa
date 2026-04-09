import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-flagged-consumers',
  templateUrl: './flagged-consumers.component.html',
  styleUrls: ['./flagged-consumers.component.scss'],
})
export class FlaggedConsumersComponent implements OnInit {
  flaggedList: any[] = [];
  totalCount = 0;
  limit = 20;
  offset = 0;
  loading = false;

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadFlaggedUsers();
  }

  loadFlaggedUsers(): void {
    this.loading = true;
    this.apiService
      .getFlaggedUsers(this.limit, this.offset)
      .then((res: any) => {
        this.loading = false;
        if (res?.status && res?.data) {
          this.flaggedList = res.data.data || [];
          this.totalCount = res.data.totalCount || 0;
        } else {
          this.flaggedList = [];
          this.totalCount = 0;
        }
      })
      .catch((err) => {
        this.loading = false;
        this.flaggedList = [];
        this.totalCount = 0;
        this.toastr.error('Failed to load flagged users');
      });
  }

  pageChange(e: any): void {
    this.offset = e.pageIndex * e.pageSize;
    this.limit = e.pageSize;
    this.loadFlaggedUsers();
  }

  viewUserBehavior(item: any): void {
    const userId = item?.userId?._id || item?.userId;
    if (userId) {
      localStorage.setItem('userBehaviorViewId', JSON.stringify(userId));
      this.router.navigate(['/user-behavior-view']);
    }
  }

  getDisplayName(item: any): string {
    const u = item?.userId;
    if (!u) return 'Unknown';
    if (typeof u === 'object') return u.name || u.mobileNo || u.email || 'Unknown';
    return 'Unknown';
  }

  getDisplayMobile(item: any): string {
    const u = item?.userId;
    if (!u) return '-';
    if (typeof u === 'object') return u.mobileNo || '-';
    return '-';
  }

  getDisplayEmail(item: any): string {
    const u = item?.userId;
    if (!u) return '-';
    if (typeof u === 'object') return u.email || '-';
    return '-';
  }

  backToCustomers(): void {
    this.router.navigate(['/customers']);
  }
}
