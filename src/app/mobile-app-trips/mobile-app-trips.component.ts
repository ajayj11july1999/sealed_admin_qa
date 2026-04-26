import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

/** Must match the orderStatus query we send for active B2C trips. */
const ACTIVE_B2C_ORDER_STATUSES = new Set([
  'orderassigned',
  'orderinprogress',
  'orderpickeduped',
]);

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
  /** Full active courier list from API; used to build per-order filtered dropdowns. */
  allActiveDeliveryMen: any[] = [];
  /** Stable empty list for ng-select when eligibility not yet computed. */
  readonly emptyDriverList: any[] = [];
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

  /**
   * The list API sometimes still returns completed orders (e.g. delivered). Only show true in-progress rows.
   */
  private filterActiveB2COrders(orders: any[] | null | undefined): any[] {
    if (!Array.isArray(orders)) {
      return [];
    }
    return orders.filter((o) => {
      const key = String(o?.orderStatus ?? '')
        .trim()
        .toLowerCase();
      return ACTIVE_B2C_ORDER_STATUSES.has(key);
    });
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
        for (const value of this.Consumernewtrip) {
          value.disable = true;
          value._eligibleDrivers = this.filterEligibleDrivers(value);
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
        const raw = res?.data?.data ? res.data.data : [];
        this.Consumeractivetrip = this.filterActiveB2COrders(raw);
        this.activetotalCount = this.Consumeractivetrip.length;
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
        const list = res?.data ? res.data : [];
        this.allActiveDeliveryMen = Array.isArray(list) ? list : [];
        this.deliveryman = this.allActiveDeliveryMen;
        this.rebuildEligibleDriversForNewTrips();
        console.log(this.deliveryman);
      })
      .catch((err) => { });
  }

  orderDeliveryTypeLabel(order: any): string {
    if (!order) {
      return '';
    }
    const t = order.deliveryType ?? order.tripDetails?.deliveryType ?? '';
    return t != null ? String(t).trim() : '';
  }

  /**
   * Vehicle the customer booked (from API `orderVehicleDetails` after vehicleId lookup, else delivery type).
   */
  orderBookedVehicleLabel(order: any): string {
    if (!order) {
      return '';
    }
    const fromApi =
      order.orderVehicleDetails?.name ??
      order.tripDetails?.orderVehicleDetails?.name;
    if (fromApi != null && String(fromApi).trim() !== '') {
      return String(fromApi).trim();
    }
    return this.orderDeliveryTypeLabel(order);
  }

  /** Vehicle display / type from courier profile (matches courier-view template). */
  courierVehicleLabel(dm: any): string {
    if (!dm) {
      return '';
    }
    const parts = [
      dm.vehicleDetails?.name,
      dm.vehicleDetails?.vehicleType,
      dm.vehicle?.name,
      dm.deliveryType,
    ].filter((p) => p != null && String(p).trim() !== '');
    return parts.length ? String(parts[0]).trim() : '';
  }

  /** Driver row in assign dropdown: name + vehicle. */
  driverAssignOptionCaption(dm: any): string {
    if (!dm) {
      return '';
    }
    const v = this.courierVehicleLabel(dm);
    return v ? `${dm.name} — ${v}` : `${dm.name} — Vehicle N/A`;
  }

  /**
   * Coarse vehicle class for matching order deliveryType to courier vehicle.
   */
  vehicleCategory(label: string): '2w' | '4w' | 'unknown' {
    const s = (label || '').toLowerCase();
    if (
      /four|4\s*wheel|car|suv|sedan|hatchback|van|truck|auto\s*rickshaw/.test(s)
    ) {
      return '4w';
    }
    if (
      /bike|bicycle|two|2\s*wheel|scooter|motorcycle|cycle/.test(s)
    ) {
      return '2w';
    }
    return 'unknown';
  }

  /** Basic vehicle label match (e.g. "Four Wheeler" vs "4 Wheeler"). */
  vehicleNamesLooselyMatch(a: string, b: string): boolean {
    const strip = (s: string) =>
      (s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .trim();
    const na = strip(a);
    const nb = strip(b);
    if (!na || !nb) {
      return true;
    }
    return na === nb || na.includes(nb) || nb.includes(na);
  }

  /**
   * Returns an error message if Assign should be blocked, or null if OK.
   */
  validateAssignSelection(order: any, driver: any): string | null {
    if (!driver) {
      return 'Selected driver was not found. Refresh the list and try again.';
    }
    const driverName =
      driver.name != null ? String(driver.name).trim() : '';
    if (!driverName) {
      return 'Selected driver has no valid name.';
    }
    const booked = this.orderBookedVehicleLabel(order);
    const driverVehicle = this.courierVehicleLabel(driver);
    const orderCat = this.vehicleCategory(booked);
    const driverCat = this.vehicleCategory(driverVehicle);

    if (orderCat !== 'unknown' && driverCat === 'unknown') {
      return `This order requires "${booked}". The selected driver has no vehicle on file.`;
    }
    if (
      orderCat !== 'unknown' &&
      driverCat !== 'unknown' &&
      orderCat !== driverCat
    ) {
      return `Vehicle mismatch: booked "${booked}" but ${driverName}'s vehicle is "${driverVehicle || 'unknown'}".`;
    }
    const apiBookedName =
      order?.orderVehicleDetails?.name != null
        ? String(order.orderVehicleDetails.name).trim()
        : '';
    if (
      apiBookedName &&
      driverVehicle &&
      !this.vehicleNamesLooselyMatch(apiBookedName, driverVehicle)
    ) {
      return `Vehicle must match the booking: "${apiBookedName}" vs driver "${driverVehicle}".`;
    }
    return null;
  }

  /**
   * Drivers eligible for this order (vehicle class match). Prefer `order._eligibleDrivers`
   * in the template so ng-select does not get a new array every change-detection tick.
   */
  filterEligibleDrivers(order: any): any[] {
    if (!this.allActiveDeliveryMen?.length || !order) {
      return [];
    }
    const orderType = this.orderBookedVehicleLabel(order);
    const orderCat = this.vehicleCategory(orderType);

    return this.allActiveDeliveryMen.filter((dm) => {
      const courierLabel = this.courierVehicleLabel(dm);
      const courierCat = this.vehicleCategory(courierLabel);

      if (orderCat !== 'unknown' && courierCat === 'unknown') {
        return false;
      }
      if (orderCat === 'unknown') {
        return true;
      }
      return courierCat === orderCat;
    });
  }

  rebuildEligibleDriversForNewTrips(): void {
    if (!Array.isArray(this.Consumernewtrip)) {
      return;
    }
    for (const order of this.Consumernewtrip) {
      order._eligibleDrivers = this.filterEligibleDrivers(order);
    }
  }

  /** ng-select: same driver from refreshed list is still the same option. */
  compareDrivers = (a: any, b: any): boolean => {
    if (a == null || b == null) {
      return a === b;
    }
    const idA = a._id ?? a.id;
    const idB = b._id ?? b.id;
    if (idA != null && idB != null) {
      return String(idA) === String(idB);
    }
    return a === b;
  };

  onSelectionChange(value: any, pickup, i) {
    console.log(pickup[0]?.latitude, 'ryyyfki');
    this.pickuplatvalue = pickup[0]?.latitude;
    this.pickuplongvalue = pickup[0]?.longitude;

    const dm = value && typeof value === 'object' ? value : null;
    const id = dm?._id ?? dm?.id ?? dm?.deliveryManId;
    if (id == null || id === '') {
      this.toastr.error('Could not resolve selected driver');
      return;
    }

    this.acceptedbyId = id;
    this.pick1 = dm?.primaryAddress?.latitude;
    this.pick2 = dm?.primaryAddress?.longitude;
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
    const payload = {
      _id: this._id,
      orderId: this.orderId,
      assignedToId: this.acceptedbyId,
  orderStatus: "orderInProgress",
      tripStatus: 'accepted',
      acceptedById: this.acceptedbyId,
      assignedAt: new Date(),
      baseKm: this.uneffectiveDist,
    };
    if (this.acceptedbyId == null || this.acceptedbyId === '') {
      this.toastr.error('Please Select Assignee');
      return;
    }
    const dm = this.allActiveDeliveryMen.find(
      (d) => String(d._id) === String(this.acceptedbyId)
    );
    const validationError = this.validateAssignSelection(i, dm);
    if (validationError) {
      this.toastr.error(validationError);
      return;
    }
    this.apiService.assignDeliveryManUpdate(this.orderId, payload).subscribe(
      (res) => {
        this.toastr.success('Successfully Updated...!');
        this.getListConsumerNewtrip();
        this.getListConsumerActivetrip();
        this.getallActiveDeliveryman();
      },
      (err) => {
        this.toastr.error('Failed to update!!!');
      }
    );
  }
}

//
