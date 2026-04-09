import { Component, OnInit, TemplateRef } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from 'src/app/service/api-service.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ExcelService } from 'src/app/service/exportService/excelService';
import { PdfService } from 'src/app/service/exportService/pdfService';
import { CopyService } from 'src/app/service/exportService/copyService';
import { PrintService } from 'src/app/service/exportService/printService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-courier-payout-history',
  templateUrl: './courier-payout-history.component.html',
  styleUrls: ['./courier-payout-history.component.scss']
})
export class CourierPayoutHistoryComponent implements OnInit {

  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  // categoryList: any = [
  //   { id: "1", name: "ABOVE2", date: "12.0", status: 'B2C' },
  //   { id: "2", name: "ABOVE2", date: "12", status: 'B2C' },
  //   { id: "3", name: "ABOVE2", date: "23", status: 'B2C' },
  // ];
  id: any;
  modalRef!: BsModalRef;
  deliveryManHistory: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private printService: PrintService,
    private modalService: BsModalService, private excelService: ExcelService, private pdfService: PdfService, private copyService: CopyService,
    private apiservice: ApiServiceService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      console.log(params);
      this.id = params?.id;
    });
    this.getHistory();

  }
  getHistory() {
    this.apiservice
      .getpayoutHistoryById(this.id, this.limit, this.offset)
      .then((res) => {
        this.deliveryManHistory = res.data?.data;
        this.totalCount = res?.data?.totalCount;
      })
      .catch((err) => { });
  }
  // showPrompt(item?: any) {
  //   const dialogRef = this.dialog.open(DialogueComponent, {
  //     width: '350px',
  //     height: item ? '400px' : '500px',
  //     disableClose: true,
  //     data: item

  //   })
  //   dialogRef.afterClosed().subscribe(() => {
  //     // this.getB2bUserList();
  //   });
  // }
  editTerms(item: any) {
    this.router.navigate(['terms/update', { id: item?.id }]);
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    // this.getB2bUserList();
    this.getHistory();

  }
  // async downloadExport() {
  //   let base64String = "";
  //   // Assuming you have the Base64-encoded Excel file as a string:
  //   await this.apiservice
  //     .getConsumerExport('subadmin')
  //     .then((res) => {
  //       base64String = res?.data;
  //     })
  //   // Convert the Base64 string to an ArrayBuffer
  //   const bytes = window.atob(base64String);
  //   const arrayBuffer = new ArrayBuffer(bytes.length);
  //   const uint8Array = new Uint8Array(arrayBuffer);
  //   for (let i = 0; i < bytes.length; i++) {
  //     uint8Array[i] = bytes.charCodeAt(i);
  //   }
  //   // Read the Excel file from the ArrayBuffer using XLSX
  //   const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  //   // Export the Excel file to a Blob object
  //   const excelBlob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   // Save the Excel file using FileSaver.js
  //   saveAs(excelBlob, 'customer.xlsx');
  // }

  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getHistory();
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
    this.apiservice.getPdfExcelHistoryDownload(this.path, this.type, this.id).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'courier partner Payout History' + '_' + Date.now();
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
    this.apiservice.getPdfExcelHistoryDownload(this.path, this.type, this.id).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'courier partner Payout History' + '_' + Date.now();
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
    await this.getHistory();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 9;
      this.getHistory();
    }, 1000);
  }

  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getHistory();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getHistory();
    }, 1000);

  }
}
