import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Toast, ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from '../service/exportService/excelService';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { adminDateToYmd, startOfLocalDay } from '../utils/admin-date.util';

/** End date must be >= start date (Material datepicker or yyyy-MM-dd string). */
function tripDateRangeOrderValidator(
  group: AbstractControl
): ValidationErrors | null {
  const from = adminDateToYmd(group.get('fromdate')?.value);
  const to = adminDateToYmd(group.get('todate')?.value);
  if (!from || !to) {
    return null;
  }
  if (from > to) {
    return { dateRangeOrder: true };
  }
  return null;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  alltripdetails: any;
  totalCount: any;
  value: any;
  tripdetail: any;
  orderCode: any;
  offset = 0;
  limit = 9;
  fromdate: any;
  todate: any;
  tripId: any;
  searchtripidForm: any;
  searchtripDateForm: any;
  fromDate: any;
  toDate: any;
  searchLoad: boolean = false;
  private destroy$ = new Subject<void>();
  currentPage: number | undefined;
  customerList: any;
  orderStatus = [
    { id: 1, value: 'new', viewValue: 'New' },
    { id: 2, value: 'orderAssigned', viewValue: 'OrderAssigned' },
    { id: 3, value: 'orderInProgress', viewValue: 'OrderInProgress' },
    { id: 4, value: 'orderPickedUped', viewValue: 'OrderPickedUped' },
    { id: 5, value: 'delivered', viewValue: 'Delivered' },
    { id: 5, value: 'cancelled', viewValue: 'Cancelled' },



  ]
  constructor(
    private apiService: ApiServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private excelService: ExcelService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService
  ) {
    this.searchtripidForm = this.formBuilder.group({
      tripid: ['', [Validators.required]],
    });
    this.searchtripDateForm = this.formBuilder.group(
      {
        fromdate: [null, [Validators.required]],
        todate: [null, [Validators.required]],
        orderstatus: [''],
      },
      { validators: tripDateRangeOrderValidator }
    );
  }
  userInfo: any;
  userrole: any;
  showSubAdmin: boolean = true;
  selectedStatus = '';
  courierId: string = '';
  courierFilterActive: boolean = false;

  ngOnInit(): void {
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);
    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      this.showSubAdmin = false;
    } else {
      this.showSubAdmin = true;
    }
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.courierId = params['courierId'] || '';
      this.courierFilterActive = !!this.courierId;
      if (this.courierFilterActive) {
        this.getListTripByDriver();
      } else {
        this.getListAllTrip();
      }
    });
    this.getListbyB2bcustomer();
    this.searchtripDateForm
      .get('fromdate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((fromVal) => {
        const toCtrl = this.searchtripDateForm.get('todate');
        const toVal = toCtrl?.value;
        if (fromVal && toVal) {
          const f = startOfLocalDay(
            fromVal instanceof Date ? fromVal : new Date(fromVal)
          );
          const t = startOfLocalDay(toVal instanceof Date ? toVal : new Date(toVal));
          if (t.getTime() < f.getTime()) {
            toCtrl?.patchValue(f, { emitEvent: false });
          }
        }
        this.searchtripDateForm.updateValueAndValidity({ emitEvent: false });
      });
    this.searchtripDateForm
      .get('todate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((toVal) => {
        const fromCtrl = this.searchtripDateForm.get('fromdate');
        const toCtrl = this.searchtripDateForm.get('todate');
        const fromVal = fromCtrl?.value;
        if (fromVal && toVal) {
          const f = startOfLocalDay(
            fromVal instanceof Date ? fromVal : new Date(fromVal)
          );
          const t = startOfLocalDay(toVal instanceof Date ? toVal : new Date(toVal));
          if (t.getTime() < f.getTime()) {
            toCtrl?.patchValue(f, { emitEvent: false });
          }
        }
        this.searchtripDateForm.updateValueAndValidity({ emitEvent: false });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Latest calendar day allowed (local) for Material datepicker. */
  get tripDateRangeMaxDate(): Date {
    return startOfLocalDay(new Date());
  }

  /** From date cannot be after “to” or after today. */
  get fromPickerMax(): Date {
    const toVal = this.searchtripDateForm?.get('todate')?.value;
    const today = this.tripDateRangeMaxDate;
    if (!toVal) {
      return today;
    }
    const toDay = startOfLocalDay(
      toVal instanceof Date ? toVal : new Date(toVal)
    );
    return toDay.getTime() < today.getTime() ? toDay : today;
  }

  /** To date cannot be before from date. */
  get toPickerMin(): Date | null {
    const fromVal = this.searchtripDateForm?.get('fromdate')?.value;
    if (!fromVal) {
      return null;
    }
    return startOfLocalDay(
      fromVal instanceof Date ? fromVal : new Date(fromVal)
    );
  }

  private isRangeInvalid(from: unknown, to: unknown): boolean {
    const fy = adminDateToYmd(from);
    const ty = adminDateToYmd(to);
    return !!(fy && ty && fy > ty);
  }

  /** Keeps end >= start when the overlay closes. */
  normalizeTripDateRange(): void {
    const fromCtrl = this.searchtripDateForm.get('fromdate');
    const toCtrl = this.searchtripDateForm.get('todate');
    const fromVal = fromCtrl?.value;
    const toVal = toCtrl?.value;
    if (fromVal && toVal) {
      const f = startOfLocalDay(
        fromVal instanceof Date ? fromVal : new Date(fromVal)
      );
      const t = startOfLocalDay(toVal instanceof Date ? toVal : new Date(toVal));
      if (t.getTime() < f.getTime()) {
        toCtrl.patchValue(f, { emitEvent: true });
      }
    }
    this.searchtripDateForm.updateValueAndValidity();
  }

  get tripDateRangeInvalid(): boolean {
    return this.searchtripDateForm.hasError('dateRangeOrder');
  }
  getListTripByDriver() {
    this.searchLoad = true;
    this.apiService
      .getListTripByDriver(this.courierId, this.limit, this.offset)
      .then((res) => {
        this.alltripdetails = res?.data?.data ? res.data.data : [];
        this.totalCount = res?.data?.totalCount;
        this.searchLoad = false;
      })
      .catch(() => { this.searchLoad = false; });
  }

  clearDriverFilter() {
    this.router.navigate(['/search']);
  }

  getListAllTrip() {
    this.searchLoad = true;
    this.apiService
      .getListAllTrip(this.limit, this.offset)
      .then((res) => {
        this.alltripdetails = res?.data?.data ? res.data.data : [];
        this.totalCount = res?.data?.totalCount;
        this.searchLoad = false;
        console.log(this.alltripdetails);
      })
      .catch((err) => { });
  }

  getFormatTime(time: string): string {
    if (!time) return '';
    const [hour, minute, second] = time.split(':');
    const h = parseInt(hour);
    const m = parseInt(minute);
    const s = parseInt(second);

    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;

    return `${formattedHour}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s} ${ampm}`;

  }


  pageChange(e: any): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    // this.getListAllTrip();
    this.searchTripByDate();
  }
  paginationOffset(currentPage: any, itemsPerPage: any): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
  subadminId: any = [''];
  onSelectionChange(i: any) {
    console.log(i, "oooooooooooooooooooooo")
    this.subadminId = i?._id
    this.apiService.searchBySubAdmin(this.limit, this.offset, i?._id, "").then((res => {
      if (res.code = 200) {
        this.alltripdetails = res?.data?.data;
        this.totalCount = res?.data?.totalCount;

      }
    }))

  }
  clear() {
    this.searchtripidForm.reset();
    this.searchtripDateForm.reset();
    this.selectedStatus = '';
    if (this.courierFilterActive) {
      this.router.navigate(['/search']);
    } else {
      this.getListAllTrip();
    }
  }
  ordertype
  onSelectionStatusChange(i) {
    this.selectedStatus = i?.value;
    console.log(i, this.selectedStatus, "oooooooooooooooooooooo")
    this.searchTripByDate();


  }



  getListbyB2bcustomer() {

    this.apiService
      .searchFilterByb2bcustomer()
      .then((res) => {
        if (res.status = 200) {
          this.customerList = res?.data ? res?.data : [];
          console.log(this.customerList, "222222222222222");
        }

      })
      .catch((err) => { });
  }


  searchTrip() {
    this.offset = 0;
    this.tripId = this.searchtripidForm?.controls['tripid']?.value;
    this.apiService
      .searchFilterByTripId(this.tripId, this.limit, this.offset)
      .then((res) => {
        console.log(res);
        this.alltripdetails = res?.data?.data ? res.data.data : [];
        this.totalCount = res?.data?.totalCount;
      })
      .catch((err) => {
        this.toastr.error(
          err?.error?.message ? err.error.message : 'invalid Input'
        );
        console.log(err);
      });
  }

  searchTripByDate() {

    this.tripId = this.searchtripidForm?.controls['tripid'].value;
    this.searchtripDateForm.updateValueAndValidity();
    this.fromDate =
      adminDateToYmd(this.searchtripDateForm?.controls['fromdate'].value) ?? '';
    this.toDate =
      adminDateToYmd(this.searchtripDateForm?.controls['todate'].value) ?? '';
    if (this.isRangeInvalid(this.fromDate, this.toDate)) {
      this.searchtripDateForm.markAllAsTouched();
      this.toastr.warning('End date cannot be before start date.');
      return;
    }
    const orderStatusFilter =
      this.searchtripDateForm?.get('orderstatus')?.value ?? '';
    this.selectedStatus = orderStatusFilter;
    console.log(this.tripId);
    console.log(this.fromDate);
    console.log(this.toDate);

    this.apiService
      .searchFilterByDate(
        this.tripId,
        this.subadminId,
        this.fromDate,
        this.toDate,
        this.limit,
        this.offset,
        orderStatusFilter
      )
      .then((res) => {
        console.log(res);
        this.alltripdetails = res?.data?.data ? res.data.data : [];
        this.totalCount = res?.data?.totalCount;
        if (res == 200) {
          this.searchtripDateForm.reset();
          this.getListAllTrip();
        }
      })
      .catch((err) => { });
  }

  // moredetails(i: any) {
  //   console.log(i);
  //   this.router.navigate(['/trip_details', { id: i?._id }]);
  // }
  moredetails(i: any) {
  this.router.navigate(['/trip_details'], {
    queryParams: { id: i?._id }
  });
}


  async downloadExport() {
    if (!this.selectedStatus) {
      this.toastr.warning('Please Select any OrderStatus')
    } else {


      let base64String = "";
      console.log(this.fromDate, this.toDate)

      await this.apiService
        .getOrderExport(this.subadminId, this.fromDate, this.toDate, this.selectedStatus)
        .then((res) => {
          if (res.code == 200) {
            base64String = res?.data;
            // Convert the Base64 string to an ArrayBuffer
            const bytes = window.atob(base64String);
            const arrayBuffer = new ArrayBuffer(bytes.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < bytes.length; i++) {
              uint8Array[i] = bytes.charCodeAt(i);
            }

            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            const excelBlob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            let currentDate = new Date();

            saveAs(excelBlob, 'All Bookings_' + currentDate + '.xlsx');
          } else {
            this.toastr.warning(res?.message)
          }
        }).catch((err) => {
          console.log(err)
        });

    }





  }
  data: any;
  type: any;
  async cpReportsExport(item) {
    this.fromDate =
      adminDateToYmd(this.searchtripDateForm?.controls['fromdate'].value) ?? '';
    this.toDate =
      adminDateToYmd(this.searchtripDateForm?.controls['todate'].value) ?? '';
    console.log(this.fromDate, this.toDate, this.selectedStatus)

    if (!this.fromDate && !this.toDate) {
      this.toastr.warning('please Select the FromDate and ToDate')
    } else if (this.isRangeInvalid(this.fromDate, this.toDate)) {
      this.searchtripDateForm.markAllAsTouched();
      this.toastr.warning('End date cannot be before start date.');
    } else {

      this.selectedStatus = this.searchtripDateForm?.controls['orderstatus'].value;
      console.log(this.fromDate, this.toDate, this.selectedStatus)
      console.log(this.searchtripDateForm?.value)
      this.type = item;
      await this.apiService
        .getSearchExcelDownload(this.type, this.fromDate, this.toDate, this.subadminId, this.selectedStatus)
        .then((res) => {
          this.data = res?.data;

          const bytes = window.atob(this.data);
          const arrayBuffer = new ArrayBuffer(bytes.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < bytes.length; i++) {
            uint8Array[i] = bytes.charCodeAt(i);
          }

          const workbook = XLSX.read(arrayBuffer, { type: 'array' });

          const excelBlob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          if (this.type == 'summaryCP') {
            saveAs(excelBlob, 'Summary_Courier-Partner_' + this.fromDate + '-' + this.toDate + '.xlsx');
          } else {
            saveAs(excelBlob, 'Incentive_Courier-Partner_' + this.fromDate + '-' + this.toDate + '.xlsx');
          }
          this.toastr.success('Download SuccessFully');
        })
        .catch((err: any) => {
          this.toastr.error('No Records Found')
        });
    }

  }




}
