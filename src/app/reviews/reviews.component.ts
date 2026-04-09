import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogueComponent } from '../dialogue/dialogue.component';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CopyService } from '../service/exportService/copyService';
import { PrintService } from '../service/exportService/printService';
import { PdfService } from '../service/exportService/pdfService';
import { ExcelService } from '../service/exportService/excelService';
import { NgxSpinnerService } from 'ngx-spinner';

interface Action {
  name: string;
  check: boolean;
}
interface Page {
  page_name: string;
  name_type: string;
  action: Action[];
}
@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  reviewList: any[] = [];
  allReviewList: any[] = [];
  selectedReviewerType: string = '';
  selectedRating: string = '';
  modalRef!: BsModalRef;
  createForm: any;
  showAdd: any;
  showEdit: any;
  showDelete: any;
  userInfo: any;
  userrole: any;
  limit: any = 15;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  serverTotalCount: number = 0;

  constructor(private dialog: MatDialog, private apiservice: ApiServiceService,
    private modalService: BsModalService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private copyService: CopyService, private printService: PrintService, private pdfService: PdfService,
    private excelService: ExcelService, private router: Router) {
    // this.createForm=this.formBuilder.

  }

  ngOnInit(): void {
    this.getReviewList();

    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Review & Rating"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        console.log(this.showEdit)
        this.showDelete = getTrueViewActions(pageDetails, 'Delete')?.length ? true : false
        console.log(this.showDelete)
      }
    }
  }
  get f(): { [key: string]: AbstractControl } {
    return this.createForm.controls;
  }
  cancel() {
    this.modalRef.hide();
    this.getReviewList();

  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getReviewList();
  }

  onReviewerTypeChange() {
    this.applyReviewFilters();
  }

  onRatingChange() {
    this.applyReviewFilters();
  }

  getReviewFlow(reviewerType: string): string {
    const normalizedType = (reviewerType || '').toLowerCase();
    return normalizedType === 'delivery_man' || normalizedType === 'deliveryman'
      ? 'Delivery Partner → Customer'
      : 'Customer → Delivery Partner';
  }

  getDisplayUserType(type: string): string {
    const normalizedType = (type || '').toLowerCase();
    if (normalizedType === 'delivery_man' || normalizedType === 'deliveryman') {
      return 'Delivery Partner';
    }
    if (normalizedType === 'user') {
      return 'Customer';
    }
    return type ? type.replace(/_/g, ' ') : '-';
  }

  getStars(rating: number): string {
    const starCount = Math.max(0, Math.min(5, Number(rating) || 0));
    return starCount ? '⭐'.repeat(starCount) : '-';
  }

  applyReviewFilters() {
    let filtered = [...(this.allReviewList || [])];

    if (this.selectedReviewerType) {
      filtered = filtered.filter((item: any) =>
        (item?.reviewer_type || '').toLowerCase() === this.selectedReviewerType.toLowerCase()
      );
    }

    if (this.selectedRating !== '') {
      filtered = filtered.filter((item: any) => Number(item?.rating) === Number(this.selectedRating));
    }

    this.reviewList = filtered;
    this.totalCount = this.selectedReviewerType || this.selectedRating ? filtered.length : this.serverTotalCount;
  }

  getReviewList() {
    this.spinner.show();

    this.apiservice
      .getReviewList(this.limit, this.offset, this.value)
      .then((res: any) => {
        this.spinner.hide();

        if (res?.code == 200) {
          const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
          this.allReviewList = list;
          this.serverTotalCount = res?.totalCount ?? res?.data?.totalCount ?? list.length;
          this.applyReviewFilters();
          console.log('Review list:', this.reviewList);
        } else {
          this.reviewList = [];
          this.allReviewList = [];
          this.totalCount = 0;
          this.serverTotalCount = 0;
        }
      })
      .catch((err: any) => {
        this.spinner.hide();
        this.reviewList = [];
        this.allReviewList = [];
        this.totalCount = 0;
        this.serverTotalCount = 0;

        if (err?.status === 401 || err?.error?.statusCode === 401) {
          this.toastr.error('Session expired. Please login again.');
          this.router.navigate(['/login']);
          return;
        }

        this.toastr.error(err?.error?.message || 'Failed to load reviews');
      });
  }
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getReviewList();
  }

  async copyTable(): Promise<void> {
    await this.copyService.copyTableText('#reviewTable');
  }

  exportAsXLSX() {
    // Export functionality not implemented
  }

  exportAsPdf() {
    // Export functionality not implemented
  }
}