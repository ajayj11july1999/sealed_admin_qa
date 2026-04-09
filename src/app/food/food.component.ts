import { Component, OnInit } from '@angular/core';
import { FoodPopupComponent } from '../food-popup/food-popup.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.scss']
})
export class FoodComponent implements OnInit {
offset=0;
value:any;
searchLoad=false;
Foodlist=[
    {id:"1",name:"briyani" ,image:"assets/images/custm-nbb/profile-bg.jpg",price :"199",offer:'5'},
    {id:"1",name:"briyani" ,image:"assets/images/custm-nbb/profile-bg.jpg",price :"199",offer:'5'},
    {id:"1",name:"briyani" ,image:"assets/images/custm-nbb/profile-bg.jpg",price :"199",offer:'5'},
    {id:"1",name:"briyani" ,image:"assets/images/custm-nbb/profile-bg.jpg",price :"199",offer:'5'},
    {id:"1",name:"briyani" ,image:"assets/images/custm-nbb/profile-bg.jpg",price :"199",offer:'5'},

  ]
  constructor(private dialog:MatDialog) { }

  ngOnInit(): void {
  }
  searchFood(e:any){
    this.offset = 0;
    this.value = e?.target?.value;
    // this.currentPage=0;
    // this.getB2bUserList();
  }
  addFood(){
     const dialogRef = this.dialog.open(FoodPopupComponent, {
        width: '650px',
        // height: item ?'400px' : '500px',
        height:'500px',
        disableClose: true,
        // data: item
  
      })
      // dialogRef.afterClosed().subscribe(() => {
      //   this.getB2bUserList()
      // });
     
  }
}
