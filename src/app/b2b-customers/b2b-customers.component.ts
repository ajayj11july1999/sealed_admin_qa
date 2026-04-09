import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
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
  selector: 'app-b2b-customers',
  templateUrl: './b2b-customers.component.html',
  styleUrls: ['./b2b-customers.component.scss'],
})
export class B2bCustomersComponent implements OnInit {
  value: any;
  limit = 9;
  offset = 0;
  userType: any;
  b2bCustomerList: any = [];
  totalCount: any = 0;
  // searchLoad : boolean = false;
  // b2b_id: any;
  userid: any;
  _id: any;
  userId: any;
  name: any;
  email: any;
  Verified: any = undefined;
  currentPage: number | undefined;


  constructor(private apiService: ApiServiceService, private router: Router, private dialog: MatDialog,) { }
  b2bCustomer: any
  isViewAllActive: boolean = false;
  isVerifiedCouriersActive: boolean = false
  isUnverifiedCouriersActive: boolean = false;
  pageAccess: any;
  userInfo: any;
  userrole: any;
  showAdd: any;
  showExport: any;
  showEdit: any;
  ngOnInit(): void {
    // this.getlistb2bcustomerDetails()
    this.b2bCustomer = sessionStorage.getItem("deliveryman")

    console.log(this.b2bCustomer)
    if (this.b2bCustomer == 'verify') {
      this.isVerifiedCouriersActive = true;
      this.verifiedCouriers();
    } else if (this.b2bCustomer == 'unverify') {
      this.isUnverifiedCouriersActive = true;
      this.unverifiedCouriers();
    } else {
      this.isViewAllActive = true;
      this.viewAll();
    }
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      // this.userInfo = localStorage.getItem('userInfoA')
      //   ? JSON.parse(localStorage.getItem('userinfoA') || '')
      //   : '';
      // let userrole = this.userInfo?.role;
      // if (userrole == 'subadmin') {
      //   this.pageAccess = localStorage.getItem('pageAccess')
      //     ? JSON.parse(localStorage.getItem('pageAccess') || '')
      //     : '';
      //   console.log(this.pageAccess)
      //   // const filteredB = b.filter(item => item.name === 'View' && item.check === true);
      //   // console.log(filteredB);
      // } else {
      //   userrole = this.userInfo?.role;
      // }

      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "S2B Customers"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')

        this.showExport = getTrueViewActions(pageDetails, "Export")
        console.log(this.showAdd)
      }
    }
  }
  // Function to get actions for a specific page
  getActionsForPage(pageName: string) {
    const page = this.pageAccess.find(p => p.page_name === pageName);
    return page ? page.action : [];
  }

  // Function to check if a specific action is allowed
  isActionAllowed(pageName: string, actionName: string): boolean {
    const actions = this.getActionsForPage(pageName);
    return actions.find(action => action.name.trim() === actionName.trim())?.check || false;
  }
  viewAll() {
    this.limit = 9;
    this.offset = 0;
    this.Verified = undefined;
    this.isViewAllActive = true;
    this.isVerifiedCouriersActive = false;
    this.isUnverifiedCouriersActive = false;
    sessionStorage.setItem('deliveryman', 'All')
    this.getlistb2bcustomerDetails();
  }
  verifiedCouriers() {
    this.limit = 9;
    this.offset = 0;
    this.Verified = 'true';
    this.isViewAllActive = false;
    this.isVerifiedCouriersActive = true;
    this.isUnverifiedCouriersActive = false;
    sessionStorage.setItem('deliveryman', 'verify')
    this.getlistb2bcustomerDetails();
  }
  unverifiedCouriers() {
    this.limit = 9;
    this.offset = 0;
    this.Verified = 'false';
    this.isViewAllActive = false;
    this.isVerifiedCouriersActive = false;
    this.isUnverifiedCouriersActive = true;
    sessionStorage.setItem('deliveryman', 'unverify')
    this.getlistb2bcustomerDetails();
  }
  pageChange(e): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);

    this.getlistb2bcustomerDetails();
  }
  paginationOffset(currentPage, itemsPerPage): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
  // search filter
  searchCustomer(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;

    this.getlistb2bcustomerDetails();
  }
  getlistb2bcustomerDetails() {

    this.userType = 'masteragent,normaluser';
    this.apiService
      .getAllb2bCustomer(this.userType, this.limit, this.offset, this.value, this.Verified)
      .then((res) => {
        this.b2bCustomerList = res.data?.data;
        this.totalCount = res?.data?.totalCount;

        console.log(this.b2bCustomerList);

      })
      .catch((err) => { });
  }

  updateVerifyStatus(e) {


    let payload = {
      isVerified: 'true',
      name: e.name,
      email: e.email,
    };
    this.apiService.updateb2bcustomer(e._id, payload).subscribe((response) => {
      this.b2bCustomerList = response.data;
      console.log(this.b2bCustomerList.name)

      if (response.code == 200) {

        this.getlistb2bcustomerDetails();
      } else {
      }
    }),
      (err) => { };

  }

  // viewAll() {
  //   this.limit = 9;
  //   this.offset = 0;
  //   this.verified = undefined;
  //   this.getlistb2bcustomerDetails();
  // }
  // verifiedCustomers() {
  //   this.limit = 9;
  //   this.offset = 0;
  //   this.verified = 'true';
  //   this.getlistb2bcustomerDetails();
  // }
  // unverifiedCustomers() {
  //   this.limit = 9;
  //   this.offset = 0;
  //   this.verified = 'false';
  //   this.getlistb2bcustomerDetails();
  // }
  addCustomers() {
    this.router.navigate(['b2b-customers/b2b-add']);

  }

  deleteUser(i: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        console.log(result);
        this.apiService.deleteb2bcustomer(i._id).subscribe((res) => {
          this.getlistb2bcustomerDetails();

        }),
          (err) => { };
      }
    });
  }

  async downloadExport() {
    let base64String = "";
    // Assuming you have the Base64-encoded Excel file as a string:
    await this.apiService
      .getConsumerExport('masteragent,normaluser')
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
