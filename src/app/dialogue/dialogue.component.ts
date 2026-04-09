import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.scss']
})
export class DialogueComponent implements OnInit {
  createForm: FormGroup;
  resetForm: FormGroup;
  submitted = false;
  loaderapi = false;
  userId: any;
  message: string = "Are you sure You Want to "
  msg: string = "this user?"
  cancelButtonText = "Cancel"
  confirmButtonText = "Confirm"
  showmsg: any;
  _api: any;
  status: any;
  label = 'create';
  show: boolean=false;
  numberError: boolean=false;
  numberStart: boolean=false;



  constructor(private router: Router, private activateRoute: ActivatedRoute, @Inject(MAT_DIALOG_DATA) public data: any, public _dialogRef: MatDialogRef<DialogueComponent>,
    private apiservice: ApiServiceService, private formBuilder: FormBuilder, private toastrService: ToastrService) {
    this.createForm = this.formBuilder.group({
      username: ['', Validators.required],
      number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', Validators.required],

    })
    this.resetForm = this.formBuilder.group({
      password: [, Validators.required],
    })
  }
  ngOnInit(): void {
    this.createForm = this.formBuilder.group({
      username: [, Validators.required],
      number: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]

    });
    if (this.data) {
      this.label = 'Update'
      this.createForm.get('username')?.patchValue(this.data?.name);
      this.createForm.get('email')?.patchValue(this.data?.email);
      this.createForm.get('number')?.patchValue(this.data?.mobileNo);
      this.userId = this?.data?._id;

      this.createForm?.controls['password']?.clearValidators();
      this.createForm?.get('password')?.updateValueAndValidity();
    }
    {
      this.status = this?.data?.status;
    }

  }
  get f(): { [key: string]: AbstractControl } {
    return this.createForm.controls;
  }
  create() {
    this.submitted = true;
    let payload = {
      "name": this.createForm?.value?.username,
      "mobileNo": this.createForm?.value?.number,
      "email": this.createForm?.value?.email,
      "password": this.createForm?.value?.password,
      "role": 'subadmin',
      "isVerified": true
    }

    if (this.createForm?.valid) {
      this.loaderapi = true;
      this.apiservice.createAdmin(payload, this.userId).subscribe((res) => {
        console.log(res)
        if (res.status = 200) {
          this.loaderapi = false;
          this.toastrService.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
          this.createForm.reset();
          this._dialogRef.close(true);
        }
        else {
          this.loaderapi = false;
          this.toastrService.error(res.message);
        }


      }, err => {
        this.toastrService.error('Invalid email/mobile No');
      })
    } else {
      this.toastrService.error('Invalid input provided');
    }


  }
  onSubmit(): void {
    this.submitted = true;
  }
  resetPassword() {
    if (!this.resetForm.valid) {
      this.toastrService.error('Please Provide Password');
    } else {
      let payload = {
        "password": this.resetForm?.value?.password,
        "userId": this.data?.userId
      }
      this.apiservice.resetPassword(payload).subscribe((res: any) => {
        if (res.code == 200) {
          this.toastrService.success('Password Reset Successfully');
          this._dialogRef.close(true);
        }
        else {
          this.toastrService.error(res?.message);
        }
      }, (err: any) => {
        this.toastrService.error(' Already Exist');
      })

    }
  }
password='password';
  onClick() {
    if (this.password === 'password') {
      this.password = 'text';
      this.show = true;
    } else {
      this.password = 'password';
      this.show = false;
    }
  }
  userNameCheck = false;
  emailAddrCheck = false;
  pwdLengCheck = false;
  numberCheck() {
    if (this.stringContainsNumber(this.createForm?.value?.username)) {
      this.userNameCheck = true;
    } else {
      this.userNameCheck = false;
    }
  }
  emailCheck() {
    if (this.emailFormatCheck(this.createForm?.value?.email)) {
      this.emailAddrCheck = true;
    } else {
      this.emailAddrCheck = false;
    }
  }
  pwdLengthCheck() {
    if (this.pwdLenCheck(this.createForm?.value?.password)) {
      this.pwdLengCheck = true;
    } else {
      this.pwdLengCheck = false;
    }
  }
  pwdLenCheck(str: string) {
    if (str.length < 6) {
      return true;
    } else {
      return false;
    }
  }
  stringContainsNumber(str: string) {
    return /\d/.test(str);
  }
  emailFormatCheck(email: string) {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!reg.test(email)) {
      return true;
    }
    return false;
  }
  mobileNumberTest() {
    let num = this.createForm?.value?.number;
    let count = num.toString().length;
    if (count > 10 || count < 10) {
      this.numberError = true;
    } else {
      this.numberError = false;
    }
    let string1 = num.toString().substring(0, 1);
    if (string1 == '1' || string1 == '2' || string1 == '3' || string1 == '4' || string1 == '5') {
      this.numberStart = true
    } else {
      this.numberStart = false;
    }
  }

}
