import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { adminDateToYmd, startOfLocalDay } from '../utils/admin-date.util';

@Component({
  selector: 'app-stamp-document',
  templateUrl: './stamp-document.component.html',
  styleUrls: ['./stamp-document.component.scss'],
})
export class StampDocumentComponent implements OnInit {
  acceptedbyId: any;
  usertype: any;
  orderStatus: any;
  stampdocument: any;
  stamptotalCount: any = 0;
  activestampdocument: any;
  ActivestamptotalCount: any;
  deliverymanStampForm: FormGroup;
  deliveryman: any;
  pick1: any;
  pick2: any;
  drop1: any;
  drop2: any;
  uneffectiveDist: any;
  isSubmitted: boolean = false;
  _id: any;
  orderId: any;
  pickuplatvalue: any;
  pickuplongvalue: any;
  searchLoad: boolean = false;
  submitted = false;
  Fromdate: any = '';
  Todate: any = '';
  DateFilterForm: any;

  constructor(
    private router: Router,
    private apiService: ApiServiceService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.deliverymanStampForm = this.fb.group({
      deliverymanstampname: ['', [Validators.required]],
    });
    this.DateFilterForm = this.fb.group({
      fromDate: [null, [Validators.required]],
      toDate: [null, [Validators.required]],
    })
  }

  get stampFiltersToday(): Date {
    return startOfLocalDay(new Date());
  }

  get stampFromPickerMax(): Date {
    const toVal = this.DateFilterForm?.get('toDate')?.value;
    const today = this.stampFiltersToday;
    if (!toVal) {
      return today;
    }
    const toDay = startOfLocalDay(
      toVal instanceof Date ? toVal : new Date(toVal)
    );
    return toDay.getTime() < today.getTime() ? toDay : today;
  }

  get stampToPickerMin(): Date | null {
    const fromVal = this.DateFilterForm?.get('fromDate')?.value;
    if (!fromVal) {
      return null;
    }
    return startOfLocalDay(
      fromVal instanceof Date ? fromVal : new Date(fromVal)
    );
  }

  ngOnInit(): void {
    this.getListStampdocumenttrip();
    this.getListActiveStamp();
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
      this.getListActiveStamp();
      this.getListStampdocumenttrip();

    }
  }
  clear() {
    this.DateFilterForm.reset();
    this.Fromdate = '';
    this.Todate = '';
    this.getListActiveStamp();
    this.getListStampdocumenttrip();
  }

  private normalizeStampOrders(orderList: any[], setDisabled = false) {
    return (orderList || []).map((order: any) => ({
      ...order,
      cartDetails:
        Array.isArray(order?.selectedStamps) && order.selectedStamps.length
          ? order.selectedStamps.map((stamp: any) => ({
              quantity: stamp?.qty,
              documentDetails: stamp?.type,
              documentName: stamp?.stampName,
              stampPrice: stamp?.stampPrice,
              name: stamp?.name,
              confirmName: stamp?.confirmName,
            }))
          : order?.cartDetails || [],
      paymentLabel:
        order?.paymentDetails?.paymentMode ||
        order?.paymentDetails?.paymentStatus ||
        'Pending',
      disable: setDisabled ? true : order?.disable,
    }));
  }

  getListStampdocumenttrip() {
    this.searchLoad = true;
    this.usertype = 'stamp';
    this.orderStatus = 'new';

    this.apiService
      .getconsumerActiveTrip(this.usertype, this.orderStatus, this.Fromdate, this.Todate)
      .then((res) => {
        const orders = res?.data?.data ? res.data.data : [];
        this.stampdocument = this.normalizeStampOrders(orders, true);
        this.stamptotalCount = res?.data?.totalCount || 0;
        this.searchLoad = false;
      })
      .catch((err) => {
        this.searchLoad = false;
      });
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

  getListActiveStamp() {
    this.usertype = 'stamp';
    this.orderStatus = 'orderAssigned,orderInProgress,orderPickedUped';

    this.apiService
      .getconsumerActiveTrip(this.usertype, this.orderStatus, this.Fromdate, this.Todate)
      .then((res) => {
        const orders = res?.data?.data ? res.data.data : [];
        this.activestampdocument = this.normalizeStampOrders(orders);
        this.ActivestamptotalCount = res?.data?.totalCount || 0;
      })
      .catch((err) => { });
  }
  // onSelectEvent(value: any) {
  //   console.log(value);
  //   this.acceptedbyId = value;
  // }

  onSelectionChange(value: any, pickup, i) {

    console.log(pickup[0]?.latitude, 'ryyyfki');
    this.pickuplatvalue = pickup[0]?.latitude;
    this.pickuplongvalue = pickup[0]?.longitude;
    this.acceptedbyId = value?._id;
    this.pick1 = value?.primaryAddress?.latitude;
    this.pick2 = value?.primaryAddress?.longitude;
    this.uneffectiveDistance(i);
  }
  getallActiveDeliveryman() {
    this.apiService
      .getListAllActiveDeliveryMan()
      .then((res) => {
        this.deliveryman = res?.data ? res.data : [];

        // this.deli_pickuplat = res?.data[0]?.primaryAddress?.latitude;
        // this.deli_pickuplong = res?.data[0]?.primaryAddress?.longitude;
        // console.log(this.deli_pickuplat);
        //  this.uneffectiveDistance();
      })
      .catch((err) => { });
  }
  uneffectiveDistance(i) {
    let payload = {
      pickUpLat: this?.pick1,
      pickUpLong: this?.pick2,
      dropLat: this?.pickuplatvalue,
      dropLong: this?.pickuplongvalue,
    };
    console.log(payload)
    this.apiService.uneffectiveDistance(payload).subscribe((res) => {
      this.uneffectiveDist = res?.data;
      if (res?.code == 200) {
        // this.buttondis =false;
        this.stampdocument[i].disable = false;
      } else {
        // this.buttondis=true;
        this.stampdocument[i].disable = true;
      }
    }, err => {
      // this.buttondis=true;
      this.stampdocument[i].disable = true;
    });
  }
  assignstampcourier(i: any, type: any) {
    this.isSubmitted = true;
    // console.log(this.deliverymanStampForm.valid);
    // if (!this.deliverymanStampForm.valid) {
    //   this.deliverymanStampForm.get('deliverymanstampname')?.markAllAsTouched();
    //   return false;
    // } else {
    // if (this.uneffectiveDist)  {

    this.assign(i, type);
    // } 

    // this.deliverymanStampForm.reset();
    // }
  }
  assign(i: any, type: any) {
    this._id = i?.tripDetails?._id;
    this.orderId = i?._id || i?.tripDetails?.orderId;
    console.log(this.orderId);
    let payload = {
      _id: this._id,
      orderId: this.orderId,
      assignedToId: this.acceptedbyId,
      orderStatus: 'orderInProgress',
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
          this.getListStampdocumenttrip();
          this.getListActiveStamp();
          this.getallActiveDeliveryman();
        },
        (err) => {
          this.toastr.error('Failed to update!!!');
        }
      );
    }
  }
  // get deliverymanname() {
  //   return this.deliverymanStampForm.get('deliverymanname')?.markAllAsTouched();
  // }
}
