import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
declare const google: any;

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss'],
})
export class ZoneComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  map!: google.maps.Map;

  // Preview shapes
  previewPolyline?: google.maps.Polyline;
  previewRectangle?: google.maps.Rectangle;

  // Saved shapes
  savedPolylines: google.maps.Polyline[] = [];

  drawingManager!: google.maps.drawing.DrawingManager;

  zones: any[] = [];
  allZones: any[] = [];
  zoneName: string = '';  
  
  previewZone: any = null;

  lat = 13.0827;
  lng = 80.2707;
  zoom = 12;

  loading = false;
  error = '';
  limit = 10;
offset = 0;
totalCount = 0;
searchValue = '';

  // Delivery partners
  deliveryPartners: any[] = [];
  selectedDeliveryList: any[] = [];
  selectedZoneName: string = '';
  infoWindow: google.maps.InfoWindow | null = null;
constructor(
  private api: ApiServiceService,
  private dialog: MatDialog,
  private toastr: ToastrService
) {}

  // ---------------- LIFECYCLE ----------------
  ngOnInit(): void {
    this.loadZones();
    this.fetchDeliveryPartners();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initAutocomplete();
    this.initDrawing();
  }

  // ---------------- DELIVERY PARTNERS ----------------
 
  fetchDeliveryPartners() {
    this.api.getAllCourierDetails('deliveryman', 1000, 0, '', '').then((res: any) => {
      const partners = Array.isArray(res?.data) ? res.data : res?.data?.data || [];

      if (res?.code === 200 && Array.isArray(partners)) {
        this.deliveryPartners = partners
          .filter((d: any) => d?.isReady === true && d?.zoneId != null)
          .map((d: any) => ({
            ...d,
            vehicleDetails: d?.vehicleDetails || null,
          }));

        this.deliveryPartners.forEach((partner: any) => {
          console.log('Vehicle Details:', partner?.vehicleDetails);
        });
      } else {
        this.deliveryPartners = [];
      }

      console.log('Fetched delivery partners:', this.deliveryPartners.length);
      this.mapDeliveryPartnersToZones();
    }).catch((err) => {
      console.error('Error fetching delivery partners:', err);
      this.deliveryPartners = [];
      this.mapDeliveryPartnersToZones();
    });
  }

//  mapDeliveryPartnersToZones() {

//   if (!this.zones?.length) return;

//   this.zones.forEach((zone) => {

//     const drivers = this.deliveryPartners.filter((d) =>
//       d.zoneId && String(d.zoneId) === String(zone._id)
//     );

//     zone.deliveryList = drivers;
//     zone.count = drivers.length;
//     zone.zoneName = drivers[0]?.zoneDetails?.zoneName || 'Unknown Zone';

//     console.log("Zone:", zone.zoneName, "Drivers:", drivers.length, "Zone Name:", zone.zoneName);

//   });

//   this.addZoneMarkers();
// }

