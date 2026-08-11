import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
declare const google: any;

const GOOGLE_MAPS_API_KEY = 'AIzaSyAOZewZNjU5p3SRKy4waqDjhkpvK2vIjso';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss'],
})
export class ZoneComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;

  map!: google.maps.Map;

  // Preview shapes
  previewPolyline?: google.maps.Polyline;
  previewRectangle?: google.maps.Rectangle;

  // Saved shapes
  savedPolylines: google.maps.Polyline[] = [];

  zones: any[] = [];
  allZones: any[] = [];
  zoneName: string = '';

  /** Editable name when a zone preview exists; letters and spaces only. */
  pendingZoneName = '';

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

  /** Names of existing zones that overlap the current preview zone. */
  overlapWarning: string[] = [];

  drawModeActive = false;
  mapLoading = true;
  mapLoadError = '';

  /** Page size when loading zones from the API (must load all rows for overlap checks). */
  private readonly zoneApiPageSize = 200;

  private mapsInitTimer: ReturnType<typeof setTimeout> | null = null;
  private mapsReadyCallbacks: (() => void)[] = [];
  private googleMapsLoadPromise: Promise<void> | null = null;
  private autocompleteInitialized = false;

  /** Custom rectangle draw (replaces deprecated DrawingManager). */
  private drawMapListeners: google.maps.MapsEventListener[] = [];
  private drawStartLatLng: google.maps.LatLng | null = null;
  private drawTempRectangle: google.maps.Rectangle | null = null;
  private isDraggingDraw = false;
  private documentMouseUpHandler: (() => void) | null = null;

