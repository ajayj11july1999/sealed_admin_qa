import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-behavior-view',
  templateUrl: './user-behavior-view.component.html',
  styleUrls: ['./user-behavior-view.component.scss'],
})
export class UserBehaviorViewComponent implements OnInit {
  userId: string | null = null;
  userDetails: any = null;
  restrictions: any = null;
  cancelledOrdersAfterDriver: any[] = [];
  loading = false;
  blocking = false;

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userBehaviorViewId')
      ? JSON.parse(localStorage.getItem('userBehaviorViewId') || '""')
      : null;
    if (this.userId) {
      this.loadUserBehavior();
    } else {
      this.toastr.error('Invalid user');
      this.router.navigate(['/flagged-consumers']);
    }
  }

  loadUserBehavior(): void {
    if (!this.userId) return;
    this.loading = true;
    this.apiService
      .getUserRestrictionsDetails(this.userId)
      .then((res: any) => {
        this.loading = false;
        if (res?.status && res?.data) {
          this.userDetails = res.data.userDetails;
          this.restrictions = res.data.restrictions;
          this.cancelledOrdersAfterDriver = res.data.cancelledOrdersAfterDriver || [];
        }
      })
      .catch((err) => {
        this.loading = false;
        this.toastr.error('Failed to load user details');
      });
  }

  blockUser(): void {
    if (!this.userId) return;
    const reason = prompt('Enter block reason (optional):') || 'Blocked by admin';
    this.blocking = true;
    this.apiService
      .blockUser(this.userId, reason)
      .then((res: any) => {
        this.blocking = false;
        if (res?.status) {
          this.toastr.success('User blocked successfully');
          this.loadUserBehavior();
        } else {
          this.toastr.error(res?.message || 'Failed to block user');
        }
      })
      .catch((err) => {
        this.blocking = false;
        this.toastr.error('Failed to block user');
      });
  }

  unblockUser(): void {
    if (!this.userId) return;
    if (!confirm('Are you sure you want to unblock this user?')) return;
    this.blocking = true;
    this.apiService
      .unblockUser(this.userId)
      .then((res: any) => {
        this.blocking = false;
        if (res?.status) {
          this.toastr.success('User unblocked successfully');
          this.loadUserBehavior();
        } else {
          this.toastr.error(res?.message || 'Failed to unblock user');
        }
      })
      .catch((err) => {
        this.blocking = false;
        this.toastr.error('Failed to unblock user');
      });
  }

  backToFlagged(): void {
    this.router.navigate(['/flagged-consumers']);
  }
}
