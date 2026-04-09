import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiServiceService } from '../service/api-service.service';
import { Router } from '@angular/router';
import { AddRestaurantComponent } from '../add-restaurant/add-restaurant.component';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss']
})
export class RestaurantComponent implements OnInit {
  ngOnInit(): void {

  }


  // Restaurant=[
  //   {id:"1",name:"123",category:"sas", resCode:"a234",amount:"199" , status :"true",offer:"20",location:"ngl ",type:"veg"},
  //   {id:"1",name:"123",category:"sas", resCode:"a234",amount:"199", status :"true",offer:"20",location:"ngl ",type:"veg"},
  //   {id:"1",name:"123",category:"sas", resCode:"a234",amount:"199", status :"true",offer:"20",location:"ngl ",type:"veg"},
  //   {id:"1",name:"123",category:"sas", resCode:"a234", amount:"199", status :"true",offer:"20",location:"ngl ",type:"veg"},
  //   {id:"1",name:"123",category:"sas", resCode:"a234", amount:"199", status :"true",offer:"20",location:"ngl ",type:"veg"},
  //   {id:"1",name:"123",category:"sas", resCode:"a234", amount:"199", status :"true",offer:"20",location:"ngl ",type:"veg"},

  // ]
  // value: any;
  // offset: any = 0;
  // limit: any = 7;
  // usersList: any;
  // totalCount: any;
  // dataFromDialog: any;
  // toastrService: any;
  // item: any;
  // createAdmin: any;
  // // searchLoad : boolean = false;
  // userType: any;
  // currentPage: number | undefined;
  // constructor(private router: Router, private dialog: MatDialog, private apiservice: ApiServiceService,) {

  // }

  // ngOnInit(): void {
  //   this.getB2bUserList();
  // }

  // getB2bUserList() {
  //   // this.searchLoad =true
  //   this.userType = 'subadmin';
  //   this.apiservice
  //     .getSubAdmin(this.userType, this.limit, this.offset, this.value)
  //     .then((res: any) => {
  //       if (res.code == 200) {
  //         this.createAdmin = res.data?.data;
  //         this.totalCount = res?.data?.totalCount;
  //         // this.searchLoad = false;
  //       } else {
  //       }
  //     })
  //     .catch((err: any) => { });
  // }
  // addRestaurant() {
  //   // const dialogRef = this.dialog.open(AddRestaurantComponent, {
  //   //   width: '650px',
  //   //   height: item ?'400px' : '500px',
  //   //   disableClose: true,
  //   //   data: item

  //   // })
  //   // dialogRef.afterClosed().subscribe(() => {
  //   //   this.getB2bUserList()
  //   // });

  //   this.router.navigate(['restaurant/add-restaurant' ]);
  // }
  // editRestaurant(item?: any){
  //   this.router.navigate(['restaurant/add-restaurant' ,{id:item?._id}]);

  // }
  // viewFood(items?:any){
  //   this.router.navigate(['restaurant/food' ,{id:items?._id}]);
  // }
  // pageChange(e: any): void {
  //   this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
  //   this.getB2bUserList();
  // }
  // paginationOffset(currentPage: any, itemsPerPage: any) {
  //   let offset = currentPage * itemsPerPage + 1;
  //   return (offset = offset < 0 ? offset : offset - 1);
  // }
  // searchUserList(e: any) {
  //   this.offset = 0;
  //   this.value = e?.target?.value;
  //   this.currentPage=0;
  //   this.getB2bUserList();
  // }

  // deleteUserList(i: any) {
  //   // let dialogRef = this.dialog.open(DialogueComponent, {
  //   //   height: '150px',
  //   //   data: { status: "Delete" },
  //   //   disableClose: true

  //   // });
  //   // dialogRef.afterClosed().subscribe((data) => {
  //   //   if (data) {
  //   //     this.apiservice.createAdmin({ deleted: true }, i?._id).subscribe((res) => {
  //   //       this.getB2bUserList();
  //   //       if (res?.status) {
  //   //         this.toastrService.success(res.message);
  //   //         this.getB2bUserList();
  //   //       } else {
  //   //         this.getB2bUserList();
  //   //         this.toastrService.error(res.message);
  //   //       }
  //   //     }, err => {
  //   //       this.toastrService.error('Failed to delete');
  //   //     })
  //   //   }
  //   // });
  // }
}
