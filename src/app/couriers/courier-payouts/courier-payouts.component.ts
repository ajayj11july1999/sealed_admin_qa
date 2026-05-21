import { Component, OnInit, TemplateRef } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiServiceService } from 'src/app/service/api-service.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from 'src/app/service/exportService/excelService';
import { PdfService } from 'src/app/service/exportService/pdfService';
import { PrintService } from 'src/app/service/exportService/printService';
import { CopyService } from 'src/app/service/exportService/copyService';
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
  selector: 'app-courier-payouts',
  templateUrl: './courier-payouts.component.html',
  styleUrls: ['./courier-payouts.component.scss']
})
export class CourierPayoutsComponent implements OnInit {

  private readonly amountPattern = /^[0-9]+(\.[0-9]{1,2})?$/;
  private readonly controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

  payoutForm: any = {
    name: '',
    mobileNo: '',
    balanceAmount: '',
    currentAmountPaid: '',
    paymentMode: '',
    status: 'active',
    deliveryManId: "",
  };

  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  deliveryPayList: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  payoutList: any;
  isedit: boolean = false;
  id: any;
  categoryList: any = [
    { id: "1", name: "nishanth", mobileNo: "8778715348", date: "12.01.2024", status: 'B2C' },
    { id: "2", name: "nowfil", mobileNo: "8778715348", date: "12.01.2024", status: 'B2C' },
    { id: "3", name: "balaji", mobileNo: "8778715348", date: "23.01.2024", status: 'B2C' },
  ];
  userInfo: any;
  userrole: any;
  showAdd: any;
  showHistory: any;
  showExport: any;

  modalRef!: BsModalRef;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private toastr: ToastrService, private printService: PrintService, private copyService: CopyService,
    private modalService: BsModalService, private excelService: ExcelService, private pdfService: PdfService,
    private apiservice: ApiServiceService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.id = params.id;
      this.getDeliveryPay(this.limit, this.offset);
    });
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Payouts"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showHistory = getTrueViewActions(pageDetails, 'History')?.length ? true : false
        console.log(this.showHistory)
      }
    }
  }

  getDeliveryPay(limit: number, offset: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiservice.getDeliveryPay(limit, offset, this.id).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res?.code === 200 && res?.status === true) {
          this.deliveryPayList = res?.data?.data || [];
          this.totalCount = res?.data?.totalCount || 0;

          if (this.deliveryPayList.length === 0) {
            this.errorMessage = 'No Data Available';
          }
        } else {
          this.deliveryPayList = [];
          this.totalCount = 0;
          this.errorMessage = res?.message || 'No Data Available';
        }
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.deliveryPayList = [];
        this.totalCount = 0;
        this.errorMessage = 'No Data Available';
      }
    });
  }

  getlistpayouts() {
    // kept for backward compatibility, call delivery pay API under the hood
    this.getDeliveryPay(this.limit, this.offset);
  }

  create(f) {
    f.controls?.currentAmountPaid?.markAsTouched();
    f.controls?.paymentMode?.markAsTouched();

    const amount = String(this.payoutForm.currentAmountPaid ?? '').trim();

    if (!amount) {
      this.toastr.error('Payment amount is required.');
      return;
    }

    if (!this.amountPattern.test(amount)) {
      this.toastr.error('Enter a valid payment amount (e.g. 100 or 100.50).');
      return;
    }

    if (Number(amount) <= 0) {
      this.toastr.error('Payment amount must be greater than 0.');
      return;
    }

    if (!this.payoutForm.paymentMode) {
      this.toastr.error('Payment type is required.');
      return;
    }

    const payload = {
      ...this.payoutForm,
      currentAmountPaid: Number(amount),
    };
    delete payload.createdAt;

    this.apiservice.addpayout(payload, this.payoutForm._id).subscribe((res) => {
      console.log(res)
      if (res.status === 200 || res.code === 200) {
        this.toastr.success('Updated Successfully');
        this.getlistpayouts();
        this.clear();
        this.modalService.hide();
      } else {
        this.toastr.error(this.getPayoutErrorMessage(res?.message));
      }
    }, err => {
      this.toastr.error(this.getPayoutErrorMessage(err?.error?.message));
    });
  }

  private getPayoutErrorMessage(message?: string): string {
    if (!message) {
      return 'Failed to add payout. Please try again.';
    }

    if (/email|mobile/i.test(message)) {
      return 'Enter a valid payment amount.';
    }

    return message;
  }

  sanitizeAmount(value: any): string {
    if (value == null || value === '') {
      return '';
    }

    let str = String(value).replace(/[^0-9.]/g, '');
    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
      str = str.slice(0, dotIndex + 1) + str.slice(dotIndex + 1).replace(/\./g, '');
    }
    if (str.startsWith('.')) {
      str = `0${str}`;
    }

    const [intPart = '', decPart] = str.split('.');
    return decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
  }

  blockInvalidAmountKeys(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  allowNumbersOnly(event: KeyboardEvent): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }

    const char = event.key;
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(char)) {
      return true;
    }
    if (char === '.' && !input.value.includes('.')) {
      return true;
    }

    event.preventDefault();
    return false;
  }

  onAmountPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeAmount(merged);
    this.payoutForm.currentAmountPaid = sanitized;
    input.value = sanitized;
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = this.sanitizeAmount(input.value);
    this.payoutForm.currentAmountPaid = sanitized;
    input.value = sanitized;
  }

  clear() {
    this.payoutForm.name = '';
    this.payoutForm.mobileNo = '';
    this.payoutForm.balanceAmount = '';
    this.payoutForm.paymentMode = '';
    this.payoutForm.currentAmountPaid = '';
  }
  editpayout(item: any) {
    this.isedit = true;
    this.payoutForm = {
      ...item,
      currentAmountPaid: '',
      paymentMode: '',
      deliveryManId: item?.deliveryManId,
    };
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getlistpayouts();
  }
  viewHistory(item: any) {
    console.log(item, 'aaaaaaaaaaaaaaa');
    this.router.navigate(['/couriers/history', { id: item?.deliveryManId }]);
  }
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = e.pageIndex;
    this.getDeliveryPay(this.limit, this.offset);
  }

  // pageChange(e: any): void {
  //   this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
  //   // this.getB2bUserList();
  // }
  // paginationOffset(currentPage: any, itemsPerPage: any) {
  //   let offset = currentPage * itemsPerPage + 1;
  //   return (offset = offset < 0 ? offset : offset - 1);
  // }

  AddModal(template: TemplateRef<any>) {
    var aa: any = {
      backdrop: 'static', class: 'custm_modal gray modal-lg', keyboard: false, ignoreBackdropClick: true
    }
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, aa)
    );
  }

  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }

  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'deliveryPay';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'courier partner Payout' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(data, name)
      } else {
        // this.bookingInstruction = [];
      }
    })
      .catch((err: any) => {
        console.error(err);
        this.toastr.error(err?.error?.message);
      });
  }

  type: any;
  path: any;

  exportAsPdf() {
    this.path = 'deliveryPay';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'courier partner Payout' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        // this.categoryList = [];
      }
    })
      .catch((err: any) => {
        console.error(err);
      });


    // this.pdfService.exportToPDF(this.categoryList, 'categoryList')
  }

  async printTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistpayouts();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getlistpayouts();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistpayouts();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getlistpayouts();
    }, 1000);

  }
}



