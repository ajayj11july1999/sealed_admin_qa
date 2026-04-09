import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { DialogueComponent } from '../dialogue/dialogue.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../service/exportService/excelService';
import { PdfService } from '../service/exportService/pdfService';
import { NgxSpinnerService } from 'ngx-spinner';
import { CopyService } from '../service/exportService/copyService';
import { PrintService } from '../service/exportService/printService';

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
  selector: 'app-booking-instruction',
  templateUrl: './booking-instruction.component.html',
  styleUrls: ['./booking-instruction.component.scss']
})
export class BookingInstructionComponent implements OnInit {

  instructionform: any = {
    "name": "",
    "status": "",
    "_id": null
  }
  isedit = false;
  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  bookingInstruction: any = []
  modalRef!: BsModalRef;
  userInfo: any;
  userrole: any;
  showAdd: any;
  showDelete: any;
  showEdit: any;
  constructor(private dialog: MatDialog, public spinner: NgxSpinnerService,
    private excelService: ExcelService, private pdfService: PdfService,
    private toastr: ToastrService, private apiservice: ApiServiceService,
    private modalService: BsModalService, private copyService: CopyService, private printService: PrintService) { }

  ngOnInit(): void {
    this.getBookingInstruction();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Booking Instruction"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        console.log(this.showEdit)
        this.showDelete = getTrueViewActions(pageDetails, 'Delete')?.length ? true : false
        console.log(this.showDelete)
      }
    }
  }
  // get buttonText() {
  //   return this.isAddMode ? 'Add Category' : 'Update Category';
  // }
  // editInstruction(template: TemplateRef<any>, instruction: any) {
  //   this.isAddMode = false;
  //   this.instruction = { ...instruction }; // Populate the category object with the selected item

  //   this.modalRef = this.modalService.show(
  //     template,
  //     Object.assign({}, { class: 'custm_modal gray modal-lg' })
  //   );
  //   console.log(this.instruction)
  //   this.instruction.instructionName = instruction?.instructionName;
  //   this.instruction.status = instruction?.status;
  // }
  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'bookingInstructions';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'bookingInstructions' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(data, name)
      } else {
        // this.bookingInstruction = [];
      }
    })
      .catch((err: any) => {
        console.error(err);
        this.toastr.error(err?.error?.message);
      });
  }

  type: any;
  path: any;

  exportAsPdf() {
    this.path = 'bookingInstructions';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'Booking_instruction' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        // this.categoryList = [];
      }
    })
      .catch((err: any) => {
        console.error(err);
      });


    // this.pdfService.exportToPDF(this.categoryList, 'categoryList')
  }

  async printTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getBookingInstruction();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getBookingInstruction();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getBookingInstruction();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getBookingInstruction();
    }, 1000);

  }
  // showPrompt(item?: any) {
  //   const dialogRef = this.dialog.open(DialogueComponent, {
  //     width: '350px',
  //     height: item ? '400px' : '500px',
  //     disableClose: true,
  //     data: item

  //   })
  //   dialogRef.afterClosed().subscribe(() => {
  //     // this.getB2bUserList();
  //   });
  // }

  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    // this.getB2bUserList();
  }
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex;
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getBookingInstruction();
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
  editInstruction(item: any) {
    this.isedit = true;
    this.instructionform = item;
  }
  cancel() {
    // this.isedit = false;
    // this.clear();
    this.modalRef.hide();
    this.getBookingInstruction();
  }
  addBookingInstructions(f) {


    if (f.form.valid) {
      this.apiservice.createBookingInstruction(this.instructionform, this.instructionform._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.getBookingInstruction();
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
    this.instructionform.name = '';
    this.instructionform.status = '';
    this.instructionform._id = null

  }

  getBookingInstruction() {
    this.apiservice
      .getlistBookingInstruction(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.bookingInstruction = res.data?.data;
          this.totalCount = res?.data?.totalCount;
          console.log(this.bookingInstruction)

        } else {
        }
      })
      .catch((err: any) => { });
  }
  deleteInstruction() {

  }
}
