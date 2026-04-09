import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  route: any;
  userType: any;
  limit = 9;
  offset = 0;
  customer_list;
  currentPage: number | undefined;
  // searchLoad:boolean =true;
  constructor(private router: Router, private apiService: ApiServiceService ,public spinner :NgxSpinnerService) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  totalCount: any=0;
  value: any;
 async downloadExport()  {
    let base64String = "";
    // Assuming you have the Base64-encoded Excel file as a string:
    await this.apiService
      .getConsumerExport('consumer')
      .then((res) => {
          base64String = res?.data;
      })
    // Convert the Base64 string to an ArrayBuffer
    const bytes = window.atob(base64String);
    const arrayBuffer = new ArrayBuffer(bytes.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i++) {
      uint8Array[i] = bytes.charCodeAt(i);
    }
    // Read the Excel file from the ArrayBuffer using XLSX
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    // Export the Excel file to a Blob object
    const excelBlob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // Save the Excel file using FileSaver.js
    saveAs(excelBlob, 'customer.xlsx');
  }
  getUserDetails() {
    // this.searchLoad = true
    // this.spinner.show();
    this.userType = 'consumer';
    this.apiService
      .getListUserDetails(this.userType, this.limit, this.offset, this.value)
      .then((res) => {
        // this.spinner.hide();
        this.customer_list = res.data?.data;
        this.totalCount = res?.data?.totalCount;
        console.log(this.customer_list);
        // this.searchLoad = false;
      })
      .catch((err) => {});
  }
  pageChange(e): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    console.log(this.offset, 'iiiii');
    this.getUserDetails();
  }
  paginationOffset(currentPage, itemsPerPage): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
  // search filter
  searchCustomer(e: any) {
    this.offset=0;
    this.currentPage = 0;
    this.value = e?.target?.value;
    this.getUserDetails();
  }
  // navigate to customer_view
  customersView(i: any) {

    localStorage.setItem('userViewId',JSON.stringify(this?.customer_list?.[i]?._id));
   
    this.router.navigate(['/customer-view'])
  }
}
