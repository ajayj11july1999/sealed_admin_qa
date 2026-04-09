import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import * as XLSX from 'xlsx';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogueComponent } from '../dialogue/dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CopyService } from '../service/exportService/copyService';
import { ExcelService } from '../service/exportService/excelService';
import { PrintService } from '../service/exportService/printService';
import { PdfService } from '../service/exportService/pdfService';

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
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss']
})
export class CouponComponent implements OnInit {


  limit: any;
  offset: any;
  value: any;
  currentPage: any;
  totalCount: any;
  databaseList: any = []
  modalRef!: BsModalRef;
  isedit = false;
  couponform: any = {
    "name": "",
    "amount": '',
    "type": "",
    "startDate": "",
    "endDate": "",
    "status": "",
    "_id": null
  }
  userInfo: any;
  userrole: any;
  showAdd: any;
  showEdit: any;

  showDelete: any;
  showExport: any;
  constructor(private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService, private copyService: CopyService, private excelService: ExcelService,
    public spinner: NgxSpinnerService, private printService: PrintService, private pdfService: PdfService,
    private apiservice: ApiServiceService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getlistCoupon();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')
      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Manage Coupon"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        console.log(this.showEdit)
        this.showDelete = getTrueViewActions(pageDetails, 'Delete')?.length ? true : false
        console.log(this.showDelete)
      }
    }
  }

  editTerms(item: any) {
    this.isedit = true;
    this.couponform = item;
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getlistCoupon();
  }

  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getlistCoupon();
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

  getlistCoupon() {
    this.limit = 9;
    this.offset = 0;
    this.apiservice.getlistCoupon(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.databaseList = res.data?.data;
          this.totalCount = res?.data?.totalCount;

          // this.searchLoad = false;
        } else {
          this.databaseList = [];
        }
      })
      .catch((err: any) => { });
  }

  addCoupon(f) {
    if (f.form.valid) {
      this.apiservice.createCoupon(this.couponform, this.couponform._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.getlistCoupon();
          this.modalRef.hide();
        } else {
          this.toastr.error(result.message);
        }

        this.spinner.hide();

      }, err => {
        this.spinner.hide();
      })
    }
    else {
      this.toastr.warning('Please fill all the required fields');
    }
  }

  clear() {
    this.isedit = false;
    this.couponform.name = '';
    this.couponform.amount = '',
      this.couponform.type = '';
    this.couponform.startDate = '';
    this.couponform.endDate = '';
    this.couponform.status = '';
    this.couponform._id = null

  }
  cancel() {
    // this.isedit = false;
    // this.clear();
    this.modalRef.hide();
    this.getlistCoupon();
  }


  deleteUserList(i?: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.apiservice.deleteCoupon(i._id).subscribe((res) => {

          if (res.code == 200) {
            this.toastr.success(res.message);
            this.getlistCoupon();
          } else {
            this.toastr.error(res.message);
          }

        }),
          (err) => { };
      }
    });
  }

  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'couponMaster';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'couponList' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(data, name)
      } else {
        this.databaseList = [];
      }
    })
      .catch((err: any) => { });


  }
  type: any;
  path: any;

  exportAsPdf() {
    this.path = 'couponMaster';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'CouponList' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        this.databaseList = [];
      }
    })
      .catch((err: any) => { });


    // this.pdfService.exportToPDF(this.categoryList, 'categoryList')
  }


  async printTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistCoupon();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getlistCoupon();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistCoupon();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getlistCoupon();
    }, 1000);

  }
}


