import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from '../service/exportService/excelService';
import { PdfService } from '../service/exportService/pdfService';
import { PrintService } from '../service/exportService/printService';
import { CopyService } from '../service/exportService/copyService';

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
  selector: 'app-mastercategory',
  templateUrl: './mastercategory.component.html',
  styleUrls: ['./mastercategory.component.scss']
})
export class MastercategoryComponent implements OnInit {


  category: any = {
      name: '',
    image: '',
    status: '',

  };
  categoryId: any;
  limit: any = 9;
  offset: any = 0;
  value: any;
  currentPage: any;
  totalCount: any;
  categoryList: any = [
    // { id: "1", name: "Essential", date: "2023-10-18 13:18:10", status: 'Enabled' },
    // { id: "2", name: "Documents", date: "2023-10-18 13:18:10", status: 'Enabled' },
    // { id: "3", name: "Documents", date: "2023-10-18 13:18:10", status: 'Enabled' },
  ]
  modalRef!: BsModalRef;
  showAdd: any;
  userInfo: any;
  userrole: any;
  showEdit: any;
  showDelete: any;

  constructor(private router: Router, private apiservice: ApiServiceService, private toastrService: ToastrService,
    private modalService: BsModalService, private dialog: MatDialog, private excelService: ExcelService, private pdfService: PdfService, private printService: PrintService, private copyService: CopyService) { }

