import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatSlideToggleChange } from '@angular/material/slide-toggle/slide-toggle';
import { ToastrService } from 'ngx-toastr';

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
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss'],
})
export class CouriersComponent implements OnInit {
  courier_list;

  limit = 9;
  offset = 0;
  totalCount: any = 0;
  userType: any;
  value: any;
  // searchLoad :boolean = true;
  status = [
    { id: '1', isVerified: 'true', value: 'unverified' },
    { id: '2', isVerfied: 'false', value: 'verfied' },
  ];
  courierId: any;
  s: any;
  filte: any;
  activestatus: boolean = true;
  Verified: any = undefined;
  currentPage: number | undefined;
  deliveryman: any;
  showAdd: any;
  showEdit: any;
  showExport: any;
  userInfo: any;
  userrole: any;
  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private dialog: MatDialog,
    public spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.courierId = localStorage.getItem('courierViewId')
      ? JSON.parse(localStorage.getItem('courierViewId') || '')
      : '';
    console.log('hii');
    // this.getListCourier();
    this.deliveryman = sessionStorage.getItem("deliveryman")
    console.log(this.deliveryman)
    if (this.deliveryman == 'verify') {
      this.isVerifiedCouriersActive = true;
      this.verifiedCouriers();
    } else if (this.deliveryman == 'unverify') {
      this.isUnverifiedCouriersActive = true;
      this.unverifiedCouriers();
    } else {
      this.isViewAllActive = true;
      this.viewAll();
    }
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Courier partners"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showExport = getTrueViewActions(pageDetails, 'Export')?.length ? true : false
        console.log(this.showExport)
      }
    }
  }
  AddCourier() {
    this.router.navigate(['couriers/master/courier-add'])
  }
  onStatusChange(event: MatSlideToggleChange, item: any) {
    const newStatus = event.checked;
    const previousStatus = item.status;
    item.status = newStatus;

    const payload = { status: newStatus };
    this.apiService.updateStatus(item._id, payload).subscribe(
      response => {
        this.toastr.success(`Status ${newStatus ? 'activated' : 'deactivated'} successfully`);
      },
      err => {
        item.status = previousStatus;
        this.toastr.error('Failed to update status. Please try again.');
      }
    );
  }
//   onActiveChange(event: MatSlideToggleChange, item: any) {
//   const payload = { isActive: event.checked };

//   this.apiService.updateStatus(item._id, payload)
//     .subscribe(response => {
//       console.log('Active status updated:', response);
//       this.getListCourier();
//     });
// }


  // getListCourier() {
  //   // this.searchLoad=true
  //   // this.spinner.show();
  //   this.userType = 'deliveryman';
  //   this.apiService
  //     .getAllCourierDetails(this.userType, this.limit, this.offset, this.value, this.Verified)
  //     .then((res) => {
  //       if (res.code == 200) {
  //         // this.spinner.hide();
  //         this.courier_list = [...res.data?.data];

  //         this.totalCount = res?.data?.totalCount;

  //       } else {
  //       }
  //     })
  //     .catch((err) => { });
  // }
  getListCourier() {
    const role = 'deliveryman';

    this.apiService
      .getAllCourierDetails(
        role,
        this.limit,
        this.offset,
        this.value,
        this.Verified
      )
      .then((res) => {
        if (res.code == 200) {
          const partners = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
          this.courier_list = [...partners];
          this.totalCount = res?.data?.totalCount ?? this.courier_list.length;

          this.courier_list.forEach((partner: any) => {
            console.log('Vehicle Details:', partner?.vehicleDetails);
          });
        }
      })
      .catch(() => {
        this.courier_list = [];
        this.totalCount = 0;
      });
  }


  pageChange(e): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    console.log(this.offset, 'iiiii');
    this.getListCourier();
  }
  paginationOffset(currentPage, itemsPerPage): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }

  searchCourier(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getListCourier();
  }

  courierPayout(id: any) {
    this.router.navigate(['/couriers/history', { id: id }]);
  }
  generatePayout(id: any) {
    // Navigate to generate payout page for selected courier
    this.router.navigate(['/courier-generate-payout', id]);
  }
  searchtrip(id: any) {
    this.router.navigate(['/search'], { queryParams: { courierId: id } });
  }

  couriersView(i: any) {
    console.log(i);
    // console.log('this?.courier_list?.data?.[i]._id', this.courier_list?.[i]._id);
    localStorage.setItem('courierViewId', JSON.stringify(i));
    //  console.log(localStorage.getItem('courierViewId'), 'dfsfdff');
    this.router.navigate(['/courier-view']);
  }
  deletecourier(i: any) {
    console.log(i);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      // let payload = {
      //   demoStatus: 'closed',
      // };
      if (result) {
        console.log(result);
        this.apiService.deleteCourier(i._id).subscribe((res) => {
          this.getListCourier();
          // this.demoList = response.data;
          // console.log(this.demoList.name);

          // if (res.code == 200) {
          //   console.log('success');
          //   // this.getlistDemoRequest();
          // } else {
          // }
        }),
          (err) => { };
      }
    });
  }
  filteredData: any = [];
  isViewAllActive: boolean = false;
  isVerifiedCouriersActive: boolean = false
  isUnverifiedCouriersActive: boolean = false
  viewAll() {
    this.limit = 9;
    this.offset = 0;
    this.Verified = undefined;
    this.isViewAllActive = true;
    this.isVerifiedCouriersActive = false;
    this.isUnverifiedCouriersActive = false;
    sessionStorage.setItem('deliveryman', 'All')
    this.getListCourier();
  }
  verifiedCouriers() {
    this.limit = 9;
    this.offset = 0;
    this.Verified = 'true';
    this.isViewAllActive = false;
    this.isVerifiedCouriersActive = true;
    this.isUnverifiedCouriersActive = false;
    sessionStorage.setItem('deliveryman', 'verify')
    this.getListCourier();
  }
  unverifiedCouriers() {
    this.limit = 9;
    this.offset = 0;
    this.Verified = 'false';
    this.isViewAllActive = false;
    this.isVerifiedCouriersActive = false;
    this.isUnverifiedCouriersActive = true;
    sessionStorage.setItem('deliveryman', 'unverify')
    this.getListCourier();
  }
  // viewAll() {
  //   this.limit = 9;
  //   this.offset = 0;
  //   this.Verified = undefined;
  //   this.getListCourier();
  // }
  // verifiedCouriers() {
  //   this.limit = 9;
  //   this.offset = 0;
  //   this.Verified = 'true';
  //   this.getListCourier();
  // }
  // unverifiedCouriers() {
  //   this.limit = 9;
  //   this.offset = 0;
  //   this.Verified = 'false';
  //   this.getListCourier();
  // }

  async downloadExport() {
    let base64String = "";
    // Assuming you have the Base64-encoded Excel file as a string:
    await this.apiService
      .getConsumerExport('deliveryman')
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



}
