import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss']
})
export class AboutusComponent implements OnInit {

  aboutform: any = {
    "content": "",
    "status": "active",
    "_id": null
  }
  isedit = false;
  modalRef!: BsModalRef;
  constructor(private apiservice: ApiServiceService, private modalService: BsModalService,
    private toastr: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {

    this.getAboutus();
    if (this.aboutform?._id) {
      this.isedit = false;
    } else {
      this.isedit = true;
    }
  }

  getAboutus() {
    this.apiservice
      .getAboutUs()
      .then((res: any) => {
        if (res.code == 200) {
          this.aboutform._id = res.data?.data[0]?._id
          this.aboutform.content = res.data?.data[0].content;

        } else {
          this.aboutform.content = '';
        }
      })
      .catch((err: any) => { });
  }

  addAboutUs(f: any): void {
    console.log(f)
    console.log(this.aboutform.content);
    if (f.form?.valid) {
      if (this.aboutform?._id) {
        // this.aboutform.content = this.aboutform.content.replace(/<[^>]+>/g, '');
        console.log(this.aboutform.content)
        this.apiservice.createAboutUs(this.aboutform, this.aboutform?._id).subscribe((response) => {
          console.log('About Us updated successfully');
          this.toastr.success(response?.message)
        });

      } else {
        this.apiservice.createAboutUs(this.aboutform, '').subscribe((response) => {
          console.log('About Us created successfully');
          this.toastr.success(response?.message)
        });
      }
    } else {
      this.toastr.warning('Please fill all the required fields');
    }

  }
}
