import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogueComponent } from '../dialogue/dialogue.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiServiceService } from '../service/api-service.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-add-subadmin',
  templateUrl: './add-subadmin.component.html',
  styleUrls: ['./add-subadmin.component.scss']
})
export class AddSubadminComponent {
  value: any;
  offset: any = 0;
  limit: any = 7;
  usersList: any;
  totalCount: any;
  dataFromDialog: any;
  toastrService: any;
  item: any;
  createAdmin: any;
  // searchLoad : boolean = false;
  userType: any;
  currentPage: number | undefined;
  constructor(private router: Router, private dialog: MatDialog, private apiservice: ApiServiceService,) {

  }

  ngOnInit(): void {
    this.getB2bUserList();
  }

  getB2bUserList() {
    // this.searchLoad =true
    this.userType = 'subadmin';
    this.apiservice
      .getSubAdmin(this.userType, this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.createAdmin = res.data?.data;
          this.totalCount = res?.data?.totalCount;
          // this.mergeArrays(this.createAdmin?.pageAccess, result);

          // this.searchLoad = false;
        } else {
        }
      })
      .catch((err: any) => { });
  }

  mergeArrays(oldArray, newArray) {
    const serviceMap = new Map();
    oldArray.forEach(item => {
      serviceMap.set(item.name_type, item);
    });
    newArray.forEach(item => {
      serviceMap.set(item.name_type, item);
    });
    const outputArray = [...serviceMap.values()];
    const finalOutCome: any = outputArray.sort((a, b) => a.name_type.toString().localeCompare(b.name_type.toString()));

    return finalOutCome;
  }
  showPrompt(item?: any) {
    this.router.navigate([
      '/add-subadmin/create',

    ]);
    // const dialogRef = this.dialog.open(DialogueComponent, {
    //   width: '350px',
    //   height: item ?'400px' : '500px',
    //   disableClose: true,
    //   data: item

    // })
    // dialogRef.afterClosed().subscribe(() => {
    //   this.getB2bUserList()
    // });
  }
  pageChange(e: any): void {
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    this.getB2bUserList();
  }
  paginationOffset(currentPage: any, itemsPerPage: any) {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.value = e?.target?.value;
    this.currentPage = 0;
    this.getB2bUserList();
  }

  deleteUserList(i: any) {
    let dialogRef = this.dialog.open(DialogueComponent, {
      height: '150px',
      data: { status: "Delete" },
      disableClose: true

    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.apiservice.createAdmin({ deleted: true }, i?._id).subscribe((res) => {
          this.getB2bUserList();
          if (res?.status) {
            this.toastrService.success(res.message);
            this.getB2bUserList();
          } else {
            this.getB2bUserList();
            this.toastrService.error(res.message);
          }
        }, err => {
          this.toastrService.error('Failed to delete');
        })
      }
    });
  }


  resetPassword(item: any): void {
    const dialogRef = this.dialog.open(DialogueComponent, {
      width: '350px',
      height: '350px',
      disableClose: true,
      data: {
        status: 'resetPassword',
        userId: item?._id
      }
    });

    dialogRef.afterClosed().subscribe((data: { form: any; clicked: string; }) => {
      this.getB2bUserList();
    });
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
  editSub(item: any) {
    this.router.navigate(['/add-subadmin/create'], { queryParams: { id: item._id, result: JSON.stringify(item) } });
  }
}


