import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/service/api-service.service';

@Component({
  selector: 'app-courier-add',
  templateUrl: './courier-add.component.html',
  styleUrls: ['./courier-add.component.scss']
})
export class CourierAddComponent implements OnInit {

  createForm = {
    "name": "",
    "mobileNo": "",
    "email": "",
    // "password": "",
    "address": {
      "fullAddress": "",
      "street": "",
      "landMark": "",
      "postalCode": "",
      "state": "",
      "city": "",
      "country": ""
    },
    "imgUrl": '',
    "drivingLicense": "",
    "rcBook": "",
    "insurance": "",
    "role": "deliveryman",
    "isVerified": true,
    "status": "",

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
      if (!this.createForm.imgUrl) {
        this.toastr.error('Please upload Profile Image');
        return;
      }
      if (!this.createForm.drivingLicense) {
        this.toastr.error('Please upload Driving License');
        return;
      }
      if (!this.createForm.rcBook) {
        this.toastr.error('Please upload RC Book');
        return;
      }
      if (!this.createForm.insurance) {
        this.toastr.error('Please upload Bike Insurance');
        return;
      }
      // this.createForm.pageAccess = this.displayDetailpages;
      this.apiservice.createAdmin(this.createForm, "").subscribe((res) => {
        console.log(res)
        if (res.status = 200) {
          this.toastr.success('Registered Successfully');

          // this.toastr.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
          this.clear();
          sessionStorage.setItem('deliveryman', 'All');
          this.router.navigate([
            '/couriers/master',
          ]);
        }
        else {

          this.toastr.error(res.message);
        }


      }, err => {
        this.toastr.error('Invalid email/mobile No');
      })
    } else {
      this.toastr.error('Invalid input provided');
    }


  }

  clear() {
    this.createForm.name = '';
    this.createForm.mobileNo = '';
    this.createForm.email = '';
    // this.createForm.password = '';

    this.createForm.address.fullAddress = '';
    this.createForm.address.landMark = "";
    this.createForm.address.country = "";
    this.createForm.address.postalCode = "";
    this.createForm.address.state = "";
    this.createForm.address.city = "";
    this.createForm.imgUrl = "",
      this.createForm.drivingLicense = "",
      this.createForm.rcBook = "",
      this.createForm.insurance = ""
    this.createForm.status = '';
    this.createForm.role = "deliveryman"
    this.createForm.isVerified = true;
    // this.createForm.pageAccess = "";

  }

  cancel() {
    this.router.navigate([
      '/couriers/master',
    ]);
  }
  async onChange(files, type) {

    // this.imagelist.imgUrl.value = 'src/assets/images/custm-nbb/user_dummy.png';
    if (files && files.length > 0) {
      var file = files[0];
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      if (ext == 'png' || ext == 'jpg' || ext == 'jpeg') {
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
            this.uploadFile(files, files[0], splitted[1], type);
            // console.log("Data", splitted)
            // this.urls.push(x)
          }, 1000);
          ;
          // this.toastr.success('Uploaded successfully..!');

        } else {

          this.toastr.error('Please Upload less 2mb file');
        }
      } else {
        this.toastr.error('Invalid file format');
      }
    }
  }
  async uploadFile(files, file, splitted, type) {
    console.log("welcom")
    const formData1: any = new FormData();

    formData1.append('file', file);
    console.log("welcom", formData1)
    await this.apiservice.WithoutUploadFile(formData1).subscribe(
      (res) => {
        console.log(res)
        if (type == 'profile') {
          this.createForm.imgUrl = res?.data?.Location;

        } else if (type == 'insurance') {
          this.createForm.insurance = res?.data?.Location;

        }
        else if (type == 'rcbook') {
          this.createForm.rcBook = res?.data?.Location;

        } else if (type == 'driving') {
          this.createForm.drivingLicense = res?.data?.Location;

        }

      },
      (err) => {

      }
    );

  }

  removeImage(type?: string) {
    if (!type || type === 'profile') {
      this.createForm.imgUrl = '';
    } else if (type === 'driving') {
      this.createForm.drivingLicense = '';
    } else if (type === 'rcbook') {
      this.createForm.rcBook = '';
    } else if (type === 'insurance') {
      this.createForm.insurance = '';
    }
  }

}
