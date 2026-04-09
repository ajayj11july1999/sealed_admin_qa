import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import * as XLSX from 'xlsx';

import { saveAs } from 'file-saver';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { PdfService } from '../service/exportService/pdfService';
import { ExcelService } from '../service/exportService/excelService';
import { CopyService } from '../service/exportService/copyService';
import { PrintService } from '../service/exportService/printService';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-typesmaster',
  templateUrl: './typesmaster.component.html',
  styleUrls: ['./typesmaster.component.scss']
})
export class TypesmasterComponent implements OnInit {


  category: any = {
    categoryName: '',
    typeName: '',
    status: '',

  };
  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  categoryList: any;
  categorytypesList: any = []
  CategoryStatus: any = [
    { id: 1, value: 'active', viewValue: 'Active' },
    { id: 2, value: 'inactive', viewValue: 'InActive' }

  ]
  modalRef!: BsModalRef;
  showAdd: any;
  userInfo: any;
  userrole: any;
  showEdit: any;
  showDelete: any;
  constructor(private router: Router, private dialog: MatDialog, private pdfService: PdfService, private excelService: ExcelService, private copyService: CopyService, private printService: PrintService,
    private toastrService: ToastrService, private apiservice: ApiServiceService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getCategoryList();
    this.getCategoryTypes();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "categories"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add Categories Type')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit Categories Type ')?.length ? true : false
        // this.showDelete = getTrueViewActions(pageDetails, 'Delete')?.length ? true : false
        console.log(this.showEdit)
      }
    }
  }
  getCategoryList() {
    // this.limit = '';
    // this.offset = ''
    this.apiservice
      .getlistCategory(this.limit, this.offset,)
      .then((res: any) => {
        if (res.code == 200) {
          this.categoryList = res.data?.data;
          // this.totalCount = res?.data?.totalCount;
          console.log(this.categoryList)
          // this.searchLoad = false;
        } else {
          this.categoryList = [];
        }
      })
      .catch((err: any) => { });
  }
  getCategoryTypes() {
    // this.limit = 9;
    // this.offset = 0;
    this.apiservice.getlistSubCategoryTypes(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.categorytypesList = res.data?.data;
          this.totalCount = res?.data?.totalCount;
          console.log(this.categorytypesList)
          // this.searchLoad = false;
        } else {
          this.categorytypesList = [];
        }
      })
      .catch((err: any) => { });
  }
  cancel() {
    this.modalRef.hide();
    this.getCategoryList();

  }

  editCategory(template: TemplateRef<any>, category: any) {
    this.isAddMode = false;
    this.category = { ...category }; // Populate the category object with the selected item
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'custm_modal gray modal-lg' })
    );
    console.log(this.category)
    this.category.categoryName = this.category?.categoryId;
    this.category.typeName = this.category?.name;
    this.category.status = this.category?.status;
  }

  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getCategoryTypes();
  }
  async downloadExport() {
    let base64String = "";
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


  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getCategoryTypes();
  }

  isAddMode: boolean = true;
  addModal(template: TemplateRef<any>) {
    this.isAddMode = true;
    this.category = {};
    var aa: any = {
      backdrop: 'static', class: 'custm_modal gray modal-lg', keyboard: false, ignoreBackdropClick: true
    }
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, aa)
    );
  }
  get buttonText() {
    return this.isAddMode ? 'Add Category' : 'Update Category';
  }
  addCategoryTypes(categoryTypeForm: any, item?: any) {
    let payload = {};
    if (this.isAddMode) {
      if (categoryTypeForm?.valid) {
        console.log(categoryTypeForm?.value)
        let payload = {

          "name": this.category.typeName,
          "categoryId": this.category?.categoryName,
          "status": this.category?.status,
        }
        console.log(payload)
        this.apiservice.createSubCategoryTypes(payload,).subscribe((res) => {
          console.log(res)
          if (res.status = 200) {
            // this.loaderapi = false;
            this.toastrService.success(res?.message)
            // this.toastrService.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
            categoryTypeForm.reset();
            this.modalRef.hide();
            this.getCategoryTypes();
          }
          else {
            // this.loaderapi = false;
            this.toastrService.error(res.message);
          }
        }, err => {
          this.toastrService.error('Invalid email/mobile No');
        })

      } else {
        this.toastrService.error('All fields are Required');
      }
    } else {
      if (categoryTypeForm?.valid) {
        console.log(categoryTypeForm?.value)
        let payload = {

          "name": this.category.typeName,
          "categoryId": this.category?.categoryName,
          "status": this.category?.status,
        }
        console.log(payload)
        this.apiservice.updateCategoryTypes(payload, this.category?._id).subscribe((res) => {
          console.log(res)
          if (res.status = 200) {
            // this.loaderapi = false;
            this.toastrService.success(res?.message)
            // this.toastrService.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
            categoryTypeForm.reset();
            this.modalRef.hide();
            this.getCategoryTypes();
          }
          else {
            // this.loaderapi = false;
            this.toastrService.error(res.message);
          }
        }, err => {
          this.toastrService.error('Invalid value', err);
        })

      } else {
        this.toastrService.error('All fields are required');
      }
    }
  }
  deleteType(i: any) {
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
        this.apiservice.deleteCategoryTypes(i._id).subscribe((res) => {
          this.getCategoryTypes();

        }),
          (err) => { };
      }
    });
  }

  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'subCategories';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'Category_Types' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(data, name)
      } else {
        this.categoryList = [];
      }
    })
      .catch((err: any) => { });


  }
  type: any;
  path: any;

  exportAsPdf() {
    this.path = 'subCategories';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'Category_Types' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        this.categoryList = [];
      }
    })
      .catch((err: any) => { });


    // this.pdfService.exportToPDF(this.categoryList, 'categoryList')
  }

  async printTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getCategoryTypes();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getCategoryTypes();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getCategoryTypes();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getCategoryTypes();
    }, 1000);

  }
}


