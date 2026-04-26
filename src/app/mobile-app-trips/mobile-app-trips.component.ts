import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mobile-app-trips',
  templateUrl: './mobile-app-trips.component.html',
  styleUrls: ['./mobile-app-trips.component.scss'],
})
export class MobileAppTripsComponent implements OnInit {
  acceptedbyId: any;
  usertype: any;
  orderStatus: any;
  Consumernewtrip: any;
  totalCount: any;
  Consumeractivetrip: any;
  activetotalCount: any;
  pick1: any;
  pick2: any;
  drop1: any;
  drop2: any;
  uneffectiveDist: any;
  deliverymanForm!: FormGroup;
  isSubmitted: boolean = false;
  _id: any;
  orderId: any;
  deliveryman: any;
  pickuplatvalue: any;
  pickuplongvalue: any;
  searchLoad: boolean = false;
  DateFilterForm: any;
  
  constructor(
    private router: Router,
    public apiService: ApiServiceService,
    public fb: FormBuilder,
    public toastr: ToastrService
  ) {
    this.deliverymanForm = this.fb.group({
      deliverymanname: ['', [Validators.required]],
    });
    this.DateFilterForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    })
  }
  submitted: any;
  Fromdate: any = '';
  Todate: any = '';
  ngOnInit(): void {
    this.getCancelledTrips();
    this.getListConsumerNewtrip();
    this.getListConsumerActivetrip();
    this.getallActiveDeliveryman();
  }
  searchTrip() {
    this.submitted = true;
    if (!this.DateFilterForm?.valid) {
      this.toastr.warning('Please select all the fields');
    } else {
      this.Fromdate = this.DateFilterForm?.controls['fromDate'].value;
      this.Todate = this.DateFilterForm?.controls['toDate'].value;
      console.log(this.Fromdate, this.Todate)
      this.getListConsumerActivetrip();
      this.getListConsumerNewtrip();

    }
  }
  clear() {
    this.DateFilterForm.reset();
    this.Fromdate = '';
    this.Todate = '';
    this.getListConsumerActivetrip();
    this.getListConsumerNewtrip();
  }
  // onSelectEvent(value: any) {
  //   console.log(value);
  //   this.acceptedbyId = value;
  // }

  getListConsumerNewtrip() {

    this.usertype = 'consumer';
    this.orderStatus = 'new';

    this.apiService
      .getconsumerActiveTrip(this.usertype, this.orderStatus, this.Fromdate, this.Todate)
      .then((res) => {
        this.Consumernewtrip = res?.data?.data ? res.data.data : [];
        this.totalCount = res?.data.totalCount;
        // this.orderId = this.Consumernewtrip?.tripDetails.orderd;
        // console.log(this.orderId)
        // this._id=this.Consumernewtrip?._id
        for (let value of this.Consumernewtrip) {
          value.disable = true;
        }
        console.log(this.Consumernewtrip);
      })
      .catch((err) => { });
  }
  getListConsumerActivetrip() {
    this.searchLoad = true
    this.usertype = 'consumer';
    this.orderStatus = 'orderAssigned,orderInProgress,orderPickedUped';

    this.apiService
      .getconsumerActiveTrip(this.usertype, this.orderStatus, this.Fromdate, this.Todate)
      .then((res) => {
        this.Consumeractivetrip = res?.data?.data ? res.data.data : [];
        this.activetotalCount = res?.data.totalCount;
        // console.log(this.Consumeractivetrip.newAt);
        this.searchLoad = false;
      })
      .catch((err) => { });

  }

  // moredetails(i: any) {
  //   console.log('i?.assigneeDetails?._id', i?.assigneeDetails?._id);
  //   this.router.navigate([
  //     '/trip_details',
  //     { courierId: i?.assigneeDetails?._id, id: i?._id },
  //   ]);
  // }
