import { Component, OnInit, TemplateRef } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/service/api-service.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { DialogueComponent } from 'src/app/dialogue/dialogue.component';

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
  selector: 'app-courier-wage-amount',
  templateUrl: './courier-wage-amount.component.html',
  styleUrls: ['./courier-wage-amount.component.scss']
})
export class CourierWageAmountComponent implements OnInit {
  limit: any;
  createForm = {
    "amount": "",
    "status": "",
    "_id": null
  }
  offset: any;
  value: any;
  currentPage: any;
  totalCount: any;
  categoryList: any = [
    { id: "1", name: "ABOVE2", date: "12.0", status: 'B2C' },
    { id: "2", name: "ABOVE2", date: "12", status: 'B2C' },
    { id: "3", name: "ABOVE2", date: "23", status: 'B2C' },
  ]
  databaseList: any;
  modalRef!: BsModalRef;
  isedit = false;
  userInfo: any;
  userrole: any;
  showEdit: any = true;
  constructor(private router: Router, private dialog: MatDialog,
    private modalService: BsModalService, private toastr: ToastrService,
    private apiservice: ApiServiceService) { }

  ngOnInit(): void {
    this.getlistWage();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Courier partners"));
        // this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        // console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit Trip Amount ')?.length ? true : false
        console.log(this.showEdit)
      }
    }
  }
  editTerms(item: any) {
    this.isedit = true;
    this.createForm = item;
  }
  getlistWage() {
    this.limit = 9;
    this.offset = 0;
    this.apiservice.getlistWageAmount(this.limit, this.offset, this.value)
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
  create(f) {

    if (f.form?.valid) {

      this.apiservice.createWageAmount(this.createForm, this.createForm?._id).subscribe((res) => {
        console.log(res)
        if (res.status = 200) {
          this.toastr.success(this.createForm?._id ? 'Updated Successfully' : 'Registered Successfully');
          this.isedit = false;
          this.clear();
          this.getlistWage();
          this.modalRef.hide();
        }
        else {
          this.toastr.error(res.message);
        }
      }, err => {
        this.toastr.error('Invalid email/mobile No');
      })
    } else {
      this.toastr.error('Invalid input provided');
    }


  }
  clear() {
    this.createForm.amount = '';
    this.createForm.status = '';

  }
  deleteWage(i: any) {
    let dialogRef = this.dialog.open(DialogueComponent, {
      height: '150px',
      data: { status: "Delete" },
      disableClose: true

    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.apiservice.deleteWageAmount(i?._id).subscribe((res) => {
          this.getlistWage();
          if (res?.status) {
            this.toastr.success(res.message);
            this.getlistWage();
          } else {
            this.getlistWage();
            this.toastr.error(res.message);
          }
        }, err => {
          this.toastr.error('Failed to delete');
        })
      }
    });
  }

  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    // this.getB2bUserList();
  }
  async downloadExport() {
    let base64String = "";
    // Assuming you have the Base64-encoded Excel file as a string:
    await this.apiservice
      .getConsumerExport('subadmin')
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
  cancel() {
    this.modalRef.hide();
    this.getlistWage();

  }
  pageChange(e: any): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    // this.getB2bUserList();
  }
  paginationOffset(currentPage: any, itemsPerPage: any) {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
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


}


