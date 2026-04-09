import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-food-popup',
  templateUrl: './food-popup.component.html',
  styleUrls: ['./food-popup.component.scss']
})
export class FoodPopupComponent implements OnInit {
  foodForm: any;
  foodtype: any;
btnlabel:any='Add';
  constructor(private formBuilder:FormBuilder) {
    this.foodForm=this.formBuilder.group({
      restaurantName: ['',[Validators.required]],

      })
   }

  ngOnInit(): void {
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
   onSubmit(): void {
    
    console.log(JSON.stringify(this.foodForm.value, null, 2));
  }
  get f(): { [key: string]: AbstractControl } {
    return this.foodForm.controls;
  }
}