mapDeliveryPartnersToZones() {

  if (!this.zones?.length || !this.deliveryPartners?.length) return;

  this.zones.forEach((zone) => {

    // ✅ filter drivers by zoneId
    const drivers = this.deliveryPartners.filter((d) =>
      d.zoneId && String(d.zoneId) === String(zone._id)
    );

    // ✅ assign list
    zone.deliveryList = drivers;

    // ✅ count only READY drivers
    zone.count = drivers.filter(d => d.isReady === true).length;

    // ✅ USE ZONE NAME DIRECTLY (IMPORTANT FIX)
    zone.displayName = zone.zoneName || 'Unknown Zone';

    console.log(
      "Zone:",
      zone.displayName,
      "Drivers:",
      zone.count
    );

  });

  this.addZoneMarkers();
}

  isPointInBounds(point: { lat: number; lng: number }, bounds: any): boolean {
    if (!bounds) return false;
    const ne = bounds.northeast;
    const sw = bounds.southwest;
    return (
      point.lat >= sw.lat &&
      point.lat <= ne.lat &&
      point.lng >= sw.lng &&
      point.lng <= ne.lng
    );
  }

  addZoneMarkers() {
    // Clear existing markers if any
    this.zones.forEach((zone) => {
      if (zone.marker) {
        zone.marker.setMap(null);
      }
    });

    this.zones.forEach((zone) => {
      if (zone.center && zone.count > 0) {
        const marker = new google.maps.Marker({
          position: zone.center,
          label: String(zone.count),
          map: this.map,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="blue" stroke="white" stroke-width="2"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${zone.count}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        marker.addListener('click', () => {
          this.showDeliveryList(zone.deliveryList, marker, zone.displayName);
        });

        zone.marker = marker;
      }
    });
  }

  showDeliveryList(list: any[], marker: google.maps.Marker, zoneName?: string) {
    this.selectedDeliveryList = list || [];
    this.selectedZoneName = zoneName || list?.[0]?.zoneDetails?.zoneName || 'No zone';

    this.selectedDeliveryList.forEach((partner: any) => {
      console.log('Vehicle Details:', partner?.vehicleDetails);
    });

    const content = this.selectedDeliveryList.length > 0
      ? '<ul style="list-style: none; padding: 0; margin: 0;">' +
        this.selectedDeliveryList
          .map(
            (d) => `
              <li style="margin-bottom:8px;">
                <strong>${d?.name || 'Unknown Partner'}</strong><br/>
                📞 ${d?.mobileNo || 'No mobile'}<br/>
                🚗 ${d?.vehicleDetails?.name || 'No Vehicle Assigned'}
              </li>`
          )
          .join('') +
        '</ul>'
      : 'No delivery partners available';

    if (!this.infoWindow) {
      this.infoWindow = new google.maps.InfoWindow();
    }

    this.infoWindow!.setContent(content);
    this.infoWindow!.open(this.map, marker);
  }

  // ---------------- MAP INIT ----------------
  initMap() {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: this.lat, lng: this.lng },
        zoom: this.zoom,
      }
    );
  }

  // ---------------- AUTOCOMPLETE (OLD FEATURE) ----------------
  initAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.searchInput.nativeElement,
      { types: ['geocode'] }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.viewport) return;

      const ne = place.geometry.viewport.getNorthEast();
      const sw = place.geometry.viewport.getSouthWest();

      this.clearPreview();

      const rectanglePath = [
        { lat: ne.lat(), lng: sw.lng() },
        { lat: ne.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: sw.lng() },
        { lat: ne.lat(), lng: sw.lng() },
      ];

      this.previewPolyline = new google.maps.Polyline({
        path: rectanglePath,
        strokeOpacity: 0.6,
        strokeWeight: 2,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              strokeColor: '#ff0000',
              scale: 4,
            },
            offset: '0',
            repeat: '10px',
          },
        ],
        map: this.map,
      });

      this.previewZone = {
        // zoneName: this.extractZone(place.address_components || []),
        zoneName: this.searchInput.nativeElement.value,
        //zoneName: this.zoneName || 'Manual Zone',
        
        placeId: place.place_id,
        center: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        bounds: {
          northeast: { lat: ne.lat(), lng: ne.lng() },
          southwest: { lat: sw.lat(), lng: sw.lng() },
        },
        isActive: true,
      };

      this.map.fitBounds(place.geometry.viewport);
    });
  }

  extractZone(components: any[]): string {
    const area =
      components.find(c => c.types.includes('sublocality_level_1')) ||
      components.find(c => c.types.includes('locality'));
    return area?.long_name || 'Unknown Zone';
  }

  // ---------------- MANUAL DRAW RECTANGLE ----------------
  initDrawing() {
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingMode: null,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['rectangle'],
      },
      rectangleOptions: {
        fillOpacity: 0.1,
        strokeWeight: 2,
        strokeColor: '#ff0000',
        clickable: false,
      },
    });

    this.drawingManager.setMap(this.map);

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event: any) => {
        if (event.type !== 'rectangle') return;

        this.clearPreview();

        // ✅ STRICT MODE SAFE
        const rectangle = event.overlay as google.maps.Rectangle;
        this.previewRectangle = rectangle;

        const bounds = rectangle.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const center = bounds.getCenter();

        this.previewZone = {
          zoneName: this.searchInput.nativeElement.value,
          // zoneName: this.zoneName || 'Manual Zone',
          center: {
            lat: center.lat(),
            lng: center.lng(),
          },
          bounds: {
            northeast: { lat: ne.lat(), lng: ne.lng() },
            southwest: { lat: sw.lat(), lng: sw.lng() },
          },
          isActive: true,
        };

        this.drawingManager.setDrawingMode(null);
      }
    );
  }

  enableDraw() {
    this.clearPreview();
    this.drawingManager.setDrawingMode(
      google.maps.drawing.OverlayType.RECTANGLE
    );
  }

  // ---------------- SAVE ----------------
 saveZone() {
  if (!this.previewZone) return;

  this.previewZone.zoneName =
    this.previewZone.zoneName || this.searchInput.nativeElement.value;

  this.loading = true;

  this.api.createZone(this.previewZone).subscribe({
    next: () => {
      this.loading = false;
      this.clearPreview();
      this.loadZones();
      this.searchInput.nativeElement.value = '';
    },
    error: () => {
      this.loading = false;
      this.error = 'Failed to save zone';
    },
  });
}

  cancelPreview() {
    this.clearPreview();
  }

  clearPreview() {
    this.previewZone = null;

    if (this.previewPolyline) {
      this.previewPolyline.setMap(null);
      this.previewPolyline = undefined;
    }

    if (this.previewRectangle) {
      this.previewRectangle.setMap(null);
      this.previewRectangle = undefined;
    }
  }

  // ---------------- LOAD SAVED ZONES ----------------
  // loadZones() {
  //   this.api.getZones().subscribe({
  //     next: (res: any) => {
  //       this.zones = res?.data ?? res ?? [];
  //       this.drawSavedZones();
  //     },
  //   });
  // }
