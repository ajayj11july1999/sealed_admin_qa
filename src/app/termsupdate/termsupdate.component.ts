import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';



import { ToolbarService, LinkService, ImageService, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

// import { ToolbarService, LinkService, ImageService, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
@Component({
  selector: 'app-termsupdate',
  templateUrl: './termsupdate.component.html',
  styleUrls: ['./termsupdate.component.scss']
})
export class TermsupdateComponent implements OnInit {
  userType: any = [
    { id: 1, name: 's2b' },
    { id: 2, name: 'b2c' }

  ]
  termsForm = {
    _id: '',
    content: '',
    type: ''
  }
  id: any;
  termsList: any;
  constructor(private router: Router, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private apiservice: ApiServiceService, private activatedRoute: ActivatedRoute) { }
  rteValue: any;
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      console.log(params);
      this.id = params?.id;
      this.getlistTermsById();
    });
  }
  getlistTermsById() {
    this.apiservice.gettermsById(this.id)
      .then((res: any) => {
        if (res.code == 200) {
          this.termsList = res.data;
          this.termsForm.content = this.termsList.content;
          this.termsForm.type = this.termsList.type
          this.termsForm._id = this.termsList._id
          // this.searchLoad = false;
        } else {
          this.termsList = [];
        }
      })
      .catch((err: any) => { });
  }
  onSelectionChange(e) {
    console.log(e)
  }
  updateTerms(f) {
    if (f.form.valid) {
      this.apiservice.createTerms(this.termsForm, this.termsForm._id).subscribe((res) => {

        let result = res;

        if (result.code == 200) {
          this.toastr.success(result.message);
          // this.isedit = false;
          this.clear();
          this.router.navigate(['terms']);
        } else {
          this.toastr.error(result.message);
        }

        // this.spinner.hide();

      }, err => {
        this.spinner.hide();
      })
    }
    else {
      this.toastr.warning('Please fill all the required fields');
    }

  }
  clear() {
    this.termsForm.content = '';
    this.termsForm.type = '';
  }
  cancel() {
    this.router.navigate(['/terms']);
  }
}


