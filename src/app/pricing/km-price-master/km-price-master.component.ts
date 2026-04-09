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
import { CopyService } from 'src/app/service/exportService/copyService';
import { PdfService } from 'src/app/service/exportService/pdfService';
import { ExcelService } from 'src/app/service/exportService/excelService';
import { PrintService } from 'src/app/service/exportService/printService';

@Component({
  selector: 'app-km-price-master',
  templateUrl: './km-price-master.component.html',
  styleUrls: ['./km-price-master.component.scss']
})
export class KmPriceMasterComponent implements OnInit {

  limit: any;
  offset: any;
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
  constructor(private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService, private copyService: CopyService, private pdfService: PdfService,
    private apiservice: ApiServiceService, private excelService: ExcelService, private printService: PrintService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getlistkmPriceMaster();
  }

  editTerms(item: any) {
    this.isedit = true;
    this.createForm = item;
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getlistkmPriceMaster();
  }


  // pageChange(e: any): void {
  //   this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
  //   // this.getB2bUserList();
  // }
  // paginationOffset(currentPage: any, itemsPerPage: any) {
  //   let offset = currentPage * itemsPerPage + 1;
  //   return (offset = offset < 0 ? offset : offset - 1);
  // }
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getlistkmPriceMaster();
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

  getlistkmPriceMaster() {
    this.limit = 9;
    this.offset = 0;
    this.apiservice.getlistkmPriceMaster(this.limit, this.offset, this.value)
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

  createkmPriceMaster(f) {
    if (f.form.valid) {
      this.apiservice.createkmPriceMaster(this.createForm, this.createForm._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.getlistkmPriceMaster();
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

    this.modalRef.hide();
    this.getlistkmPriceMaster()
  }


  deleteKm(i?: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.apiservice.deletekmPriceMaster(i._id).subscribe((res) => {

          if (res.code == 200) {
            this.toastr.success(res.message);
            this.getlistkmPriceMaster();
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
    this.path = 'kmPriceMaster';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'kmPriceMaster' + '_' + Date.now();
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
    this.path = 'kmPriceMaster';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'kmPriceMaster' + '_' + Date.now();
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
    await this.getlistkmPriceMaster();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getlistkmPriceMaster();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getlistkmPriceMaster();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getlistkmPriceMaster();
    }, 1000);

  }
}
