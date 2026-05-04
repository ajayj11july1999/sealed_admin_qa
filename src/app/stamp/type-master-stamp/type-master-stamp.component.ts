import { Component, OnInit, TemplateRef } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/service/api-service.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PrintService } from 'src/app/service/exportService/printService';
import { CopyService } from 'src/app/service/exportService/copyService';
import { ExcelService } from 'src/app/service/exportService/excelService';
import { PdfService } from 'src/app/service/exportService/pdfService';

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
  selector: 'app-type-master-stamp',
  templateUrl: './type-master-stamp.component.html',
  styleUrls: ['./type-master-stamp.component.scss']
})
export class TypeMasterStampComponent implements OnInit {
  statuses = [
    { name: 'Active', value: 'active' },
    { name: 'Inactive', value: 'inactive' },
    // { name: 'Pending', value: 'pending' }
  ];
  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  databaseList: any = []
  modalRef!: BsModalRef;
  isedit = false;
  createForm: any = {
    "name": "",
    "amount": '',
    "type": "",
    "_id": null
  }
  userrole: any;
  userInfo: any;
  showAdd: any;
  showEdit: any;
  constructor(private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService, private copyService: CopyService, private pdfService: PdfService, private excelService: ExcelService,
    public spinner: NgxSpinnerService, private printService: PrintService,
    private apiservice: ApiServiceService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getlistTypeStamp();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Stamp"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add Stamp Type')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit Stamp Type ')?.length ? true : false
        console.log(this.showEdit)

      }
    }
  }

  allowOnlyAlphabets(event: KeyboardEvent): boolean {
    const pattern = /^[A-Za-z\s]$/;
    return pattern.test(event.key);
  }

  editTerms(item: any) {
    this.isedit = true;
    this.createForm = { ...item };
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getlistTypeStamp();
  }

  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex;
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo * this.pageSize;
    this.getlistTypeStamp();
  }


  AddModal(template: TemplateRef<any>) {
    var aa: any = {
      backdrop: 'static', class: 'custm_modal gray modal-lg', keyboard: false, ignoreBackdropClick: true
    }
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, aa)
    );
  }

  getlistTypeStamp() {

    this.apiservice.getlistTypeStamp(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.databaseList = res.data?.data;
          this.totalCount = res?.data?.totalCount;


        } else {
          this.databaseList = [];
        }
      })
      .catch((err: any) => { });
  }

  createTypeStamp(f) {
    if (f.form.valid) {
      const trimmedName = this.createForm.name?.trim().toLowerCase();
      const namePattern = /^[A-Za-z\s]+$/;
      if (!namePattern.test(this.createForm.name?.trim())) {
        this.toastr.error('Type Name should contain only alphabets.');
        return;
      }
      const isDuplicate = this.databaseList.some((item: any) =>
        item.name?.trim().toLowerCase() === trimmedName && item._id !== this.createForm._id
      );
      if (isDuplicate) {
        this.toastr.error('Type Name already exists. Duplicate entries are not allowed.');
        return;
      }
      this.apiservice.createTypeStamp(this.createForm, this.createForm._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.getlistTypeStamp();
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
    this.createForm.name = '';
    this.createForm.amount = '',
      this.createForm.type = '';
    this.createForm.startDate = '';
    this.createForm.endDate = '';
    this.createForm.status = '';
    this.createForm._id = null

  }
  cancel() {
    this.isedit = false;
    this.clear();
    this.modalRef.hide();
    this.getlistTypeStamp();
  }


  deleteKm(i?: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.apiservice.deleteTypeStamp(i._id).subscribe((res) => {

          if (res.code == 200) {
            this.toastr.success(res.message);
            this.getlistTypeStamp();
          } else {
            this.toastr.error(res.message);
          }

        }),
          (err) => { };
      }
    });
  }


  exportAsXLSX(): void {

    this.path = 'stampMaster';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'StampList' + '_' + Date.now();
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
    this.path = 'stampMaster';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'StampList' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        this.databaseList = [];
      }
    })
      .catch((err: any) => { });



  }


  async printTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistTypeStamp();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getlistTypeStamp();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistTypeStamp();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getlistTypeStamp();
    }, 1000);

  }
}


