import { Component, OnInit } from '@angular/core';
import { DialogueComponent } from '../dialogue/dialogue.component';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PdfService } from '../service/exportService/pdfService';
import { ExcelService } from '../service/exportService/excelService';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  limit: any;
  offset: any;
  value: any;
  currentPage: any;
  totalCount: any;

  constructor(private router: Router, private apiservice: ApiServiceService, private pdfService: PdfService, private excelService: ExcelService,) { }

  ngOnInit(): void {
    this.getlistTerms()
  }
  termsList: any;
  getlistTerms() {
    this.apiservice.getlistTerms(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.termsList = res.data?.data;
          this.totalCount = res?.data?.totalCount;

          // this.searchLoad = false;
        } else {
          this.termsList = [];
        }
      })
      .catch((err: any) => { });
  }

  editTerms(item: any) {
    this.router.navigate(['terms/update', { id: item?._id }]);
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;

  }
  async downloadExport() {
    let base64String = "";

    await this.apiservice
      .getConsumerExport('subadmin')
      .then((res) => {
        base64String = res?.data;
      })

    const bytes = window.atob(base64String);
    const arrayBuffer = new ArrayBuffer(bytes.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i++) {
      uint8Array[i] = bytes.charCodeAt(i);
    }

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const excelBlob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelBlob, 'customer.xlsx');
  }

  pageChange(e: any): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    // this.getB2bUserList();
  }
  paginationOffset(currentPage: any, itemsPerPage: any) {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
}
