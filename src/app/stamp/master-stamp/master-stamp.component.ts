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
import { CopyService } from 'src/app/service/exportService/copyService';
import { PdfService } from 'src/app/service/exportService/pdfService';
import { ExcelService } from 'src/app/service/exportService/excelService';
import { PrintService } from 'src/app/service/exportService/printService';

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
  selector: 'app-master-stamp',
  templateUrl: './master-stamp.component.html',
  styleUrls: ['./master-stamp.component.scss']
})
export class MasterStampComponent implements OnInit {
  readonly nameMaxLength = 20;
  readonly smallDescriptionMaxLength = 100;
  readonly descriptionMaxLength = 200;
  private readonly alphanumericPattern = /^[a-zA-Z0-9\s]+$/;
  private readonly amountPattern = /^[0-9]+(\.[0-9]{1,2})?$/;
  private readonly controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

  statuses = [
    { name: 'Active', value: 'active' },
    { name: 'Inactive', value: 'inactive' },
    // { name: 'Pending', value: 'pending' }
  ];
  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  databaseList: any = []
  modalRef!: BsModalRef;
  isedit = false;
  createForm: any = {
    name: '',
    amount: '',
    type: '',
    smallDescription: '',
    description: '',
    status: '',
    image: '',
    _id: null
  }
  userInfo: any;
  userrole: any;
  showAdd: any;
  showEdit: any;
  constructor(private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService, private printService: PrintService,
    private apiservice: ApiServiceService, private copyService: CopyService, private pdfService: PdfService, private excelService: ExcelService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getlistMasterStamp();
    this.getlistTypeStamp();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Stamp"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false

      }
    }
  }

  editTerms(item: any) {
    this.isedit = true;
    this.createForm = {
      ...item,
      name: this.sanitizeAlphanumeric(item?.name, this.nameMaxLength),
      smallDescription: this.sanitizeAlphanumeric(item?.smallDescription, this.smallDescriptionMaxLength),
      description: this.sanitizeAlphanumeric(item?.description, this.descriptionMaxLength),
      amount: this.sanitizeAmount(item?.amount),
    };
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getlistMasterStamp();
  }


  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo * this.pageSize;
    this.getlistMasterStamp();
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

  getlistMasterStamp(): Promise<void> {
    // this.limit = 9;
    // this.offset = 0;
    return this.apiservice.getlistMasterStamp(this.limit, this.offset, this.value)
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
  stampTypeList: any;
  getlistTypeStamp() {

    this.apiservice.getDropDownTypeStamp()
      .then((res: any) => {
        if (res.code == 200) {
          this.stampTypeList = res.data;
        } else {
          this.databaseList = [];
        }
      })
      .catch((err: any) => { });
  }

  createMasterStamp(f) {
    this.sanitizeFormFields();
    if (!f.form.valid || !this.isValidMasterStampForm()) {
      f.form.markAllAsTouched();
      this.toastr.warning('Please fill all the required fields correctly');
      return;
    }
    this.apiservice.createMasterStamp(this.createForm, this.createForm._id).subscribe((res) => {
        let result = res;
        if (result.code == 200) {
          this.toastr.success(result.message);
          this.isedit = false;
          this.clear();
          this.getlistMasterStamp();
          this.modalRef.hide();
        } else {
          this.toastr.error(result.message);
        }

        this.spinner.hide();

      }, err => {
        this.spinner.hide();
      });
  }

  clear() {
    this.isedit = false;
    this.createForm = {
      name: '',
      amount: '',
      type: '',
      smallDescription: '',
      description: '',
      status: '',
      image: '',
      _id: null
    };
  }
  cancel() {
    // this.isedit = false;
    // this.clear();
    this.modalRef.hide();
  }


  deleteKm(i?: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.apiservice.deleteMasterStamp(i._id).subscribe((res) => {

          if (res.code == 200) {
            this.toastr.success(res.message);
            this.getlistMasterStamp();
          } else {
            this.toastr.error(res.message);
          }

        }),
          (err) => { };
      }
    });
  }


  async onChange(files) {

    // this.imagelist.imgUrl.value = 'src/assets/images/custm-nbb/user_dummy.png';
    if (files && files.length > 0) {
      var file = files[0];
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      const allowedExtensions = ['png', 'jpg', 'jpeg'];
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (
        allowedExtensions.includes(ext.toLowerCase()) &&
        allowedMimeTypes.includes(file.type)
      ) {
        if (!(file.size > 2097152)) {
          // console.log(files)
          let x: any;
          var splitted;
          // this.urls ;
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            let str: any = reader.result;
            splitted = str.split(',');
          };
          setTimeout(() => {
            this.uploadFile(files, files[0], splitted[1]);
            // console.log("Data", splitted)
            // this.urls.push(x)
          }, 1000);
          ;
          // this.toastr.success('Uploaded successfully..!');

        } else {

          this.toastr.error('Please Upload less 2mb file');
        }
      } else {
        this.toastr.error('Only image files (JPG, JPEG, PNG) are allowed.');
      }
    }
  }
  async uploadFile(files, file, splitted) {
    console.log("welcom")
    const formData1: any = new FormData();

    formData1.append('file', file);
    console.log("welcom", formData1)
    await this.apiservice.WithoutUploadFile(formData1).subscribe(
      (res) => {
        console.log(res)
        this.createForm.image = res?.data?.Location;

      },
      (err) => {

      }
    );

  }

  removeImage() {
    this.createForm.image = '';
  }

  sanitizeFormFields(): void {
    this.createForm.name = this.sanitizeAlphanumeric(this.createForm.name, this.nameMaxLength);
    this.createForm.smallDescription = this.sanitizeAlphanumeric(
      this.createForm.smallDescription,
      this.smallDescriptionMaxLength
    );
    this.createForm.description = this.sanitizeAlphanumeric(
      this.createForm.description,
      this.descriptionMaxLength
    );
    this.createForm.amount = this.sanitizeAmount(this.createForm.amount);
  }

  isValidMasterStampForm(): boolean {
    const name = this.createForm.name?.trim();
    const smallDescription = this.createForm.smallDescription?.trim();
    const description = this.createForm.description?.trim();
    const amount = String(this.createForm.amount ?? '').trim();

    if (!name || !this.alphanumericPattern.test(name)) {
      this.toastr.error('Stamp Name allows only letters, numbers, and spaces (max 100 characters).');
      return false;
    }
    if (!smallDescription || !this.alphanumericPattern.test(smallDescription)) {
      this.toastr.error('Small Description allows only letters, numbers, and spaces (max 200 characters).');
      return false;
    }
    if (!description || !this.alphanumericPattern.test(description)) {
      this.toastr.error('Description allows only letters, numbers, and spaces (max 500 characters).');
      return false;
    }
    if (!amount || !this.amountPattern.test(amount)) {
      this.toastr.error('Stamp Amount must be a valid number (e.g. 10 or 10.50).');
      return false;
    }
    return true;
  }

  sanitizeAlphanumeric(value: any, maxLength: number): string {
    if (value == null) {
      return '';
    }
    return String(value).replace(/[^a-zA-Z0-9\s]/g, '').slice(0, maxLength);
  }

  sanitizeAmount(value: any): string {
    if (value == null || value === '') {
      return '';
    }
    let str = String(value).replace(/[^0-9.]/g, '');
    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
      str = str.slice(0, dotIndex + 1) + str.slice(dotIndex + 1).replace(/\./g, '');
    }
    if (str.startsWith('.')) {
      str = `0${str}`;
    }
    const [intPart = '', decPart] = str.split('.');
    return decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
  }

  allowAlphanumericSpace(event: KeyboardEvent, maxLength: number): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (input.value.length >= maxLength) {
      event.preventDefault();
      return false;
    }
    if (!/^[a-zA-Z0-9\s]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onAlphanumericPaste(
    event: ClipboardEvent,
    field: 'name' | 'smallDescription' | 'description',
    maxLength: number
  ): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/[^a-zA-Z0-9\s]/g, '');
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeAlphanumeric(merged, maxLength);
    this.createForm[field] = sanitized;
    input.value = sanitized;
  }

  allowNumbersOnly(event: KeyboardEvent): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const char = event.key;
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(char)) {
      return true;
    }
    if (char === '.' && !input.value.includes('.')) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  onAmountPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeAmount(merged);
    this.createForm.amount = sanitized;
    input.value = sanitized;
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = this.sanitizeAmount(input.value);
    this.createForm.amount = sanitized;
    input.value = sanitized;
  }

  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'stamp';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'StampMaster' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(data, name)
      } else {
        this.databaseList = [];
      }
    })
      .catch((err: any) => { });


  }
  type: any;
  path: any;

  exportAsPdf() {
    this.path = 'stamp';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'StampMaster' + '_' + Date.now();
        this.pdfService.downloadBase64File(data, name)
      } else {
        this.databaseList = [];
      }
    })
      .catch((err: any) => { });


    // this.pdfService.exportToPDF(this.categoryList, 'categoryList')
  }


  async printTable(): Promise<void> {
    const savedLimit = this.limit;
    const savedList = [...this.databaseList];

    this.limit = this.totalCount;
    await this.getlistMasterStamp();

    const tableElement = document.querySelector('#table') as HTMLElement;
    if (tableElement) {
      this.printService.printElement(tableElement);
    }

    this.limit = savedLimit;
    this.databaseList = savedList;
  }

  async copyTable(): Promise<void> {
    const savedLimit = this.limit;
    const savedList = [...this.databaseList];

    this.limit = this.totalCount;
    await this.getlistMasterStamp();

    await this.copyService.copyTableText('#table');

    this.limit = savedLimit;
    this.databaseList = savedList;
  }
}



