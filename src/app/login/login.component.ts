import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../environments/environment';

import * as CryptoJS from 'crypto-js';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form: any = FormGroup;
  public temppassform: any = FormGroup;
  isLoading = false;
  Loading = false;
  error_message = '';
  isTempPassChange = false;
  userObj: any;
  loginend: any;
  popups: boolean = false;
  roles: any = [];

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService, private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
    this.temppassform = this.fb.group({
      newpassword: ['', Validators.compose([Validators.required])],
    });
  }

  async userLoginAuth() { }

  async loginAuth() {
    console.log(this.form.value);
    this.apiService.LoginIn(this.form.value).subscribe(
      (res) => {
        console.log(res);
        if (res.code == 200) {
          if (res?.data?.data?.role == 'admin' || res?.data?.data?.role == 'subadmin') {
            let userInfo = res.data.data;
          localStorage.setItem('userInfoA', JSON.stringify(userInfo));

          const rawToken = (res.data.token || '').toString().trim();
          const normalizedToken = rawToken.replace(/^Bearer\s+/i, '');
          sessionStorage.setItem('tokenA', normalizedToken);
          localStorage.setItem('useridA', JSON.stringify(userInfo.userId));
          localStorage.setItem('pageAccess', JSON.stringify(res?.data?.data?.pageAccess));
            setTimeout(() => {
              this.router.navigate(['/Dashboard']);
            }, 1000);
          } else {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
              data: { login: true },
              disableClose: true
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                console.log(result);

                (err) => {

                };
              }
            });
          }

        }
      },
      (err) => {
        this.toastr.error(err?.error?.message ? err.error.message : 'Invalid Input')
        console.log(err);
      }
    );
  }

  async changeTempPass() { }



  forgot() {
    this.router.navigate(['/forgotpass']);
  }

  async checkTokenverify() {
    console.log('token popup calls');
    let timerID;
    timerID = setInterval(() => {
      if (this.popups) {
        // this.api.checkRefreshToken().then((checktoken)=>{
        //   console.log('checktoken res==>',checktoken)
        //   if(checktoken){
        //     clearInterval(timerID);
        //   }
        // }).catch((err)=>{
        //   console.log(err)
        // }) ;
      } else {
        clearInterval(timerID);
      }
    }, 10 * 1000);
  }
}