  ngOnInit(): void {
    this.getCategoryList();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "categories"));
        this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        this.showDelete = getTrueViewActions(pageDetails, 'Delete')?.length ? true : false
        console.log(this.showDelete)
      }
    }
  }

  exportAsXLSX(): void {
    // this.excelService.exportAsExcelFile(this.categoryList, 'categoryList');
    this.path = 'categories';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'Category_list' + '_' + Date.now();
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
    this.path = 'categories';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code == 200) {
        let data = res.data;
        let name = 'Category_list' + '_' + Date.now();
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
    await this.getCategoryList();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }

      this.limit = 10;
      this.getCategoryList();
    }, 1000);
  }
  async copyTable(): Promise<void> {
    this.limit = this.totalCount;
    await this.getCategoryList();
    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = 9;
      this.getCategoryList();
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
  // editTerms(item: any) {
  //   this.router.navigate(['terms/update', { id: item?.id }]);
  // }

  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getCategoryList();
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
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getCategoryList();
  }
  cancel() {
    this.modalRef.hide();
    this.getCategoryList();

  }
  // pageChange(e: any): void {
  //   this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
  //   this.getCategoryList();
  // }
  // paginationOffset(currentPage: any, itemsPerPage: any) {
  //   let offset = currentPage * itemsPerPage + 1;
  //   return (offset = offset < 0 ? offset : offset - 1);
  // }
  // AddModal(template: TemplateRef<any>,) {
  //   this.modalRef = this.modalService.show(
  //     template,
  //     Object.assign({}, { class: 'custm_modal gray modal-lg' })
  //   );
  // }
  isAddMode: boolean = true;
  AddModal(template: TemplateRef<any>) {
    this.isAddMode = true;
    this.category = {}; // Reset the category object for a new entry
    this.imagelist = null; // Clear the image list
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



  // addCategory(categoryForm: any): void {
  //   if (categoryForm.form.valid) {
  //     const payload = {
  //       name: this.category.categoryName,
  //       image: this.category.categoryImage,
  //       status: this.category.status
  //     };
  //     const apiCall = this.isAddMode
  //       ? this.apiservice.createCategory(payload)
  //       : this.apiservice.updateCategory(payload, this.category._id);

  //     apiCall.subscribe(
  //       (res) => {
  //         if (res.status === 200) {
  //           this.toastrService.success(res.message);
  //           categoryForm.reset();
  //           this.modalRef.hide();
  //           this.getCategoryList();
  //         } else {
  //           this.toastrService.error(res.message);
  //         }
  //       },
  //       (err) => {
  //         this.toastrService.error('Invalid value');
  //       }
  //     );
  //   } else {
  //     this.toastrService.error('All fields are required');
  //   }
  // }
  addCategory(categoryForm: any, item: any) {
    let payload = {};
    if (this.isAddMode) {
      if (categoryForm.form?.valid) {
        console.log('Form Submitted:', this.category.categoryName, this.category);
        payload = {

          "name": this.category.name,
          "image": this.category?.image,
          "status": this.category?.status,
        }
        console.log(payload)
        this.apiservice.createCategory(payload).subscribe((res) => {
          console.log(res)
          if (res.status = 200) {
            // this.loaderapi = false;
            this.toastrService.success(res?.message)
            // this.toastrService.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
            categoryForm.reset();
            this.modalRef.hide();
            this.getCategoryList();
          }
          else {
            // this.loaderapi = false;
            this.toastrService.error(res.message);
          }
        }, err => {
          this.toastrService.error('Invalid value');
        })

      } else {
        this.toastrService.error('All fields are required');
      }
    } else {
      if (categoryForm.form?.valid) {
        console.log('Form Submitted:', this.category.categoryName, this.category);
        payload = {
          "name": this.category.name,
          "image": this.category?.image,
          "status": this.category?.status,
        }
        console.log(payload)
        this.apiservice.updateCategory(payload, this.category?._id).subscribe((res) => {
          console.log(res)
          if (res.status = 200) {
            // this.loaderapi = false;
            this.toastrService.success(res?.message)
            // this.toastrService.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
            categoryForm.reset();
            this.modalRef.hide();
            this.getCategoryList();
          }
          else {
            // this.loaderapi = false;
            this.toastrService.error(res.message);
          }
        }, err => {
          this.toastrService.error('Invalid Value');
        })

      } else {
        this.toastrService.error('All fields are required');
      }
    }

  }
  getCategoryList() {
    this.apiservice
      .getlistCategory(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.categoryList = res.data?.data;
          this.totalCount = res?.data?.totalCount;
          console.log(this.categoryList)
          // this.searchLoad = false;
        } else {
        }
      })
      .catch((err: any) => { });
  }
  filebase: any;
  fileuploadstatus = false;
  imagelist: any;
  // async onChange(files) {
  //   this.fileuploadstatus = true;
  //   // this.imagelist.imgUrl.value = 'src/assets/images/custm-nbb/user_dummy.png';
  //   if (files && files.length > 0) {
  //     var file = files[0];
  //     let ext =
  //       file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
  //       file.name;
  //     //.png,.jpg,.pdf,.doc,.docx,.jpeg
  //     // console.log("file.size",file.size)
  //     if (
  //       ext == 'png' ||
  //       ext == 'jpg' ||
  //       ext == 'pdf' ||
  //       ext == 'doc' ||
  //       ext == 'docx' ||
  //       ext == 'jpeg'
  //     ) {
  //       if (!(file.size > 2097152)) {
  //         // console.log(files)
  //         let x: any;
  //         var splitted;
  //         // this.urls ;
  //         var reader = new FileReader();
  //         reader.readAsDataURL(file);
  //         reader.onload = function () {
  //           let str: any = reader.result;
  //           splitted = str.split(',');
  //         };
  //         setTimeout(() => {
  //           this.uploadFile(files, files[0], splitted[1]);
  //           // console.log("Data", splitted)
  //           // this.urls.push(x)
  //         }, 1000);
  //         this.filebase = splitted;
  //         console.log(this.filebase);
  //         this.toastrService.success('Uploaded successfully..!');
  //         this.getCategoryList();
  //       } else {
  //         this.fileuploadstatus = false;
  //         this.toastrService.error('Please Upload less 2mb file');
  //       }
  //     } else {
  //       this.toastrService.error('Invalid file format');
  //     }
  //   }
  // }
  imageUrl: any;
  apierror: any;
  // onFileSelected(event: any,) {
  //   const file = event.target.files && event.target.files[0];
  //   if (file) {
  //     const fileType = file?.type;
  //     if (fileType === 'image/jpeg' || fileType === 'image/png') {
  //       var reader = new FileReader();
  //       reader.readAsDataURL(event.target.files[0]);
  //       reader.onload = (event) => {
  //         this.imageUrl = event?.target?.result;
  //         console.log(this.imageUrl)
  //       }
  //       this.apierror = '';
  //       this.uploadFile(event.target.files[0],);
  //     } else {
  //       this.apierror = "jpeg and png images are Allowed"

  //     }
  //   }
  // }
  // async uploadFile(file) {
  //   const formData1: any = new FormData();

  //   formData1.append('file', file);

  //   await this.apiservice.WithoutUploadFile(formData1).subscribe(
  //     (res) => {
  //       console.log(res)
  //       this.imagelist = res.data?.location;
  //       this.category.categoryImage = this.imagelist;
  //       console.log(this.category)
  //       console.log(this.imagelist)
  //       // this.getCategoryList();
  //     },
  //     (err) => {
  //       console.log(err)
  //       // this.fileuploadstatus = false;
  //     }
  //   );
  //   // this.getCategoryList();
  // }
  async onChange(files) {

    // this.imagelist.imgUrl.value = 'src/assets/images/custm-nbb/user_dummy.png';
    if (files && files.length > 0) {
      var file = files[0];
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      //.png,.jpg,.pdf,.doc,.docx,.jpeg
      // console.log("file.size",file.size)
      if (
        ext == 'png' ||
        ext == 'jpg' ||
        ext == 'pdf' ||
        ext == 'doc' ||
        ext == 'docx' ||
        ext == 'jpeg'
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

          this.toastrService.error('Please Upload less 2mb file');
        }
      } else {
        this.toastrService.error('Invalid file format');
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
        this.category.image = res?.data?.Location;

      },
      (err) => {

      }
    );

  }
  removeImage() {
    this.imagelist = '';
    this.category.image = '';

  }
  editCategory(template: TemplateRef<any>, category: any) {
    this.isAddMode = false;
    console.log(category)
    this.category = { ...category }; // Populate the category object with the selected item
    this.imagelist = category.image || null; // Set the image if available
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'custm_modal gray modal-lg' })
    );
    console.log(this.category)
    this.category.name = this.category?.name;
    this.category.image = this.category?.image;
    this.category.status = this.category?.status;
  }
  // editCategory(template: TemplateRef<any>, item: any) {
  //   console.log(item)

  //   this.modalRef = this.modalService.show(
  //     template,
  //     Object.assign({}, { class: 'custm_modal gray modal-lg' })
  //   );
  //   this.category.categoryName = item?.name;
  //   this.category.categoryImage = item?.image;
  //   this.category.status = item?.status;
  // }
  // deleteCategory(i: any) {
  //   let dialogRef = this.dialog.open(DialogueComponent, {
  //     height: '150px',
  //     data: { status: "Delete" },
  //     disableClose: true

  //   });
  //   dialogRef.afterClosed().subscribe((data) => {
  //     if (data) {
  //       this.apiservice.createAdmin({ deleted: true }, i?._id).subscribe((res) => {
  //         this.getCategoryList();
  //         if (res?.status) {
  //           this.toastrService.success(res.message);
  //           this.getCategoryList();
  //         } else {
  //           this.getCategoryList();
  //           this.toastrService.error(res.message);
  //         }
  //       }, err => {
  //         this.toastrService.error('Failed to delete');
  //       })
  //     }
  //   });
  // }
}
