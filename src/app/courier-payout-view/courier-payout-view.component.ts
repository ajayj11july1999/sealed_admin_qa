import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';

@Component({
  selector: 'app-courier-payout-view',
  templateUrl: './courier-payout-view.component.html',
  styleUrls: ['./courier-payout-view.component.scss'],
})
export class CourierPayoutViewComponent implements OnInit {
  
  payoutview: any;
  payoutdetails: any;
  id: any;
  user: any;
  name: any;

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      console.log(params);
      this.id = params?.id;
    this.name = params?.name
    });
    console.log(this.id);
    this.getPayoutTripList();

    // this.name = localStorage.getItem('thisuser');
  }

  getPayoutTripList() {
    this.apiService
      .getlistPayoutHistoryView(this.id)
      .then((res) => {
        this.payoutdetails = res?.data ? res.data : [];

        // this.totalCount = res.data.totalCount;
        console.log(this.payoutdetails);
      })
      .catch((err) => {});
  }
  moredetails(i: any) {
    this.router.navigate(['/trip_details', { id: i?._id }]);
  }
}