loadZones() {

  this.api.getZones().then((res: any) => {
      this.allZones = res?.data?.data || []; 
      console.log("ZONE API:", res);

    // ✅ HANDLE BOTH POSSIBLE STRUCTURES SAFELY
    this.allZones = Array.isArray(res?.data)
      ? res.data
      : res?.data?.data || [];

    // this.allZones = res?.data ?? res ?? [];
    this.totalCount = this.allZones.length;

    const start = this.offset * this.limit;
    const end = start + this.limit;

    this.zones = this.allZones.slice(start, end);

    this.drawSavedZones();    this.mapDeliveryPartnersToZones();
  }).catch((err: any) => {
    console.error(err);
  });

}
 pageChange(e: any) {

  this.limit = e.pageSize;
  this.offset = e.pageIndex;

  const start = this.offset * this.limit;
  const end = start + this.limit;

  this.zones = this.allZones.slice(start, end);

  this.drawSavedZones();
  this.mapDeliveryPartnersToZones();

}

  drawSavedZones() {
    this.savedPolylines.forEach(p => p.setMap(null));
    this.savedPolylines = [];

    for (const zone of this.zones) {
      const b = zone.bounds;

      const path = [
        { lat: b.northeast.lat, lng: b.southwest.lng },
        { lat: b.northeast.lat, lng: b.northeast.lng },
        { lat: b.southwest.lat, lng: b.northeast.lng },
        { lat: b.southwest.lat, lng: b.southwest.lng },
        { lat: b.northeast.lat, lng: b.southwest.lng },
      ];

      const polyline = new google.maps.Polyline({
        path,
        strokeOpacity: 0.6,
        strokeWeight: 2,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              strokeColor: zone.isActive ? '#2e7d32' : '#f9a825',
              scale: 4,
            },
            offset: '0',
            repeat: '10px',
          },
        ],
        map: this.map,
      });

      this.savedPolylines.push(polyline);
    }
  }

// ---------------- TOGGLE ACTIVE / INACTIVE ----------------
toggleZone(zone: any) {

  const payload = {
    ...zone,
    isActive: !zone.isActive
  };

  this.api.updateZone(zone._id, payload).subscribe({
    next: () => {
      zone.isActive = !zone.isActive;
      this.drawSavedZones(); // refresh map color
    },
    error: () => {
      console.error("Failed to update zone");
    }
  });

}


// ---------------- DELETE ZONE ----------------
deleteZone(item: any) {

  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    data: { status: 'Delete' },
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {

    if (result) {

      this.api.deleteZone(item._id).subscribe((res: any) => {

        if (res.code == 200) {

          this.toastr.success(res.message);

          // reload zone list
          this.loadZones();

        } else {

          this.toastr.error(res.message);

        }

      });

    }

  });

}


}


