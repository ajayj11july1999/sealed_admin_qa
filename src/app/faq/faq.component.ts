import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogueComponent } from '../dialogue/dialogue.component';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CopyService } from '../service/exportService/copyService';
import { PrintService } from '../service/exportService/printService';
import { PdfService } from '../service/exportService/pdfService';
import { ExcelService } from '../service/exportService/excelService';
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
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  faqForm: any = {
    type: '',
    question: '',
    answer: '',
    status: '',
    _id: null
  };
  isedit = false;
  limit: any = 15;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  faqList: any = [
    // { id: "1", ques: "ques1", ans: "answer 1", status: 'active' },
    // { id: "2", ques: "ques1", ans: "answer 1", status: 'active' },
    // { id: "3", ques: "ques1", ans: "answer 1", status: 'active' },
    // { id: "4", ques: "ques1", ans: "answer 1", status: 'active' },
    // { id: "5", ques: "ques1", ans: "answer 1", status: 'active' },
    // { id: "6", ques: "ques1", ans: "answer 1", status: 'active' },

  ]
  modalRef!: BsModalRef;
  createForm: any;
  showAdd: any;
  showEdit: any;
  showDelete: any;
  userInfo: any;
  userrole: any;


  constructor(private dialog: MatDialog, private apiservice: ApiServiceService,
    private modalService: BsModalService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private copyService: CopyService, private printService: PrintService, private pdfService: PdfService,
    private excelService: ExcelService) {
    // this.createForm=this.formBuilder.

  }

  ngOnInit(): void {
    console.log(this.faqForm)
    this.getFaqList();

    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "FAQ"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        console.log(this.showEdit)
        this.showDelete = getTrueViewActions(pageDetails, 'Delete')?.length ? true : false
        console.log(this.showDelete)
      }
    }
  }
  get f(): { [key: string]: AbstractControl } {
    return this.createForm.controls;
  }
  cancel() {
    this.clear();
    this.modalRef.hide();
    this.getFaqList();
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.limit = this.pageSize || 15;
    this.value = e?.target?.value || '';
    this.currentPage = 0;
    this.getFaqList();
  }
  // async downloadExport() {
  //   let base64String = "";
  //   // Assuming you have the Base64-encoded Excel file as a string:
  //   await this.apiservice
  //     .getConsumerExport('subadmin')
  //     .then((res) => {
  //       base64String = res?.data;
  //     })
  //   // Convert the Base64 string to an ArrayBuffer
  //   const bytes = window.atob(base64String);
  //   const arrayBuffer = new ArrayBuffer(bytes.length);
  //   const uint8Array = new Uint8Array(arrayBuffer);
  //   for (let i = 0; i < bytes.length; i++) {
  //     uint8Array[i] = bytes.charCodeAt(i);
  //   }
  //   // Read the Excel file from the ArrayBuffer using XLSX
  //   const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  //   // Export the Excel file to a Blob object
  //   const excelBlob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //   // Save the Excel file using FileSaver.js
  //   saveAs(excelBlob, 'customer.xlsx');
  // }

  // pageChange(e: any): void {
  //   this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
  //   // this.getB2bUserList();
  // }
  // paginationOffset(currentPage: any, itemsPerPage: any) {
  //   let offset = currentPage * itemsPerPage + 1;
  //   return (offset = offset < 0 ? offset : offset - 1);
  // }
  AddModal(template: TemplateRef<any>,) {
    this.clear();
    var aa: any = {
      backdrop: 'static', class: 'custm_modal gray modal-lg', keyboard: false, ignoreBackdropClick: true
    }
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, aa)
    );
  }
  // isAddMode: boolean = false;
  // get buttonText() {
  //   return this.isAddMode ? 'Add Category' : 'Update Category';
  // }

  AddFaq(f) {
    if (f.form.valid) {
      this.apiservice.createFaq(this.faqForm, this.faqForm._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.value = '';
          this.offset = 0;
          this.getFaqList();
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

    this.faqForm.type = '';
    this.faqForm.question = '';
    this.faqForm.answer = '';
    this.faqForm.status = '';
    this.faqForm._id = null
  }
  // AddFaq(f) {
  //   if (f.form?.valid) {
  //     console.log('Form Submitted:', this.faqForm.question);

  //     this.apiservice.createFaq(this.faqForm, this.faqForm?._id).subscribe((res) => {
  //       console.log(res)
  //       if (res.status = 200) {
  //         // this.loaderapi = false;
  //         this.toastrService.success(res?.message)
  //         // this.toastrService.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
  //         this.faqForm.reset();
  //         this.modalRef.hide();
  //         this.getFaqList();
  //       }
  //       else {
  //         this.toastrService.error(res.message);
  //       }
  //     }, (err) => {
  //       console.log(err)
  //       this.toastrService.error(err);
  //     })
  //     // console.log('Form Submitted:', this.user, faqForm);
  //     // Here you can make an API call or perform any other action with the form data.
  //   } else {
  //     console.error('All fields are required');
  //   }
  // }
  getFaqList() {

    this.apiservice
      .getlistFaq(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.faqList = Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];

          this.totalCount = res?.data?.totalCount ?? this.faqList.length;
          console.log(this.faqList)
          // this.searchLoad = false;
        } else {
          this.faqList = [];
          this.totalCount = 0;
        }
      })
      .catch((err: any) => {
        this.faqList = [];
        this.totalCount = 0;
      });
  }
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    const pagNo = e.pageIndex;
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo * this.pageSize;
    this.getFaqList();
  }

  deleteFaq(i: any) {
    let dialogRef = this.dialog.open(DialogueComponent, {
      height: '150px',
      data: { status: "Delete" },
      disableClose: true

    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.apiservice.deleteFaq(i?._id).subscribe((res) => {
          this.getFaqList();
          if (res?.status) {
            this.toastr.success(res.message);
            this.getFaqList();
          } else {
            this.getFaqList();
            this.toastr.error(res.message);
          }
        }, err => {
          this.toastr.error('Failed to delete');
        })
      }
    });
  }
  editFaq(item: any) {
    this.isedit = true;
    this.faqForm = { ...item };
  }

  allowedChars(event: KeyboardEvent): boolean {
    const pattern = /^[a-zA-Z0-9 .,?!'\-]$/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  // editFaq(template: TemplateRef<any>, user: any) {
  //   this.isAddMode = false;
  //   this.user = { ...user }; // Populate the category object with the selected item
  //   this.modalRef = this.modalService.show(
  //     template,
  //     Object.assign({}, { class: 'custm_modal gray modal-lg' })
  //   );
  //   console.log(this.user)
  //   this.user.type = this.user?.type;
  //   this.user.question = this.user?.question;
  //   this.user.answer = this.user?.answer;
  //   this.user.ststus = this.user.status
  // }

  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'feedBack';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'FaqList' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(data, name)
      } else {
        this.toastr.error(res.message || 'Failed to download CSV file');
      }
    })
      .catch((err: any) => {
        this.toastr.error('Failed to download CSV file');
      });


  }
  type: any;
  path: any;

  exportAsPdf() {
    this.path = 'feedBack';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'FaqList' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        this.toastr.error(res.message || 'Failed to download PDF file');
      }
    })
      .catch((err: any) => {
        this.toastr.error('Failed to download PDF file');
      });


    // this.pdfService.exportToPDF(this.categoryList, 'categoryList')
  }

  async printTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getFaqList();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getFaqList();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getFaqList();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getFaqList();
    }, 1000);

  }
}