constructor(
  private api: ApiServiceService,
  private dialog: MatDialog,
  private toastr: ToastrService,
  private ngZone: NgZone,
  private cdr: ChangeDetectorRef
) {}

  // ---------------- LIFECYCLE ----------------
  ngOnInit(): void {
    this.loadZones();
    this.fetchDeliveryPartners();
  }

  ngAfterViewInit(): void {
    this.bootstrapMapStack();
  }

  ngOnDestroy(): void {
    if (this.mapsInitTimer) {
      clearTimeout(this.mapsInitTimer);
      this.mapsInitTimer = null;
    }
    this.stopDrawMode();
  }

  /** Load Google Maps JS (waits for index.html script or injects one). */
  private loadGoogleMapsScript(): Promise<void> {
    if (this.isGoogleMapsApiAvailable()) {
      return Promise.resolve();
    }

    if (this.googleMapsLoadPromise) {
      return this.googleMapsLoadPromise;
    }

    this.googleMapsLoadPromise = new Promise((resolve, reject) => {
      const finish = (): void => {
        if (this.isGoogleMapsApiAvailable()) {
          resolve();
        } else {
          this.waitForGoogleMapsApi(resolve, reject);
        }
      };

      const existing = Array.from(document.scripts).find((s) =>
        s.src.includes('maps.googleapis.com/maps/api/js')
      );

      if (existing) {
        existing.addEventListener('load', finish, { once: true });
        existing.addEventListener('error', () => reject(new Error('Google Maps script error')), {
          once: true,
        });
        finish();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=en`;
      script.async = true;
      script.defer = true;
      script.onload = finish;
      script.onerror = () => reject(new Error('Google Maps script error'));
      document.head.appendChild(script);
    });

    return this.googleMapsLoadPromise;
  }

  private waitForGoogleMapsApi(
    resolve: () => void,
    reject: (err: Error) => void,
    attempt = 0
  ): void {
    if (this.isGoogleMapsApiAvailable()) {
      resolve();
      return;
    }
    if (attempt >= 100) {
      reject(new Error('Google Maps API timed out'));
      return;
    }
    this.mapsInitTimer = setTimeout(
      () => this.waitForGoogleMapsApi(resolve, reject, attempt + 1),
      100
    );
  }

  private isGoogleMapsApiAvailable(): boolean {
    const g = (window as { google?: any }).google;
    return !!(g?.maps?.Map && g?.maps?.places?.Autocomplete);
  }

  private bootstrapMapStack(onReady?: () => void): void {
    if (onReady) {
      this.mapsReadyCallbacks.push(onReady);
    }

    if (this.map) {
      this.mapLoading = false;
      this.runMapsReadyCallbacks();
      return;
    }

    this.mapLoading = true;
    this.mapLoadError = '';
    this.cdr.markForCheck();

    this.loadGoogleMapsScript()
      .then(() => {
        this.ngZone.run(() => {
          this.setupMapStackIfNeeded();
          this.mapLoading = false;
          this.runMapsReadyCallbacks();
          this.cdr.detectChanges();
        });
      })
      .catch((err: Error) => {
        this.ngZone.run(() => {
          this.mapLoading = false;
          this.mapLoadError = 'Failed to load Google Maps. Please refresh the page.';
          this.mapsReadyCallbacks = [];
          this.toastr.error(this.mapLoadError);
          console.error(err);
          this.cdr.detectChanges();
        });
      });
  }

  /** Initialize map and autocomplete — each step is idempotent. */
  private setupMapStackIfNeeded(): void {
    if (!this.mapContainer?.nativeElement) {
      return;
    }

    if (!this.map) {
      this.initMap();
    }
    if (!this.autocompleteInitialized) {
      this.initAutocomplete();
    }

    if (this.allZones.length > 0) {
      this.drawSavedZones();
      this.mapDeliveryPartnersToZones();
    }
  }

  private runMapsReadyCallbacks(): void {
    const callbacks = this.mapsReadyCallbacks.splice(0);
    callbacks.forEach((cb) => cb());
  }

  private markPreviewChanged(): void {
    this.cdr.detectChanges();
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
    if (!this.map) return;

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
          this.ngZone.run(() => {
            this.showDeliveryList(zone.deliveryList, marker, zone.displayName);
          });
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
    const mapEl = this.mapContainer?.nativeElement;
    if (!mapEl) return;

    this.map = new google.maps.Map(mapEl, {
      center: { lat: this.lat, lng: this.lng },
      zoom: this.zoom,
      mapTypeControl: true,
      streetViewControl: false,
    });
  }

  // ---------------- AUTOCOMPLETE (search to select zone area) ----------------
  initAutocomplete() {
    if (this.autocompleteInitialized || !this.searchInput?.nativeElement) {
      return;
    }
    this.autocompleteInitialized = true;

    const autocomplete = new google.maps.places.Autocomplete(
      this.searchInput.nativeElement,
      { types: ['geocode'], fields: ['place_id', 'geometry', 'address_components', 'name'] }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.viewport) return;

      const ne = place.geometry.viewport.getNorthEast();
      const sw = place.geometry.viewport.getSouthWest();

      this.ngZone.run(() => {
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

        const rawName =
          this.extractZone(place.address_components || []) ||
          this.searchInput.nativeElement.value;
        this.pendingZoneName = this.sanitizeZoneNameInput(rawName);

        this.previewZone = {
          zoneName: this.pendingZoneName,
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

        this.overlapWarning = this.checkOverlappingZones(this.previewZone.bounds);

        this.drawModeActive = false;
        this.markPreviewChanged();
      });

      this.map.fitBounds(place.geometry.viewport);
    });
  }

  extractZone(components: any[]): string {
    const area =
      components.find(c => c.types.includes('sublocality_level_1')) ||
      components.find(c => c.types.includes('locality'));
    return area?.long_name || 'Unknown Zone';
  }

  /** Strip numbers and symbols; keep Unicode letters and spaces. */
  private sanitizeZoneNameInput(raw: string): string {
    if (!raw) return '';
    return raw.replace(/[^\p{L}\s]/gu, '').replace(/\s+/g, ' ');
  }

  onPendingZoneNameNgModelChange(): void {
    const cleaned = this.sanitizeZoneNameInput(this.pendingZoneName);
    if (cleaned !== this.pendingZoneName) {
      this.pendingZoneName = cleaned;
    }
    if (this.previewZone) {
      this.previewZone.zoneName = this.pendingZoneName;
    }
  }

  /**
   * Reads user-facing text from API errors.
   * NestJS 400 body: { message: string | string[], error: "Bad Request", statusCode: 400 }
   * — use `message` only; `error` is the generic HTTP label, not the detail.
   */
  private readApiErrorMessage(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown> | null;
    const httpLike =
      err instanceof HttpErrorResponse ||
      (!!e &&
        typeof e === 'object' &&
        typeof (e as { status?: unknown }).status === 'number' &&
        'error' in e);

    const body = httpLike
      ? (err as HttpErrorResponse).error
      : (e as any)?.error ?? err;

    if (typeof body === 'string') {
      const t = body.trim();
      if (t.startsWith('{') || t.startsWith('[')) {
        try {
          return this.readApiErrorMessage({ error: JSON.parse(t) }, fallback);
        } catch {
          return t || fallback;
        }
      }
      return t || fallback;
    }

    if (body && typeof body === 'object') {
      const o = body as Record<string, unknown>;
      const fromData =
        typeof o['data'] === 'object' && o['data'] !== null
          ? (o['data'] as Record<string, unknown>)['message']
          : undefined;

      const raw = o['message'] ?? o['msg'] ?? fromData;

      if (Array.isArray(raw)) {
        const parts = raw.filter((x) => typeof x === 'string' && x.trim());
        if (parts.length) return parts.join(', ');
      }
      if (typeof raw === 'string' && raw.trim()) return raw.trim();
    }

    return fallback;
  }

  /**
   * Approximate width/height of a lat/lng bounding box in meters (adequate for city-scale zones).
   */
  private boundsSideLengthsMeters(
    ne: { lat: number; lng: number },
    sw: { lat: number; lng: number }
  ): { widthM: number; heightM: number } {
    const latMid = (ne.lat + sw.lat) / 2;
    const degLat = Math.abs(ne.lat - sw.lat);
    const degLng = Math.abs(ne.lng - sw.lng);
    const mPerDegLat = 111320;
    const mPerDegLng = 111320 * Math.cos((latMid * Math.PI) / 180);
    return {
      heightM: degLat * mPerDegLat,
      widthM: degLng * mPerDegLng,
    };
  }

  // ---------------- OVERLAP DETECTION ----------------

  /**
   * Returns true when two axis-aligned bounding boxes share any area.
   * Touching edges (lat/lng exactly equal) are NOT considered overlapping.
   */
  private boundsOverlap(
    b1: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } },
    b2: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } }
  ): boolean {
    if (b1.northeast.lat <= b2.southwest.lat) return false;
    if (b1.southwest.lat >= b2.northeast.lat) return false;
    if (b1.northeast.lng <= b2.southwest.lng) return false;
    if (b1.southwest.lng >= b2.northeast.lng) return false;
    return true;
  }

  /**
   * Normalizes API/stored bounds to { northeast, southwest } with numeric lat/lng.
   */
  private normalizeBounds(
    raw: any
  ): { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } } | null {
    if (!raw || typeof raw !== 'object') return null;
    const pick = (pt: any): { lat: number; lng: number } | null => {
      if (!pt || typeof pt !== 'object') return null;
      const lat = Number(pt.lat);
      const lng = Number(pt.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      return null;
    };
    const ne = pick(raw.northeast ?? raw.northEast);
    const sw = pick(raw.southwest ?? raw.southWest);
    if (!ne || !sw) return null;
    return { northeast: ne, southwest: sw };
  }

  /** Returns the names of all saved zones whose bounds overlap with `newBounds`. */
  private checkOverlappingZones(newBounds: any): string[] {
    const nb = this.normalizeBounds(newBounds);
    if (!nb) return [];
    return this.allZones
      .filter((z) => {
        const zb = this.normalizeBounds(z.bounds);
        return zb !== null && this.boundsOverlap(nb, zb);
      })
      .map((z) => z.zoneName || 'Unknown Zone');
  }

  // ---------------- MANUAL DRAW RECTANGLE (custom — DrawingManager is deprecated) ----------------

  enableDraw() {
    this.bootstrapMapStack(() => {
      if (!this.map) {
        this.toastr.error('Map failed to load. Please refresh the page.');
        return;
      }
      this.startDrawMode();
    });
  }

  private startDrawMode(): void {
    if (!this.map) return;

    this.clearPreview();
    this.drawModeActive = true;
    this.map.setZoom(11);
    this.map.setOptions({ draggableCursor: 'crosshair', draggingCursor: 'crosshair' });
    this.attachDrawListeners();
    this.cdr.detectChanges();

    this.toastr.info(
      'Click and drag on the map to draw a zone.',
      '',
      { timeOut: 7000 }
    );
  }

  private stopDrawMode(): void {
    this.drawModeActive = false;
    this.isDraggingDraw = false;
    this.drawStartLatLng = null;
    this.detachDrawListeners();
    this.removeDocumentMouseUpListener();
    this.clearDrawTempRectangle();

    if (this.map) {
      this.map.setOptions({
        draggable: true,
        draggableCursor: undefined,
        draggingCursor: undefined,
      });
    }
  }

  private attachDrawListeners(): void {
    if (!this.map || this.drawMapListeners.length > 0) return;

    this.drawMapListeners.push(
      this.map.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
        this.onDrawMouseDown(e);
      }),
      this.map.addListener('mousemove', (e: google.maps.MapMouseEvent) => {
        this.onDrawMouseMove(e);
      }),
      this.map.addListener('mouseup', (e: google.maps.MapMouseEvent) => {
        this.onDrawMouseUp(e);
      })
    );
  }

  private detachDrawListeners(): void {
    this.drawMapListeners.forEach((l) => l.remove());
    this.drawMapListeners = [];
  }

  private attachDocumentMouseUpListener(): void {
    this.removeDocumentMouseUpListener();
    this.documentMouseUpHandler = () => {
      this.ngZone.run(() => this.finishDrawDrag(null));
    };
    document.addEventListener('mouseup', this.documentMouseUpHandler);
  }

  private removeDocumentMouseUpListener(): void {
    if (this.documentMouseUpHandler) {
      document.removeEventListener('mouseup', this.documentMouseUpHandler);
      this.documentMouseUpHandler = null;
    }
  }

  private onDrawMouseDown(e: google.maps.MapMouseEvent): void {
    if (!this.drawModeActive || !e.latLng || !this.map) return;

    const domEvent = e.domEvent as MouseEvent | undefined;
    if (domEvent?.button !== undefined && domEvent.button !== 0) return;

    this.isDraggingDraw = true;
    this.drawStartLatLng = e.latLng;
    this.map.setOptions({ draggable: false });
    this.clearDrawTempRectangle();
    this.attachDocumentMouseUpListener();
  }

  private onDrawMouseMove(e: google.maps.MapMouseEvent): void {
    if (!this.isDraggingDraw || !this.drawStartLatLng || !e.latLng || !this.map) return;

    const bounds = this.boundsFromLatLngPair(this.drawStartLatLng, e.latLng);
    if (!this.drawTempRectangle) {
      this.drawTempRectangle = new google.maps.Rectangle({
        bounds,
        fillOpacity: 0.12,
        fillColor: '#ff0000',
        strokeWeight: 2,
        strokeColor: '#ff0000',
        map: this.map,
        clickable: false,
      });
    } else {
      this.drawTempRectangle.setBounds(bounds);
    }
  }

  private onDrawMouseUp(e: google.maps.MapMouseEvent): void {
    this.ngZone.run(() => this.finishDrawDrag(e.latLng ?? null));
  }

  private finishDrawDrag(endLatLng: google.maps.LatLng | null): void {
    if (!this.isDraggingDraw || !this.drawStartLatLng) return;

    this.isDraggingDraw = false;
    this.removeDocumentMouseUpListener();

    const start = this.drawStartLatLng;
    this.drawStartLatLng = null;

    if (!endLatLng) {
      this.clearDrawTempRectangle();
      return;
    }

    const bounds = this.boundsFromLatLngPair(start, endLatLng);
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const nePlain = { lat: ne.lat(), lng: ne.lng() };
    const swPlain = { lat: sw.lat(), lng: sw.lng() };
    const { widthM, heightM } = this.boundsSideLengthsMeters(nePlain, swPlain);

    if (widthM < 50 || heightM < 50) {
      this.clearDrawTempRectangle();
      this.toastr.warning('Click and drag on the map to draw a zone (don\'t just click).');
      return;
    }

    this.clearDrawTempRectangle();

    this.previewRectangle = new google.maps.Rectangle({
      bounds,
      fillOpacity: 0.15,
      fillColor: '#ff0000',
      strokeWeight: 2,
      strokeColor: '#ff0000',
      map: this.map,
      clickable: false,
    });

    const center = bounds.getCenter();
    this.pendingZoneName = this.sanitizeZoneNameInput(
      this.searchInput.nativeElement.value
    );

    this.previewZone = {
      zoneName: this.pendingZoneName,
      center: { lat: center.lat(), lng: center.lng() },
      bounds: { northeast: nePlain, southwest: swPlain },
      isActive: true,
    };

    this.overlapWarning = this.checkOverlappingZones(this.previewZone.bounds);

    this.stopDrawMode();
    this.markPreviewChanged();
  }

  private boundsFromLatLngPair(
    a: google.maps.LatLng,
    b: google.maps.LatLng
  ): google.maps.LatLngBounds {
    return new google.maps.LatLngBounds(
      { lat: Math.min(a.lat(), b.lat()), lng: Math.min(a.lng(), b.lng()) },
      { lat: Math.max(a.lat(), b.lat()), lng: Math.max(a.lng(), b.lng()) }
    );
  }

  private clearDrawTempRectangle(): void {
    if (this.drawTempRectangle) {
      this.drawTempRectangle.setMap(null);
      this.drawTempRectangle = null;
    }
  }

  // ---------------- SAVE ----------------
 saveZone() {
  if (!this.previewZone) return;

  const name = this.pendingZoneName.trim();
  if (!name) {
    this.toastr.warning(
      'Enter a zone name using letters only (no numbers or special characters).'
    );
    return;
  }
  if (!/^[\p{L}\s]+$/u.test(name)) {
    this.toastr.warning(
      'Zone name can only contain letters and spaces.'
    );
    return;
  }

  this.previewZone.zoneName = name;

  // Recompute against the full zone list (avoids stale UI state or draw-before-load races).
  this.overlapWarning = this.checkOverlappingZones(this.previewZone.bounds);

  if (this.overlapWarning.length > 0) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        status: 'OverlapWarning',
        overlappingZones: this.overlapWarning,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.persistZone();
      }
    });
    return;
  }

  this.persistZone();
}

private persistZone() {
  this.loading = true;

  this.api.createZone(this.previewZone).subscribe({
    next: (res: any) => {
      this.loading = false;
      this.toastr.success(res?.message || 'Zone saved successfully');
      this.clearPreview();
      this.loadZones();
      this.searchInput.nativeElement.value = '';
      this.cdr.detectChanges();
    },
    error: (err: unknown) => {
      this.loading = false;
      const text = this.readApiErrorMessage(err, 'Failed to save zone');
      this.error = text;
      this.toastr.error(text);
    },
  });
}

  cancelPreview() {
    this.clearPreview();
  }

  clearPreview() {
    this.stopDrawMode();
    this.previewZone = null;
    this.pendingZoneName = '';
    this.overlapWarning = [];

    if (this.previewPolyline) {
      this.previewPolyline.setMap(null);
      this.previewPolyline = undefined;
    }

    if (this.previewRectangle) {
      this.previewRectangle.setMap(null);
      this.previewRectangle = undefined;
    }

    this.cdr.detectChanges();
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
loadZones(): void {
  const mergeBatch = (res: any): any[] => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const fetchPage = (offset: number, acc: any[]): void => {
    this.api
      .getZones(this.zoneApiPageSize, offset)
      .then((res: any) => {
        const batch = mergeBatch(res);
        const next = acc.concat(batch);
        if (batch.length < this.zoneApiPageSize) {
          this.applyLoadedZones(next);
        } else {
          fetchPage(offset + this.zoneApiPageSize, next);
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  fetchPage(0, []);
}

/** Apply full zone list from API (all pages merged) to state and map. */
private applyLoadedZones(all: any[]): void {
  this.ngZone.run(() => {
    this.allZones = all;
    this.totalCount = this.allZones.length;

    const start = this.offset * this.limit;
    const end = start + this.limit;
    this.zones = this.allZones.slice(start, end);

    this.drawSavedZones();
    this.mapDeliveryPartnersToZones();

    if (this.previewZone?.bounds) {
      this.overlapWarning = this.checkOverlappingZones(this.previewZone.bounds);
    }

    this.cdr.detectChanges();
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
    if (!this.map) return;

    this.savedPolylines.forEach(p => p.setMap(null));
    this.savedPolylines = [];

    for (const zone of this.zones) {
      const b = this.normalizeBounds(zone.bounds);
      if (!b) continue;

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

  const payload = { isActive: !zone.isActive };

  this.api.updateZone(zone._id, payload).subscribe({
    next: () => {
      zone.isActive = !zone.isActive;
      this.drawSavedZones();
    },
    error: (err: unknown) => {
      console.error('Failed to update zone', err);
      this.toastr.error(this.readApiErrorMessage(err, 'Failed to update zone'));
    },
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


