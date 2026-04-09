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
  selector: 'app-document-price-master',
  templateUrl: './document-price-master.component.html',
  styleUrls: ['./document-price-master.component.scss']
})
export class DocumentPriceMasterComponent implements OnInit {
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
  showAdd: any;
  showEdit: any;
  showExport: any;
  userInfo: any;
  userrole: any;
  constructor(private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService,
    private apiservice: ApiServiceService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getlistdocumentPrice();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Pricings"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        console.log(this.showExport)
      }
    }
  }

  editTerms(item: any) {
    this.isedit = true;
    this.createForm = item;
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getlistdocumentPrice();
  }

  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getlistdocumentPrice();
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
    console.log("sssss")
    var aa: any = {
      backdrop: 'static', class: 'custm_modal gray modal-sm', keyboard: false, ignoreBackdropClick: true
    }
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, aa)
    );
  }

  getlistdocumentPrice() {
    this.limit = 9;
    this.offset = 0;
    this.apiservice.getlistdocumentPrice(this.limit, this.offset, this.value)
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

  createdocumentPrice(f) {
    if (f.form.valid) {
      this.apiservice.createdocumentPrice(this.createForm, this.createForm._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.getlistdocumentPrice();
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
    // this.isedit = false;
    // this.clear();
    this.modalRef.hide();
    this.getlistdocumentPrice();
  }


  deleteKm(i?: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.apiservice.deletedocumentPrice(i._id).subscribe((res) => {

          if (res.code == 200) {
            this.toastr.success(res.message);
            this.getlistdocumentPrice();
          } else {
            this.toastr.error(res.message);
          }

        }),
          (err) => { };
      }
    });
  }
}


