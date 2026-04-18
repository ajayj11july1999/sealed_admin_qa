import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DeliveryTrackingService } from '../service/trackservice/delivery-tracking.service';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripDetailsComponent implements OnInit {
  tripId: any;
  id: any;

  public lat: any;
  public lng: any;
 public origin: { lat: number; lng: number } | null = null;
public destination: { lat: number; lng: number } | null = null;
public delivery: { lat: number; lng: number } | null = null;

  waypoints: any;
  
  travelMode: string = 'TWO_WHEELER'
  droplat: any;
  droplong: any;
  tripDetails: any;  
    

  pickuplong: any;
  pickuplat: any;
  courierId: any;
  uneffectiveDist: any;
  movementPath: { lat: number; lng: number }[] = [];
  // dottedLineSegments: any;

  /** Vehicle for this trip: nested on delivery man or top-level array from API. */
  get courierVehicle(): any {
    const nested = this.tripDetails?.deliveryManDetails?.vehicleDetails;
    if (nested) {
      return nested;
    }
    const list = this.tripDetails?.deliveryManVehicleDetails;
    if (Array.isArray(list) && list.length > 0) {
      return list[0];
    }
    return null;
  }

  get hasAcceptedPosition(): boolean {
    const p = this.tripDetails?.acceptedPosition;
    if (!p) {
      return false;
    }
    const latOk = p.lat != null && p.lat !== '';
    const lngOk = p.lng != null && p.lng !== '';
    return latOk || lngOk;
  }

  formatInstructionEntry(ins: any): string {
    if (ins == null) {
      return '';
    }
    if (typeof ins === 'string') {
      return ins;
    }
    return (
      ins.text ??
      ins.message ??
      ins.description ??
      ins.name ??
      ''
    ).toString();
  }

  formatExtraChargeLine(charge: any): string {
    if (charge == null) {
      return '';
    }
    if (typeof charge === 'string') {
      return charge;
    }
    const label =
      charge.name ??
      charge.title ??
      charge.label ??
      charge.extraChargeName ??
      charge.type ??
      'Charge';
    const amt = charge.amount ?? charge.price ?? charge.value ?? charge.charge;
    const extra = charge.reason ?? charge.description;
    const parts: string[] = [String(label)];
    if (amt != null && amt !== '') {
      parts.push(`₹ ${amt}`);
    }
    if (extra) {
      parts.push(`— ${extra}`);
    }
    const line = parts.join(' ').trim();
    return line || JSON.stringify(charge);
  }

  constructor(
    private activatedRoute: ActivatedRoute, private trackingService: DeliveryTrackingService,
    private apiService: ApiServiceService, private toastr: ToastrService, private dialog: MatDialog
  ) { }

//   ngOnInit(): void {
//     // this.activatedRoute.params.subscribe((params) => {
//     //   console.log(params)
//     //   this.id = params?.id;
//     //   this.courierId = params?.courierId;
//     // });
//     // this.getTripDetails(this.id);
    
//     this.activatedRoute.queryParams.subscribe((params) => {
//   console.log("Query Params:", params);
//   this.id = params['id'];
//   this.courierId = params['courierId'];
//   this.getTripDetails(this.id);
// });
ngOnInit(): void {

  console.log("✔ TripDetailsComponent Loaded");

  this.activatedRoute.queryParams.subscribe((params) => {

    console.log("📌 RAW Query Params:", params);

    this.id = params['id'];
    this.courierId = params['courierId'];

    console.log("📌 Extracted Trip ID:", this.id);
    console.log("📌 Extracted Courier ID:", this.courierId);

    if (!this.id) {
      console.error("❌ No Trip ID found in URL!");
      return;
    }

    console.log(`🚀 Fetching Order Details → orders?_id=${this.id}`);

    // ⭐ FIX: NOW call your function
    this.getTripDetails(this.id);
  });
}

  dottedLineSegments: { lat: number; lng: number }[][] = [];

  generateDottedPolyline(from: { lat: number; lng: number }, to: { lat: number; lng: number }, segmentLength = 0.0005, gapLength = 0.0003) {
    const line: { lat: number; lng: number }[][] = [];
    const latDiff = to.lat - from.lat;
    const lngDiff = to.lng - from.lng;
    const totalDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    const numSegments = Math.floor(totalDistance / (segmentLength + gapLength));

    for (let i = 0; i < numSegments; i++) {
      const lat = from.lat + (latDiff * (i * (segmentLength + gapLength)) / totalDistance);
      const lng = from.lng + (lngDiff * (i * (segmentLength + gapLength)) / totalDistance);
      const latNext = from.lat + (latDiff * ((i * (segmentLength + gapLength)) + segmentLength) / totalDistance);
      const lngNext = from.lng + (lngDiff * ((i * (segmentLength + gapLength)) + segmentLength) / totalDistance);

      line.push([{ lat, lng }, { lat: latNext, lng: lngNext }]); // Each segment contains two points
    }
    return line;
  }

  updateDottedLine() {
    if (this.delivery && this.origin) {
      this.dottedLineSegments = this.generateDottedPolyline(
        { lat: +this.delivery.lat, lng: +this.delivery.lng },
        { lat: +this.origin.lat, lng: +this.origin.lng }
      );
    }
  }

  // dottedRouteOptions: any;
  // updateDottedRoute() {
  //   if (this.delivery && this.origin) {
  //     this.dottedRouteOptions = {
  //       origin: this.delivery,
  //       destination: this.origin,
  //       travelMode: "WALKING",
  //       optimizeWaypoints: true,
  //       polylineOptions: {
  //         strokeColor: "blue",
  //         strokeOpacity: 0,
  //         strokeWeight: 3,
  //         icons: [
  //           {
  //             icon: {
  //               path: "M 0,-1 0,1",
  //               strokeOpacity: 1,
  //               scale: 3
  //             },
  //             offset: "0",
  //             repeat: "10px"
  //           }
  //         ]
  //       }
  //     };
  //   }
  // }

  // generateDottedPolyline(from: any, to: any, segmentLength = 0.0005, gapLength = 0.0003) {
  //   const line = [];
  //   const latDiff = to.lat - from.lat;
  //   const lngDiff = to.lng - from.lng;
  //   const totalDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  //   const numSegments = Math.floor(totalDistance / (segmentLength + gapLength));

  //   for (let i = 0; i < numSegments; i++) {
  //     const lat = from.lat + (latDiff * (i * (segmentLength + gapLength)) / totalDistance);
  //     const lng = from.lng + (lngDiff * (i * (segmentLength + gapLength)) / totalDistance);
  //     const latNext = from.lat + (latDiff * ((i * (segmentLength + gapLength)) + segmentLength) / totalDistance);
  //     const lngNext = from.lng + (lngDiff * ((i * (segmentLength + gapLength)) + segmentLength) / totalDistance);

  //     line.push([{ lat, lng }, { lat: latNext, lng: lngNext }]);
  //   }
  //   return line;
  // }

  // updateDottedLine() {
  //   if (this.delivery && this.origin) {
  //     this.dottedLineSegments = this.generateDottedPolyline(
  //       { lat: this.delivery.lat, lng: this.delivery.lng },
  //       { lat: this.origin.lat, lng: this.origin.lng }
  //     );
  //   }
  // }
  convertUTCToIST(utcDateString: string): string {
    const utcDate = new Date(utcDateString);
    const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }
  getDirection() {
    this.origin = { lat: this.pickuplat, lng: this.pickuplong }
    this.destination = { lat: this.droplat, lng: this.droplong }

  }
  public getStatus(status: any) {
    console.log(status);
  }
  public show: boolean = true;
  public removeDirection() {
    this.show = false
  }
  public showDirection() {
    this.show = true
  }
  

  getFormatTime(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const m = parseInt(minute);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${m < 10 ? '0' + m : m} ${ampm}`;
  }
  dropAddresses: any[] = [];
  deliverymanLat: any;
  deliverymanLng: any;
  totalKms: any = '';
  isMapLoaded = false;
  dropMarkers: any
  // getTripDetails(id: any) {
  //   this.apiService
  //     .getListTrip(id)
  //     .then((res) => {
  //       this.tripDetails = res.data.data[0];
  //       this.isMapLoaded = true;
  //       console.log(this.tripDetails)
  //       this.totalKms = parseFloat(this.tripDetails?.totalKms).toFixed(2)
  //       console.log(this.totalKms)


  //       if (this.tripDetails.pickupAddress.length > 0) {
  //         this.origin = {
  //           lat: this.tripDetails.pickupAddress[0].latitude,
  //           lng: this.tripDetails.pickupAddress[0].longitude
  //         };
  //       }

  //       // Set the waypoints from dropAddress (all except the last entry)
  //       if (this.tripDetails.dropAddress.length > 1) {
  //         this.waypoints = this.tripDetails.dropAddress.slice(0, 5).map((address: any) => ({
  //           location: {
  //             lat: address.latitude,
  //             lng: address.longitude
  //           },
  //           stopover: true // Optional: Indicates a stop at each waypoint
  //         }));


  //       }


  //       // Set the destination from the last entry in dropAddress
  //       if (this.tripDetails.dropAddress.length > 0) {
  //         const lastAddress = this.tripDetails.dropAddress[this.tripDetails.dropAddress.length - 1];
  //         this.destination = {
  //           lat: lastAddress.latitude,
  //           lng: lastAddress.longitude
  //         };
  //       }
  //       if (this.tripDetails?.assigneeDetails) {
  //         this.delivery = {
  //           lat: this.tripDetails?.assigneeDetails?.address?.latitude,
  //           lng: this.tripDetails?.assigneeDetails?.address?.longitude
  //         }
  //         console.log(this.tripDetails?.assigneeDetails?.address?.latitude)

  //       }
  //       console.log(this.delivery, this.delivery.lat, this.delivery.lng)
  //       // this.getDirection();
  //     })
  //     .catch((err) => {
  //       this.isMapLoaded = false;
  //       console.error(err);
  //     });

  // }
  secons;

  
 getTripDetails(id: any) {
  this.apiService.getListTrip(id)
    .then((res) => {

      this.tripDetails = res?.data?.data?.[0] ?? {};
      console.log("TripDetails →", this.tripDetails);

      /** ------------------------------
       * 1. SAFETY NORMALIZATION
       * ------------------------------ */
      this.tripDetails.pickupAddress = this.tripDetails.pickupAddress ?? [];
      this.tripDetails.dropAddress = this.tripDetails.dropAddress ?? [];
      this.tripDetails.assigneeDetails = this.tripDetails.assigneeDetails ?? null;

      /** ------------------------------
       * 2. PICKUP LOCATION
       * ------------------------------ */
      if (this.tripDetails.pickupAddress.length > 0) {
        this.origin = {
          lat: +this.tripDetails.pickupAddress[0].latitude,
          lng: +this.tripDetails.pickupAddress[0].longitude
        };
      } else {
        this.origin = null;
      }

      /** ------------------------------
       * 3. DROP-OFF LOCATIONS
       * ------------------------------ */
      if (this.tripDetails.dropAddress.length > 0) {

        const dropList = this.tripDetails.dropAddress.slice(0, 5);

        // Destination = last drop point
        const last = dropList[dropList.length - 1];
        this.destination = {
          lat: +last.latitude,
          lng: +last.longitude
        };

        // Waypoints = all except last
        this.waypoints = dropList.slice(0, -1).map((item: any) => ({
          location: { lat: +item.latitude, lng: +item.longitude },
          stopover: true
        }));

        // Create markers for map display
        this.dropMarkers = dropList.map((item: any, i: number) => ({
          lat: +item.latitude,
          lng: +item.longitude,
          label: String.fromCharCode(65 + i)
        }));

      } else {
        this.destination = null;
        this.waypoints = [];
        this.dropMarkers = [];
      }

      /** ------------------------------
       * 4. COURIER (ASSIGNEE) LOCATION
       * ------------------------------ */
      if (this.tripDetails.assigneeDetails?.address?.latitude &&
          this.tripDetails.assigneeDetails?.address?.longitude) {

        this.delivery = {
          lat: +this.tripDetails.assigneeDetails.address.latitude,
          lng: +this.tripDetails.assigneeDetails.address.longitude
        };
      } else {
        this.delivery = null;   // ⭐ IMPORTANT: prevents map crash
      }

      this.isMapLoaded = true;
    })
    .catch((err) => {
      this.isMapLoaded = false;
      console.error(err);
    });
}




  uneffectiveDistance() {
    let payload = {
      pickUpLat: this.pickuplat,
      pickUpLong: this.pickuplong,
      userId: this.courierId,
      type: 'primary',
    };
    console.log(payload)

    this.apiService.uneffectiveDistance(payload).subscribe((res) => {
      this.uneffectiveDist = res?.data;
    });
  }
//   removeDeliveryMan() {
//     const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
//       data: { status: 'Remove' },
//       disableClose: true,
//     });
//     dialogRef.afterClosed().subscribe((result) => {

//       if (result) {
//         console.log(result);
        
//         const orderId =
//   this.tripDetails?._id ||
//   this.tripDetails?.orderId ||
//   this.id;

// console.log("✅ FINAL ORDER ID:", orderId);

//         // Guard condition: prevent API call if orderId is undefined
//         if (!orderId) {
//           console.error("❌ Order ID is missing - cannot proceed with API call");
//           this.toastr.error("Order ID is missing. Please refresh and try again.");
//           return;
//         }

//         // Fixed payload structure as per requirements
//         let payload = {
//           assignedToId: null,
//           orderStatus: "new"
//         };
// console.log("DeliveryMan ID:", this.deliverymanid);
// console.log("Payload:", payload);
//         console.log("🚀 Calling API with orderId:", orderId);
//         console.log("📦 Payload:", payload);

//         this.apiService.assignDeliveryManUpdate(orderId, payload)
//           .subscribe((response) => {
//             console.log("✅ API Response:", response);
//             if (response.code == 200) {
//               this.toastr.success('Successfully Updated...!');
//               this.getTripDetails(this.id);
//             }
//           },
//           (err) => {
//             console.error("❌ API Error:", err);
//             this.toastr.error("Failed to update delivery assignment.");
//           });
//       }
//     });
//   }


removeDeliveryMan() {
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    data: { status: 'Remove' },
    disableClose: true,
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (!result) return;

    console.log("FULL tripDetails:", this.tripDetails);

    const orderId =
      this.tripDetails?._id ||
      this.tripDetails?.orderId ||
      this.id;

    const deliveryManId =
      this.tripDetails?.assigneeDetails?._id;

    console.log("Order ID:", orderId);
    console.log("DeliveryMan ID:", deliveryManId);

    if (!orderId) {
      console.error("❌ Order ID missing");
      return;
    }

    if (!deliveryManId) {
      console.error("❌ DeliveryMan ID missing");
      return;
    }

    let payload = {
      assignedToId: deliveryManId,
      orderStatus: "new"
    };

    this.apiService.assignDeliveryManUpdate(orderId, payload)
      .subscribe(
        (response) => {
          console.log("API response:", response);
          if (response.code === 200) {
            this.toastr.success('Successfully Updated!');
            this.getTripDetails(orderId);
          }
        },
        (err) => {
          console.error(err);
        }
      );
  });
}
  canceltrip() {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Cancel' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        console.log(result);
        let payload = {
          cancelledAt: new Date(),
          orderStatus: "cancelled"

        };
        this.apiService
          .cancelTrip(this.id, payload)
          .subscribe((response) => {
            if (response.code == 200) {
              this.toastr.success('Successfully Updated...!');
              this.getTripDetails(this.id);

            } else {

            }
          }),
          (err) => {
            // this.fileuploadstatus = false;
          };
      }
    });
  }
  paymentStatus = '';
  deliveredOrder() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Deliver' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        console.log(result);
        // Update the delivered value for each dropAddress
        const updatedDropAddress = this.tripDetails.dropAddress.map((address) => ({
          ...address,
          delivered: true
        }));


        if (this.tripDetails.paymentDetails.paymentMode == 'cash on pickup') {
          this.paymentStatus = 'COPcompleted'
        } else if (this.tripDetails.paymentDetails.paymentMode == 'cash on delivery') {
          this.paymentStatus = 'CODcompleted'
        } else {
          this.paymentStatus = 'credit';
        }
        let payload = {
          deliveredAt: new Date(),
          orderStatus: "delivered",
          assigneeDetails: this.tripDetails.assigneeDetails,
          dropAddress: updatedDropAddress,
          paymentStatus: this.paymentStatus,
          userId: this.tripDetails.userId,
          deliveryType: this.tripDetails.deliveryType,
          selectedPackage: this.tripDetails.selectedPackage,
          subCategory: this.tripDetails.subCategory,
          pickupAddress: this.tripDetails.pickupAddress,
          totalKms: this.tripDetails.totalKms,
          tripCost: this.tripDetails.tripCost,
          discountAmount: this.tripDetails.discountAmount,
          amountDetails: this.tripDetails.amountDetails,
          // role:"",type:""



        };
        this.apiService
          .deliveredTrip(this.id, payload)
          .subscribe((response) => {
            if (response.code == 200) {
              this.toastr.success('Successfully Updated...!');
              this.getTripDetails(this.id);

            } else {

            }
          }),
          (err) => {
            // this.fileuploadstatus = false;
          };
      }
    });
  }

  // trackDeliveryman() {
  //   setInterval(() => {
  //     // Simulating real-time location updates (Replace with API/WebSocket)
  //     this.deliverymanLat = 0.0001; // Simulated movement in latitude
  //     this.deliverymanLng = 0.0001; // Simulated movement in longitude

  //     // Store previous locations for tracking movement path
  //     this.movementPath.push({ lat: this.deliverymanLat, lng: this.deliverymanLng });

  //     console.log(this.movementPath)
  //     // Limit path length to avoid excessive points
  //     if (this.movementPath.length > 50) {
  //       this.movementPath.shift();
  //     }
  //   }, 2000); // Update every 2 seconds
  // }


  // trackDeliveryman() {
  //   setInterval(() => {
  //     // 🔹 Simulate random movement (Replace this with actual GPS data)
  //     this.deliverymanLat = parseFloat(this.delivery.lat) || 0; // Example lat (default to 0 if invalid)
  //     this.deliverymanLng = parseFloat(this.delivery.lng) || 0; // Example lng

  //     // 🔹 Update Firestore with the new location
  //     this.trackingService.updateLocation(this.id, this.deliverymanLat, this.deliverymanLng);

  //     // 🔹 Store movement path
  //     this.movementPath.push({ lat: this.deliverymanLat, lng: this.deliverymanLng });

  //     // 🔹 Limit path length
  //     if (this.movementPath.length > 50) {
  //       this.movementPath.shift();
  //     }
  //   }, 2000); // Update every 2 seconds

  //   // 🔹 Listen for real-time location updates from Firestore
  //   this.trackingService.trackLocation(this.id, (lat, lng) => {
  //     this.deliverymanLat = lat;
  //     this.deliverymanLng = lng;

  //   });
  //   console.log(this.trackingService)
  // }



  // trackDeliveryman() {
  //   setInterval(() => {

      
  //     this.deliverymanLat = parseFloat(this.delivery.lat) || 0;
  //     this.deliverymanLng = parseFloat(this.delivery.lng) || 0;

  //     if (isNaN(this.deliverymanLat) || isNaN(this.deliverymanLng)) {
  //       console.error("Invalid latitude or longitude detected!");
  //       return;
  //     }
  //     // this.trackingService.updateLocation(this.id, this.deliverymanLat, this.deliverymanLng);


  //     this.movementPath.push({ lat: this.deliverymanLat, lng: this.deliverymanLng });


  //     if (this.movementPath.length > 50) {
  //       this.movementPath.shift();
  //     }
  //   }, 2000);
  //   this.trackingService.trackLocation(this.id, (lat, lng) => {
  //     this.deliverymanLat = lat;
  //     this.deliverymanLng = lng;

  //   });
  // }
  trackDeliveryman() {

  if (!this.delivery) {
    console.warn("No courier assigned — live tracking disabled.");
    return;
  }

  setInterval(() => {

    if (!this.delivery) return; // Safe check — stops null error

    const lat = Number(this.delivery.lat);
    const lng = Number(this.delivery.lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid delivery coordinates!");
      return;
    }

    this.deliverymanLat = lat;
    this.deliverymanLng = lng;

    this.movementPath.push({ lat, lng });

    if (this.movementPath.length > 50) {
      this.movementPath.shift();
    }

  }, 2000);

  // Firestore tracking
  this.trackingService.trackLocation(this.id, (lat: number, lng: number) => {
    this.deliverymanLat = lat;
    this.deliverymanLng = lng;
  });
}


}
