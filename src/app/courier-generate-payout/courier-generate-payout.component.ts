import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ExcelService } from '../service/exportService/excelService';
import { PdfService } from '../service/exportService/pdfService';
import { adminDateToYmd, startOfLocalDay } from '../utils/admin-date.util';

@Component({
  selector: 'app-courier-generate-payout',
  templateUrl: './courier-generate-payout.component.html',
  styleUrls: ['./courier-generate-payout.component.scss'],
})
export class CourierGeneratePayoutComponent implements OnInit {
  deliveryman: any;
  completetripdetails: any;
  courierId: any;
  id: any;
  paymentMode: any;
  paymentStatus: any;
  fromDate: any;
  toDate: any;
  searchtripDateForm: any;
  totalCount: any = 0;
  name: any;
  totalAmount: any;
  paymentstatus: any;
  _id: any;
  tripidarray: any = [];
  userId: any;
  paid: boolean = false;
  constructor(
    private apiService: ApiServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private pdfService: PdfService
  ) {
    this.searchtripDateForm = this.formBuilder.group({
      fromdate: [null, [Validators.required]],
      todate: [null, [Validators.required]],
    });
  }

  get payoutFiltersToday(): Date {
    return startOfLocalDay(new Date());
  }

  get payoutFromPickerMax(): Date {
    const toVal = this.searchtripDateForm?.get('todate')?.value;
    const today = this.payoutFiltersToday;
    if (!toVal) {
      return today;
    }
    const toDay = startOfLocalDay(
      toVal instanceof Date ? toVal : new Date(toVal)
    );
    return toDay.getTime() < today.getTime() ? toDay : today;
  }

  get payoutToPickerMin(): Date | null {
    const fromVal = this.searchtripDateForm?.get('fromdate')?.value;
    if (!fromVal) {
      return null;
    }
    return startOfLocalDay(
      fromVal instanceof Date ? fromVal : new Date(fromVal)
    );
  }

  private formatDate(date: Date): string {
    return adminDateToYmd(date) ?? '';
  }

  private controlToYmd(val: unknown): string {
    return adminDateToYmd(val) ?? '';
  }

  private setDefaultDateRange(): void {
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    const from = last30Days;
    const to = today;

    this.searchtripDateForm.patchValue({
      fromdate: from,
      todate: to,
    });

    this.fromDate = this.formatDate(from);
    this.toDate = this.formatDate(to);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.id = params.id;
      this.setDefaultDateRange();
      this.getCompletedTripList();
    });
    this.userId = localStorage.getItem('useridA')
      ? JSON.parse(localStorage.getItem('useridA') || '')
      : '';
  }

  getCompletedTripList() {
    this.paymentMode = 'cash on delivery,cash on pickup';
    this.paymentStatus = 'CODcompleted,COPcompleted';
    this.fromDate =
      this.controlToYmd(this.searchtripDateForm.controls['fromdate'].value) ||
      this.fromDate;
    this.toDate =
      this.controlToYmd(this.searchtripDateForm.controls['todate'].value) ||
      this.toDate;
    this.tripidarray = [];
    this.apiService
      .getCompletedTripList(
        this.id,
        this.paymentMode,
        this.paymentStatus,
        this.fromDate,
        this.toDate
      )
      .then((res) => {
        this.completetripdetails = res?.data?.data ? res.data.data : [];
        this.totalCount = res?.data?.totalCount || 0;
        console.log(res.data.data);

        for (let i of res.data.data) {
          var items = i._id;
          this.tripidarray.push(items);
        }
        console.log(this.tripidarray);
        this.totalAmount = this.completetripdetails.reduce(
          (accumulator, currentItem) => {
            return accumulator + currentItem.amountDetails.finalAmount;
          },
          0
        );
        console.log(this.totalAmount);
        console.log(this.completetripdetails?.length);
      })
      .catch((err) => { });
  }

  moredetails(i: any) {
    this.router.navigate(['/trip_details', { id: i?._id }]);
  }

  updatePaymentStatus() {
    let payload = {
      orderIds: this.tripidarray,
      noOfOrders: this.totalCount,
      totalAmount: this.totalAmount,
      paidById: this.id,
      receivedById: this.userId,
      paid: true,
    };

    this.apiService.updatePaymentStatus(payload).subscribe(
      (response) => {
        this.paymentstatus = response.data;
        console.log(this.paymentstatus);
        if (response.code == 200) {
          console.log('success');
          this.getCompletedTripList();
        }
      },
      (err) => {
        console.error('Update payment error', err);
      }
    );
  }

  exportPayoutHistory(): void {
    this.apiService
      .getPdfExcelHistoryDownload('deliveryPay', 'excel', this.id)
      .then((res: any) => {
        if (res?.code === 200) {
          const data = res.data;
          const name = `courier-payout-history_${this.id}_${Date.now()}`;
          this.excelService.downloadBase64ExcelFile(data, name);
        } else {
          console.error('Export failed', res);
        }
      })
      .catch((err) => {
        console.error('Export error', err);
      });
  }
}

