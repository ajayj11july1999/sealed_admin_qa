import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/service/api-service.service';

@Component({
  selector: 'app-b2b-add',
  templateUrl: './b2b-add.component.html',
  styleUrls: ['./b2b-add.component.scss']
})
export class B2bAddComponent implements OnInit {

  createForm = {
    "name": "",
    "mobileNo": "",
    "email": "",
    "password": "",
    "usertype": "",

    "status": "",
    "gstNo": "",

    "address": {
      "companyName": "",
      "fulladdress": "",
      "postalCode": "",
      "state": "",
      "country": "",
      "city": "",
    }



  }
  constructor(private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService,
    private apiservice: ApiServiceService,
    private dialog: MatDialog,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
  }
  create(f) {

    if (f.form?.valid) {
      // this.createForm.pageAccess = this.displayDetailpages;
      this.apiservice.createAdmin(this.createForm, "").subscribe((res) => {
        console.log(res)
        if (res.status = 200) {
          this.toastr.success('Registered Successfully');

          // this.toastr.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
          this.clear();
          this.router.navigate([
            '/b2b-customers',
          ]);
        }
        else {

          this.toastr.error(res.message);
        }


      }, err => {
        console.log(err)
        this.toastr.error(err?.error?.data);
      })
    } else {
      this.toastr.error('Invalid input provided');
    }


  }

  clear() {
    this.createForm.name = '';
    this.createForm.mobileNo = '';
    this.createForm.email = '';
    this.createForm.password = '';
    // this.createForm.role = 'subadmin';
    this.createForm.address.companyName = '';
    this.createForm.gstNo = "";
    this.createForm.address.fulladdress = "";
    this.createForm.address.postalCode = "";
    this.createForm.address.state = "";
    this.createForm.address.country = "";

    this.createForm.address.city = "";
    this.createForm.usertype = "",
      this.createForm.status = '';


  }

  cancel() {
    this.router.navigate([
      '/add-subadmin',
    ]);
  }
}
