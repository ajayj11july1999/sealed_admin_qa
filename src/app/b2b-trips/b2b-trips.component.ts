import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { adminDateToYmd, startOfLocalDay } from '../utils/admin-date.util';

@Component({
  selector: 'app-b2b-trips',
  templateUrl: './b2b-trips.component.html',
  styleUrls: ['./b2b-trips.component.scss'],
})
export class B2bTripsComponent implements OnInit {
  usertype: any;
  orderStatus: any;
  s2bactivetrip: any;
  s2btotalCount: any = 0;
  s2bnewtrip: any;
  s2bnewtotalCount: any = 0;
  pickuplat: any;
  pickuplong: any;
  pick1: any;
  pick2: any;
  drop1: any;
  drop2: any;
  uneffectiveDist: any;
  deliveryman: any = [];
  acceptedbyId: any;
  isSubmitted: boolean = false;
  _id: any;
  orderId: any;
  searchLoad: boolean = false;

  deliverymanS2bForm: FormGroup;
  pickuplatvalue: any;
  pickuplongvalue: any;
  DateFilterForm: any;
  submitted: any;
  Fromdate: any = '';
  Todate: any = '';
  constructor(
    private apiService: ApiServiceService,
    public router: Router,
    public fb: FormBuilder,
    public toastr: ToastrService
  ) {
    this.deliverymanS2bForm = this.fb.group({
      deliverymans2bname: ['', [Validators.required]],
    });
    this.DateFilterForm = this.fb.group({
      fromDate: [null, [Validators.required]],
      toDate: [null, [Validators.required]],
    })
  }

  get b2bFiltersToday(): Date {
    return startOfLocalDay(new Date());
  }

  get b2bFromPickerMax(): Date {
    const toVal = this.DateFilterForm?.get('toDate')?.value;
    const today = this.b2bFiltersToday;
    if (!toVal) {
      return today;
    }
    const toDay = startOfLocalDay(
      toVal instanceof Date ? toVal : new Date(toVal)
    );
    return toDay.getTime() < today.getTime() ? toDay : today;
  }

  get b2bToPickerMin(): Date | null {
    const fromVal = this.DateFilterForm?.get('fromDate')?.value;
    if (!fromVal) {
      return null;
    }
    return startOfLocalDay(
      fromVal instanceof Date ? fromVal : new Date(fromVal)
    );
  }

  ngOnInit(): void {
    this.getLists2bActivetrip();
    this.getLists2bNewtrip();
    this.getallActiveDeliveryman();
  }
  searchTrip() {
    this.submitted = true;
    if (!this.DateFilterForm?.valid) {
      this.toastr.warning('Please select all the fields');
    } else {
      this.Fromdate =
        adminDateToYmd(this.DateFilterForm?.controls['fromDate'].value) ?? '';
      this.Todate =
        adminDateToYmd(this.DateFilterForm?.controls['toDate'].value) ?? '';
      console.log(this.Fromdate, this.Todate)
      this.getLists2bActivetrip();
      this.getLists2bNewtrip();

    }
  }
  clear() {
    this.DateFilterForm.reset();
    this.Fromdate = '';
    this.Todate = '';
    this.getLists2bActivetrip();
    this.getLists2bNewtrip();
  }
  getLists2bActivetrip() {

    this.usertype = 's2b';
    this.orderStatus = 'orderAssigned,orderInProgress,orderPickedUped';

    this.apiService
      .getconsumerActiveTrip(this.usertype, this.orderStatus, this.Fromdate, this.Todate)
      .then((res) => {
        this.s2bactivetrip = res?.data?.data ? res.data.data : [];
        this.s2btotalCount = res?.data?.totalCount;
        // console.log(this.Consumeractivetrip.newAt);
      })
      .catch((err) => { });
  }
  getLists2bNewtrip() {
    this.searchLoad = true;
    this.usertype = 's2b';
    this.orderStatus = 'new';

    this.apiService
      .getconsumerActiveTrip(this.usertype, this.orderStatus, this.Fromdate, this.Todate)
      .then((res) => {
        this.s2bnewtrip = res?.data?.data ? res.data.data : [];
        for (let value of this.s2bnewtrip) {
          value.disable = true
        }
        this.s2bnewtotalCount = res?.data?.totalCount;
        console.log(this.s2bnewtotalCount);

        this.pickuplat = this.s2bnewtrip.pickupAddress[0].latitude;
        this.pickuplong = this.s2bnewtrip.pickupAddress[0].longitude;
        // console.log(this.Consumeractivetrip.newAt);
        this.searchLoad = false;
      }, err => {
        this.searchLoad = false;
      })
      .catch((err) => {
        this.searchLoad = false;
      });
  }

  more_details(i: any) {
    console.log('i?.assigneeDetails?._id', i?.assigneeDetails?._id);
    this.router.navigate([
      '/trip_details',
      { courierId: i?.assigneeDetails?._id, id: i?._id },
    ]);
    
  }

  getallActiveDeliveryman() {
    this.apiService
      .getListAllActiveDeliveryMan()
      .then((res) => {
        this.deliveryman = res?.data ? res.data : [];
        console.log(this.deliveryman)
      })
      .catch((err) => { });
  }

  onSelectionChange(value: any, pickup, i) {
    console.log(value, pickup, i)
    this.pickuplatvalue = pickup[0]?.latitude;
    this.pickuplongvalue = pickup[0]?.longitude;
    this.acceptedbyId = value?._id;
    this.pick1 = value?.primaryAddress?.latitude;
    this.pick2 = value?.primaryAddress?.longitude;
    this.uneffectiveDistance(i);
    console.log(value?.primaryAddress?.latitude)
    console.log(value?.primaryAddress?.longitude)

  }
  uneffectiveDistance(i) {
    let payload = {
      pickUpLat: this.pick1,
      pickUpLong: this.pick2,
      dropLat: this.pickuplatvalue,
      dropLong: this.pickuplongvalue,
    };
    console.log(payload);
    this.apiService.uneffectiveDistance(payload).subscribe((res) => {
      if (res.code == 200) {
        this.s2bnewtrip[i].disable = false;
      } else {
        this.s2bnewtrip[i].disable = true;
      }
      this.uneffectiveDist = res?.data;
      console.log(this.uneffectiveDist);
    }, err => {
      this.s2bnewtrip[i].disable = true;
    });
  }
  get deliverymanname() {
    return this.deliverymanS2bForm
      .get('deliverymans2bname')
      ?.markAllAsTouched();
  }
  assignS2bcourier(i: any, type: any) {
    this.isSubmitted = true;
    this.assign(i, type);
  }
  assign(i: any, type: any) {
    console.log(i)
    this._id = i?.tripDetails?._id;
    this.orderId = i?.tripDetails?.orderId;
    console.log(this.orderId);
    let payload = {
      _id: this._id,
      orderId: this.orderId,
      tripStatus: 'accepted',
      acceptedById: this.acceptedbyId,
      assignedAt: new Date(),
      baseKm: this.uneffectiveDist,
    };
    if (!this.acceptedbyId && this.acceptedbyId != '') {
      this.toastr.error('Please Select Assignee');
    } else {
      this.apiService.assignDeliveryManUpdate(this._id, payload).subscribe(
        (res) => {
          this.deliveryman = res?.data?.data;

          this.toastr.success('Successfully Updated...!');
          console.log('hsgdgak');

          this.getLists2bNewtrip();
          this.getLists2bActivetrip();
          this.getallActiveDeliveryman();
          // window.location.reload();
        },
        (err) => {
          this.toastr.error('Failed to update!!!');
        }
      );
    }
  }
}
