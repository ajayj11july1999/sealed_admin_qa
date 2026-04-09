import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-courier-payout',
  templateUrl: './courier-payout.component.html',
  styleUrls: ['./courier-payout.component.scss'],
})
export class CourierPayoutComponent implements OnInit {
  payoutdetails: any;
  paymentMode: any;
  paymentStatus: any;
  id: any;
  totalCount: any;
  users: any;
  exceldata: any;
  aaa: any;
  pipe = new DatePipe('en-US');

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.id = params.id;
      console.log(this.id);

      this.getlistPayoutHistory();
    });
  }

  getlistPayoutHistory() {
    // this.paymentMode = 'cash on delivery,cash on pickup';
    // this.paymentStatus = 'CODcompleted,COPcompleted';

    this.apiService
      .getlistPayoutHistory(this.id)
      .then((res) => {
        this.payoutdetails = res?.data?.data ? res.data.data : [];
        // this.totalCount = res.data.totalCount;
        this.users = res?.data?.data[0].userDetails.name;

        // localStorage.setItem('thisuser',this.users)

        console.log(this.payoutdetails);
        console.log(this.users);
      })
      .catch((err) => {});
  }

  CourierPayoutView(i: any) {
    localStorage.setItem('payoutId', JSON.stringify(i));

    this.router.navigate([
      '/courier-payout-view',
      i?._id,
      i?.userDetails?.name
    ]);
  }

  // exportdata(): void {
  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.payoutdetails);
  //   // const fileToExport = this.payouthistory.map((items: any) => {
  //   //   return {
  //   //     Name: items?.userDetails?.name,
  //   //     Date: items?.createdAt,
  //   //     Time: items?.createdAt,
  //   //     Amount: items?.totalAmount,

  //   //     // Id: items?.id,
  //   //     // Title: items?.title,
  //   //     // Body: items?.body,
  //   //   };
  //   // });
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'payoutdetails');

  //   /* save to file */
  //   XLSX.writeFile(wb, 'payouthistory.xlsx');
  //   console.log('exported');
  // }

  exportdata(): void {
    //  const fileToExport = this.payouthistory.map((items: any) => {
    // console.log(items?.createdAt);
    // var aaa = items?.createdAt;
    // let ChangedFormat = this.pipe.transform(aaa, 'dd/MM/YYYY');
    console.log(this.payoutdetails);

    // });
    this.exceldata = [];
    for (let i = 0; i < this.payoutdetails.length; i++) {
      var aaa = this.payoutdetails[i].createdAt;
      let ChangedFormat = this.pipe.transform(aaa, 'dd/MM/YYYY');

      var time = this.payoutdetails[i].createdAt;
      let timeFormat = this.pipe.transform(aaa, 'HH:MM:SS');
      if (this.payoutdetails[i].paid) {
        var status = 'Paid';
      } else {
        var status = 'Unpaid';
      }
      this.aaa = {
        Date: ChangedFormat,
        Time: timeFormat,
        Amount: this.payoutdetails[i].totalAmount,
        Trips: this.payoutdetails[i].noOfOrders,
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