moredetails(i: any) {
  console.log("Navigating to Trip:", i._id);

  this.router.navigate(['/trip_details'], {
    queryParams: {
      id: i._id,
      courierId: i?.assigneeDetails?._id || null
    }
  });
}


  getallActiveDeliveryman() {
    this.apiService
      .getListAllActiveDeliveryMan()
      .then((res) => {
        this.deliveryman = res?.data ? res.data : [];
        console.log(this.deliveryman);
      })
      .catch((err) => { });
  }

  onSelectionChange(value: any, pickup, i) {
    console.log(pickup[0]?.latitude, 'ryyyfki');
    this.pickuplatvalue = pickup[0]?.latitude;
    this.pickuplongvalue = pickup[0]?.longitude;

    // this.test(value, value.primaryAddress);
    this.acceptedbyId = value._id;
    this.pick1 = value?.primaryAddress?.latitude;
    this.pick2 = value?.primaryAddress?.longitude;
    this.uneffectiveDistance(i);
  }
  // test(e: any, pickup: any) {
  //   console.log('pppppppppp', e, pickup);
  //   this.pick1 = e?.primaryAddress?.latitude;
  //   this.pick2 = e?.primaryAddress?.longitude;
  //   (this.drop1 = pickup[0]?.latitude), (this.drop2 = pickup[0]?.longitude);
  //   this.uneffectiveDistance();
  // }
  // test(e: any, pickup: any) {
  //   console.log(this.s2bnewtrip?.pickupAddress);
  //   console.log('pppppppppp', e, pickup);
  //   this.acceptedbyId = e._id;
  //   this.pick1 = e?.primaryAddress?.latitude;
  //   this.pick2 = e?.primaryAddress?.longitude;
  //   this.uneffectiveDistance();
  // }
  uneffectiveDistance(i) {
    let payload = {
      pickUpLat: this?.pick1,
      pickUpLong: this?.pick2,
      dropLat: this?.pickuplatvalue,
      dropLong: this?.pickuplongvalue,
    };
    console.log(payload);
    this.apiService.uneffectiveDistance(payload).subscribe((res) => {
      this.uneffectiveDist = res?.data;
      console.log(this.uneffectiveDist)
      if (res.code == 200) {
        this.Consumernewtrip[i].disable = false;
      } else {
        this.Consumernewtrip[i].disable = true;
      }
    }, err => {
      this.Consumernewtrip[i].disable = true;
    });
  }

  // get deliverymanname() {
  //   return this.deliverymanForm.get('deliverymanname')?.markAllAsTouched();
  // }

  // assigncourier(i: any, type: any) {
  //   this.isSubmitted = true;
  //   console.log('hkdfdj', this.deliverymanForm.invalid);
  //   if (this.deliverymanForm?.invalid == true) {
  //     this.deliverymanForm.markAllAsTouched();
  //     console.log(this.deliverymanForm.get('deliverymanname')?.value);
  //     return;
  //   } else {
  //     this.assign(i, type);
  //     this.deliverymanForm.reset();
  //   }
  // }
  assigncourier(i: any, type: any) {
    this.isSubmitted = true;
    this.assign(i, type);
  }

  cancelledTrips: any[] = [];

  /**
   * List API returns `paymentMode` / `paymentStatus` on the order; older payloads used `paymentDetails`.
   */
  paymentModeLabel(order: any): string {
    if (!order) {
      return '';
    }
    const v =
      order.paymentDetails?.paymentMode ||
      order.paymentMode ||
      order.paymentDetails?.paymentStatus ||
      order.paymentStatus;
    return v != null && v !== '' ? String(v) : '';
  }

  /** User name, phone, or pickup contact — template cannot use `?.[0]` on Angular 12. */
  customerNameLabel(order: any): string {
    if (!order) {
      return '';
    }
    const fromPickup =
      Array.isArray(order.pickupAddress) && order.pickupAddress.length
        ? order.pickupAddress[0]?.contactPerson
        : '';
    const s =
      order.userDetails?.name || order.userDetails?.mobileNo || fromPickup;
    return s != null && s !== '' ? String(s) : '';
  }

  getCancelledTrips() {
    this.apiService
      .getconsumerActiveTrip('consumer', 'cancelled', this.Fromdate, this.Todate)
      .then((res) => {
        const data = res?.data?.data || [];

        this.cancelledTrips = data.filter(item =>
          item?.orderStatus?.toLowerCase().includes('cancel') &&
          item?.assignedToId
        );

        console.log("Cancelled Trips:", this.cancelledTrips);
      })
      .catch(err => console.error("Error fetching cancelled trips:", err));
  }

  assign(i: any, type: any) {
    console.log(i)
    this._id = i?.tripDetails?._id;
    this.orderId = i?._id;   // ✅ THIS IS ORDER ID
    console.log(this.orderId);
    let payload = {
      _id: this._id,
      orderId: this.orderId,
      assignedToId: this.acceptedbyId,
  orderStatus: "orderInProgress",
      tripStatus: 'accepted',
      acceptedById: this.acceptedbyId,
      assignedAt: new Date(),
      baseKm: this.uneffectiveDist,
    };
    if (!this.acceptedbyId && this.acceptedbyId != '') {
      this.toastr.error('Please Select Assignee');
    } else {
      this.apiService.assignDeliveryManUpdate(this.orderId, payload).subscribe(
        (res) => {
          this.deliveryman = res?.data?.data;
          this.toastr.success('Successfully Updated...!');
          // if (type == 'consumer') {
          this.getListConsumerNewtrip();
          this.getListConsumerActivetrip();
          this.getallActiveDeliveryman();
          // } else {
          // }
        },
        (err) => {
          this.toastr.error('Failed to update!!!');
        }
      );
    }
  }
}

//
