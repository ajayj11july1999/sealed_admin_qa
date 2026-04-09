import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import * as XLSX from 'xlsx';
// import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss'],
})
export class PayoutComponent implements OnInit {
  payouthistory: any;
  courierId: any;
  totalCount: any = 0;
  limit = 9;
  offset = 0;
  fileToExport: any;
  pipe = new DatePipe('en-US');
  aaa: any;
  exceldata: any =[];
  searchLoad:boolean = false;

  // @ViewChild('TABLE') table!: ElementRef;
  // displayedColumns = ['Date', 'Time', 'Name', 'Amount', 'Status'];
  // dataSource = ELEMENT_DATA;

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    // private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.courierId = localStorage.getItem('courierViewId')
      ? JSON.parse(localStorage.getItem('courierViewId') || '')
      : '';
    this.getlistPayout();
    console.log(this.courierId);
  }
  pageChange(e): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    this.getlistPayout();
  }
  paginationOffset(currentPage, itemsPerPage): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }

  getlistPayout() {
    this.searchLoad = true
    // this.spinner.show();
    this.apiService
      .getlistPayout()
      .then((res) => {
        // this.spinner.hide();
        this.payouthistory = res?.data?.data ? res.data.data : [];
        this.totalCount = res.data.totalCount;
        this.searchLoad = false;
        console.log(this.payouthistory);
        
      })
      .catch((err) => {
        // this.spinner.hide();
        this.searchLoad = false;
      });
  }

  courierpayout_view(i: any) {
    this.router.navigate([
      '/courier-payout-view',
      i?._id,
      i?.userDetails?.name
    ]);
  }

  exportdata(): void {
    //  const fileToExport = this.payouthistory.map((items: any) => {
    // console.log(items?.createdAt);
    // var aaa = items?.createdAt;
    // let ChangedFormat = this.pipe.transform(aaa, 'dd/MM/YYYY');
    console.log(this.payouthistory);
     
    // });
     this.exceldata=[];
    for(let i=0;i<this.payouthistory.length;i++)
    {
      var aaa = this.payouthistory[i].createdAt;
      let ChangedFormat = this.pipe.transform(aaa, 'dd/MM/YYYY');

         var time = this.payouthistory[i].createdAt;
         let timeFormat = this.pipe.transform(aaa, 'HH:MM:SS');
if (this.payouthistory[i].paid)
{
  var status = 'Paid'
}
else{
    var status = 'Unpaid';

}
  this.aaa = {
    Name: this.payouthistory[i].userDetails?.name,
    Date: ChangedFormat,
    Time: timeFormat,
    Amount: this.payouthistory[i].totalAmount,
    status: status,

    // Id: items?.id,
    // Title: items?.title,
    // Body: items?.body,
  };
       this.exceldata.push(this.aaa);
    }

 console.log(this.aaa);

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.exceldata);
   
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'fileToExport');

    /* save to file */
    XLSX.writeFile(wb, 'payouthistory.xlsx');
    console.log('exported');
  }
}
