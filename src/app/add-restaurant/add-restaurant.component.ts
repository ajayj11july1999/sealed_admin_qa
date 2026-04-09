import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from '../service/api-service.service';
// import { DateTime } from "luxon";
// import { DateTime } from 'luxon';

// interface CalendarForMessagesProps {
//   initialDate: DateTime;
// }

@Component({
  selector: 'app-add-restaurant',
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.scss']
})
export class AddRestaurantComponent implements OnInit {

  showimg: boolean = true;
  restaurantForm: FormGroup;
  foodtype: any = [];
  contactDetails: any = [];
  id: any;
  submitted = false;
  filebase!: any[];
  imagelist: any;
  imgUrl: any;
  btnlabel: any = 'Add';
  category=[
    {id:"1",name:"saas"},
    {id:"1",name:"saas"} ,
    {id:"1",name:"saas"},
    {id:"1",name:"saas"},
  ]
  constructor(private router:Router,private toastrService: ToastrService, private apiservice: ApiServiceService, private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder) {
    
    this.restaurantForm=this.formBuilder.group({
      restaurantName: ['',[Validators.required]],
      veg: new FormControl(false),
      nonVeg: new FormControl(false),
      ratings: ['',[Validators.required]],
      resoffer: ['',[Validators.required]],
      street: [''],
      city: ['',[Validators.required,Validators.pattern(/^[a-zA-Z\s'.,\-#]+$/)]],
      state: ['',[Validators.required,Validators.pattern(/^[a-zA-Z\s'.,\-#]+$/)]],
      pincode: ['',[Validators.required]],
      latitude: ['',[Validators.required,Validators.pattern(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/)]],
      longitude:['',[Validators.required,Validators.pattern(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)]],
      person1: ['',[Validators.required,Validators.pattern(/^[a-zA-Z'.,\- ]+$/)]],
      person2:['',[Validators.required,Validators.pattern(/^[a-zA-Z'.,\- ]+$/)]],
      contactNumber1: ['',[Validators.required]],
      contactNumber2: ['',[Validators.required]],
      startTime:['',[Validators.required]],
      endTime:['',[Validators.required]],
      description:['',[Validators.required]],
      
    });
  }
  label: any = 'Add';
  ngOnInit(): void {
   
    // this.activatedRoute.params.subscribe((params: any) => {
    //   console.log(params);
    //   this.id = params?.id;
    //   // this.getRestaurantById(this.id);
    // });
  }

  
  restaruantData: any
  // getRestaurantById(id?: any) {
  //   this.apiservice.getRestaurantById(id).then((res: any) => {
  //     if (res.code == 200) {
  //       this.showimg = false;
  //       this.label = 'Update';
  //       this.btnlabel = 'Update';
  //       console.log(res)
  //       this.restaruantData = res?.data ? res.data[0] : [];
  //       this.restaurantForm?.get("restaurantName")?.patchValue(this.restaruantData?.restaurantName);
  //       if (this.restaruantData?.foodType.includes("veg")) {
  //         this.restaurantForm?.get("veg")?.patchValue(true);
  //       }
  //       if (this.restaruantData?.foodType.includes("nonveg")) {
  //         this.restaurantForm?.get("nonVeg")?.patchValue(true);
  //       }
  //       this.imgUrl = this.restaruantData?.restaurantImage
  //       this.restaurantForm?.get("ratings")?.patchValue(this.restaruantData?.ratings);
  //       this.restaurantForm?.get("resoffer")?.patchValue(this.restaruantData?.resoffer);
  //       this.restaurantForm?.get("street")?.patchValue(this.restaruantData?.address?.street ? this.restaruantData.address.street : "");
  //       this.restaurantForm?.get("city")?.patchValue(this.restaruantData?.address?.city ? this.restaruantData.address.city : "");
  //       this.restaurantForm?.get("state")?.patchValue(this.restaruantData?.address?.state ? this.restaruantData.address.state : "");
  //       this.restaurantForm?.get("pincode")?.patchValue(this.restaruantData?.address?.pinCode ? this.restaruantData.address.pinCode : "");
  //       this.restaurantForm?.get("latitude")?.patchValue(this.restaruantData?.address?.latitude ? this.restaruantData.address.latitude : "");
  //       this.restaurantForm?.get("longitude")?.patchValue(this.restaruantData?.address?.longitude ? this.restaruantData.address.longitude : "");
  //       this.restaurantForm?.get('startTime')?.patchValue(this.restaruantData?.openTime);
  //       this.restaurantForm?.get('endTime')?.patchValue(this.restaruantData?.closeTime);
  //       this.restaurantForm?.get("person1")?.patchValue(this.restaruantData?.contactDetails?.[1]?.contactPersonName);
  //       this.restaurantForm?.get("person2")?.patchValue(this.restaruantData?.contactDetails?.[2]?.contactPersonName);
  //       this.restaurantForm?.get("contactNumber1")?.patchValue(this.restaruantData?.contactDetails?.[1]?.contactPersonNumber);
  //       this.restaurantForm?.get("contactNumber2")?.patchValue(this.restaruantData?.contactDetails?.[2]?.contactPersonNumber);
  //       this.restaurantForm?.get("description")?.patchValue(this.restaruantData?.description);
  //       this.recom = this.restaruantData?.isSponsored ? true : false;

        
  //     } else {
  //     }
  //   })
  //     .catch((err: any) => { });

  // }

  upload(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      
      this.preview(file);
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      if (
        ext == 'png' ||
        ext == 'jpg' ||
        ext == 'pdf' ||
        ext == 'doc' ||
        ext == 'docx' ||
        ext == 'jpeg'
      ) {
        if (!(file.size > 2097152)) {
          let x: any;
          var splitted: any;
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            let str: any = reader.result;
            splitted = str.split(',');
          };
          setTimeout(() => {
            this.uploadFile(file);
          }, 1000);
          this.filebase = splitted;
          console.log(this.filebase);
          // this.toastr.success('Uploaded successfully..!');
        } else {
          // this.toastr.error('Please Upload less 2mb file');
        }
      } else {
        // this.toastr.error('Invalid file format');
      }
    }


  }
  img: any;
  preview(file: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.img = e.target.result;
      this.showimg = false;
    };
    reader.readAsDataURL(file)
  }



  async onChange(files: any) {
    if (files && files.length > 0) {
      var file = files[0];
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      if (
        ext == 'png' ||
        ext == 'jpg' ||
        ext == 'pdf' ||
        ext == 'doc' ||
        ext == 'docx' ||
        ext == 'jpeg'
      ) {
        if (!(file.size > 2097152)) {
          let x: any;
          var splitted: any;
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            let str: any = reader.result;
            splitted = str.split(',');
          };
          setTimeout(() => {
            this.uploadFile(file);
          }, 1000);
          this.filebase = splitted;
          // this.toastr.success('Uploaded successfully..!');
        } else {
          // this.toastr.error('Please Upload less 2mb file');
        }
      } else {
        // this.toastr.error('Invalid file format');
      }
    }
  }
  async uploadFile(file: any) {
    const formData1: any = new FormData();
    formData1.append('file', file);
    await this.apiservice.UploadFile(formData1).subscribe(
      (res) => {
        res.data;
        this.imagelist = res.data;
        this.imgUrl = res.data?.imgUrl;
      },
      (err) => {
      }
    );
  }
  onCheckboxChange(e: any, type: any) {
    if(e?.checked)  {
     this.foodtype.push(type);
    }  else  {
     console.log("type",type)
     this.foodtype=this.foodtype.filter((e: any)=> e !== type)
    }
   
     console.log(this.foodtype,"foodtype");
   }

  restaurantcreate() {
    this.submitted = true;
    if(!this.restaurantForm.valid){
      console.log(this.restaurantForm);
      this.toastrService.warning("PLease select all the Fields")
    }
    else
    {
    let latitude = parseFloat(this.restaurantForm?.value?.latitude);
    let longitude = parseFloat(this.restaurantForm?.value?.longitude);
    let payload: any = {
      "restaurantName": this.restaurantForm?.value?.restaurantName,
      "foodType": this.foodtype,
      "ratings": this.restaurantForm?.value?.ratings,
      "restaurantCode": this.restaurantForm?.value?.restaurantCode,
      "restaurantImage": this.imgUrl,
      "resoffer": this.restaurantForm?.value?.resoffer,
      "coordinates": [latitude, longitude],
      "openTime":this.restaurantForm?.value?.startTime,
      "closeTime":this.restaurantForm?.value?.endTime,
      "description":this.restaurantForm?.value?.description,
      "isSponsored": this.recom,
      "address":
      {
        "completeAddress":this.restaurantForm?.value?.street + ',' +this.restaurantForm?.value?.city + ',' + this.restaurantForm?.value?.state + ',' + this.restaurantForm?.value?.pincode,
        "street": this.restaurantForm?.value?.street,
        "city": this.restaurantForm?.value?.city,
        "state": this.restaurantForm?.value?.state,
        "pinCode": this.restaurantForm?.value?.pincode,
        latitude: latitude,
        longitude: longitude

      }
    


    }
    payload.contactDetails = [{}]
    payload.contactDetails.push({ contactPersonName: this.restaurantForm?.value?.person1, contactPersonNumber: this.restaurantForm?.value?.contactNumber1 })
    payload.contactDetails.push({ contactPersonName: this.restaurantForm?.value?.person2, contactPersonNumber: this.restaurantForm?.value?.contactNumber2 })
    // this.apiservice.restaurantcreate(payload, this.id).subscribe((response) => {
    //   if (response.code == 200) {
    //     this.submitted = false;
    //     this.toastrService.success(response.message);
    //     this.restaurantForm.reset();
    //     this.router.navigateByUrl('admin/restaurentList')
    //   }
    //   else {
    //     this.toastrService.error(response.message);
    //     this.submitted = false;
    //   }


    // }, err => {
    //   this.submitted = false;
    // })
    }
  }

  onSubmit(): void {
    console.log("hii");
    console.log(JSON.stringify(this.restaurantForm.value, null, 2));
  }
  get f(): { [key: string]: AbstractControl } {
    return this.restaurantForm.controls;
  }
  recom: any;
  activeChange(e: any) {
    this.recom = e?.checked ? e.checked : false;
    console.log(this.recom,"pppppppp");
  }

}
