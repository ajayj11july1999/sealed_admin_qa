import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/service/api-service.service';

@Component({
  selector: 'app-create-update-admin',
  templateUrl: './create-update-admin.component.html',
  styleUrls: ['./create-update-admin.component.scss']
})
export class CreateUpdateAdminComponent implements OnInit {

  displayDetailpages: any = [
    {
      page_name: "Search",
      name_type: "search",
      action: [{
        name: "View",
        check: false
      }]
    },
    {
      page_name: "S2B Trips",
      name_type: "S2B_trips",
      action: [{
        name: "View",
        check: false
      }]
    },
    {
      page_name: "B2C Trips",
      name_type: "S2C_trips",
      action: [{
        name: "View",
        check: false
      }]
    },
    {
      page_name: "Stamp Document",
      name_type: "stamp_document",
      action: [{
        name: "View",
        check: false
      }]
    }
    ,
    {
      page_name: "S2B Customers",
      name_type: "b2b-customers",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Edit",
        check: false
      }, {
        name: "Export",
        check: false
      }]
    },
    {
      page_name: "B2C Customers",
      name_type: "s2C_customers",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Export",
        check: false
      }]
    },
    {
      page_name: "Courier partners",
      name_type: "courier_partners",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Edit",
        check: false
      }, {
        name: "Export",
        check: false
      }, {
        name: "View Trip Amount ",
        check: false
      }, {
        name: "Edit Trip Amount ",
        check: false
      }]
    },
    {
      page_name: "Categories",
      name_type: "categories",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Edit",
        check: false
      }, {
        name: "Export",
        check: false
      }, {
        name: "View Categories Type",
        check: false
      }, {
        name: "Add Categories Type",
        check: false
      }, {
        name: "Edit Categories Type ",
        check: false
      }]
    },
    {
      page_name: "Pricing Master",
      name_type: "customer_pricing",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Edit",
        check: false
      }, {
        name: "Delete",
        check: false
      }]
    },
    {
      page_name: "Manage Coupon",
      name_type: "customer_coupon",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Edit",
        check: false
      }]
    },
    {
      page_name: "Stamp",
      name_type: "Stamp",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Edit",
        check: false
      },
      {
        name: "View Stamp Type",
        check: false
      },
      {
        name: "Add Stamp Type",
        check: false
      },
      {
        name: "Edit Stamp Type ",
        check: false
      }]
    },
    {
      page_name: "Payouts",
      name_type: "Courier_Partner_Payout",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "History",
        check: false
      }]
    },
    {
      page_name: "Setting",
      name_type: "Settings",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Delete",
        check: false
      }]
    },
    {
      page_name: "Booking Instruction",
      name_type: "Booking_Instruction",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Delete",
        check: false
      }]
    },
    {
      page_name: "FAQ",
      name_type: "FAQ",
      action: [{
        name: "View",
        check: false
      },
      {
        name: "Add",
        check: false
      },
      {
        name: "Delete",
        check: false
      }]
    },

  ]


  createForm = {
    "name": "",
    "mobileNo": "",
    "email": "",
    "password": "",
    "role": 'subadmin',
    "isVerified": true,
    "status": "",
    "pageAccess": ""
  }
  userId: any;
  // isUpdate:boolean=false;
  constructor(
    private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService,
    public spinner: NgxSpinnerService,
    private apiservice: ApiServiceService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    console.log(this.displayDetailpages)
    this.route.queryParams.subscribe(params => {
      console.log('queryParams on payment script', params);
      this.userId = params.id ? params.id : '';
      if (params?.result) {
        let data = JSON.parse(params.result);
        console.log(data)
        this.createForm = data;
        console.log('queryParams on payment script', data);
        // this.displayDetailpages = data?.pageAccess ? data?.pageAccess : this.displayDetailpages
        this.displayDetailpages = this.mergeArrays(this.displayDetailpages, data?.pageAccess,);
        //   if (data?.pageAccess) {
        //     this.displayDetailpages = this.mergePageAccess(data.pageAccess);
        //   } else {
        //     // If pageAccess is empty, use default displayDetailpages
        //     this.displayDetailpages = this.displayDetailpages;
        //   }
        // } else {
        //   // Default page access if no result is present
        //   this.displayDetailpages = this.displayDetailpages;

      }
    });
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
  // mergePageAccess(retrievedPageAccess) {
  //   return this.displayDetailpages.map((defaultPage) => {
  //     const retrievedPage = retrievedPageAccess.find(
  //       (page) => page.name_type === defaultPage.name_type
  //     );

  //     if (retrievedPage) {
  //       // Merge actions by matching name
  //       defaultPage.action = defaultPage.action.map((defaultAction) => {
  //         const retrievedAction = retrievedPage.action.find(
  //           (action) => action.name === defaultAction.name
  //         );
  //         return retrievedAction ? retrievedAction : defaultAction;
  //       });
  //     }
  //     return defaultPage;
  //   });
  // }

  create(f) {

    if (f.form?.valid) {
      this.createForm.pageAccess = this.displayDetailpages;
      this.apiservice.createAdmin(this.createForm, this.userId).subscribe((res) => {
        console.log(res)
        if (res.status = 200) {
          this.toastr.success(this.userId ? 'Updated Successfully' : 'Registered Successfully');
          this.clear();
          this.router.navigate([
            '/add-subadmin',
          ]);
        }
        else {

          this.toastr.error(res.message);
        }


      }, err => {
        this.toastr.error(err?.error.data);
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
    this.createForm.role = 'subadmin';
    this.createForm.status = '';
    this.createForm.isVerified = true;
    this.createForm.pageAccess = "";

  }

  cancel() {
    this.router.navigate([
      '/add-subadmin',
    ]);
  }
}
