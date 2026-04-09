import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import $ from 'jquery';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-demo-request',
  templateUrl: './demo-request.component.html',
  styleUrls: ['./demo-request.component.scss'],
})

export class DemoRequestComponent implements OnInit {
  value: any;
  demoList: any;
  totalCount: any = 0;
  limit = 9;
  offset = 0;
  dialogRef: any;
  _id: any;
  searchLoad: boolean = true;
  currentPage: number | undefined;

  constructor(
    private apiService: ApiServiceService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getlistDemoRequest();
    $('[data-toggle="tooltip"]').tooltip();
  }

  pageChange(e): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    this.getlistDemoRequest();
  }
  paginationOffset(currentPage, itemsPerPage): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
  // pageSize: any;
  // pageEvent: any;
  // pageChange(e: any): void {
  //   console.log(e)
  //   let pagNo = e.pageIndex;
  //   this.pageSize = e.pageSize;
  //   this.limit = this.pageSize;
  //   this.offset = pagNo;
  //   this.getlistDemoRequest();
  // }
  // search filter

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  searchCustomer(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage(); // Reset paginator UI
    }

    this.getlistDemoRequest();
  }

  getlistDemoRequest() {
    this.searchLoad = true
    this.apiService
      .getListDemoReq(this.limit, this.offset, this.value,)
      .then((res) => {
        this.demoList = res.data?.data;
        this.totalCount = res?.data?.totalCount;
        console.log(this.demoList);
        this.searchLoad = false;
        // this._id=res?.data?.data?.[i]?._id
        // console.log(this._id);
      })
      .catch((err) => { });
  }
  updateStatus(i) {
    console.log(i);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Update' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      let payload = {
        demoStatus: 'closed',
      };
      if (result) {
        console.log(result);
        this.apiService
          .updatedemoList(i._id, payload)
          .subscribe((response) => {
            this.demoList = response.data;
            console.log(this.demoList.name);

            if (response.code == 200) {

              console.log('success');
              this.getlistDemoRequest();
            } else {

            }
          }),
          (err) => { };
      }
    });

  }
}
