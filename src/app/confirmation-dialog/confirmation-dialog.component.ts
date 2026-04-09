import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  message: string = 'Are You Sure You Want To ';
  msg: string = 'This Record?';
  confirmButtonText = 'Yes';
  cancelButtonText = 'Cancel';
  showmsg: any;


  //   @Output() ParentComponet:EventEmitter<any> = new EventEmitter()
  status: any;
  role: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'yfgdsyfgdsj')
    this.status = this.data.status;
    console.log(this.status);
    this.role = this.data.role;
    console.log(this.role);
  }

  onNoClick(): void {
    this._dialogRef.close(true);
  }
}
