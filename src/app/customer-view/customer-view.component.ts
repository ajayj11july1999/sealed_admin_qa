import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';

@Component({
  selector: 'app-customer-view',
  templateUrl: './customer-view.component.html',
  styleUrls: ['./customer-view.component.scss'],
})
export class CustomerViewComponent implements OnInit {
  userdetails: any;
  addressDetails;
  viewshow: boolean = false;
  activetrip: any;
  completetrip: any;
  value: any;
  viewshowcomplete: boolean = false;

  constructor(private router: Router, private apiService: ApiServiceService) {}
  cususerId: any;
  ngOnInit(): void {
    this.cususerId = localStorage.getItem('userViewId')
      ? JSON.parse(localStorage.getItem('userViewId') || '')
      : '';
    this.getUserViewDetails();
    this.loadActiveTrips();
    this.loadCompleteTrips();
  }
  load = false;
  loadActive() {
    this.load = true;
  }
  load1 = false;
  loadComplete() {
    this.load1 = true;
  }
  userView: any;
  getUserViewDetails() {
    console.log('fd', this.cususerId);
    this.apiService
      .getListUsergetById(this.cususerId)
      .then((res) => {
        console.log(res);
        this.userdetails = res.data;
        console.log(this.userdetails);
        // console.log(this.userdetails.addressDetails[0]?.address?.street);
      })
      .catch((err) => {});
  }
  loadActiveTrips() {
    this.viewshow = true;
    this.apiService
      .getListCustomerActiveTrip(this.cususerId)
      .then((res) => {
        this.activetrip = res.data.data;
        console.log(this.activetrip);
      })
      .catch((err) => {});
  }
  loadCompleteTrips() {
    this.viewshowcomplete = true;
    this.apiService
      .getListCustomerCompleteTrip(this.cususerId)
      .then((res) => {
        this.completetrip = res.data.data;
        console.log(this.completetrip);
      })
      .catch((err) => {});
  }
  // searchtrip(e: any) {
  //   this.value = e?.target?.value;
  //   this.loadActiveTrips();
  //   // this.loadCompleteTrips();
  // }

  moredetails(i: any) {
    // Navigate using query params so TripDetailsComponent can read `id` from query params
    this.router.navigate(['/trip_details'], { queryParams: { id: i?._id } });
  }

  returntocustomers() {
    this.router.navigate(['/customers']);
  }
}
