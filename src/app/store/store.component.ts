import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ApiServiceService } from '../service/api-service.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

declare var google: any;

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {

  databaseList: any[] = [];
  totalCount = 0;
  limit = 10;
  offset = 0;
  value = '';
  modalRef!: BsModalRef;

  isedit = false;
  selectedPlaceName = "";

  map: any;
  autocomplete: any;
  marker: any;

  createForm: any = {
    storeName: "",
    fullAddress: "",
    latitude: null,
    longitude: null,
    baseCost: 0,
    colorPrice: 5,
    blackPrice: 2,
    contactPerson: "",
    contactPersonNumber: "",
    password: "",
    type: "printOnGo",
    location: { type: "Point", coordinates: [] },
    _id: null
  };

  constructor(
    private modalService: BsModalService,
    private toastr: ToastrService,
    private apiservice: ApiServiceService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getStoreList();
  }

  //📌 LOAD TABLE LIST
  getStoreList() {
    this.apiservice.getStoreList(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.databaseList = res.data.data;
          this.totalCount = res.data.totalCount;
        }
      });
  }

  searchUserList(e: any) {
    this.value = e.target.value;
    this.offset = 0;
    this.getStoreList();
  }

  pageChange(e: any) {
    this.limit = e.pageSize;
    this.offset = e.pageIndex;
    this.getStoreList();
  }

  //📌 OPEN ADD / EDIT MODAL
  // AddModal(template: TemplateRef<any>) {
  //   this.modalRef = this.modalService.show(template, {
  //     backdrop: 'static',
  //     class: 'modal-xl',
  //     ignoreBackdropClick: true
  //   });

  //   // Load map AFTER modal is visible
  //   setTimeout(() => {
  //     this.initializeMap();
  //   }, 300);
  // }

  AddModal(template: TemplateRef<any>) {
  this.modalRef = this.modalService.show(template, {
    backdrop: 'static',
    class: 'modal-xl',
    ignoreBackdropClick: true
  });

  setTimeout(() => {
    this.initializeMap();
  }, 500);  // increase delay to ensure DOM is ready
}


  //📌 EDIT STORE
  editTerms(item: any) {
    this.isedit = true;

    this.createForm = {
      ...item,
      password: '',
      location: item.location || {
        type: "Point",
        coordinates: [item.longitude, item.latitude]
      }
    };
  }
   updatePosition(lat: number, lng: number) {
  this.createForm.latitude = lat;
  this.createForm.longitude = lng;
  this.createForm.location.coordinates = [lng, lat];

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
    if (status === "OK" && results[0]) {
      this.createForm.fullAddress = results[0].formatted_address;
      this.selectedPlaceName = results[0].formatted_address;
    }
  });
}

initializeMap() {

  const defaultLat = 13.0827;
  const defaultLng = 80.2707;

  const mapDiv = document.getElementById("map") as HTMLElement;
  if (!mapDiv) {
    console.error("❌ Map div not found");
    return;
  }

  // -----------------------------
  // INIT MAP
  // -----------------------------
  this.map = new google.maps.Map(mapDiv, {
    center: { lat: defaultLat, lng: defaultLng },
    zoom: 13
  });

  // Marker
  this.marker = new google.maps.Marker({
    map: this.map,
    position: { lat: defaultLat, lng: defaultLng },
    draggable: true
  });

  // Marker drag
  google.maps.event.addListener(this.marker, "dragend", (event: any) => {
    this.updatePosition(event.latLng.lat(), event.latLng.lng());
  });

  // Click on map
  google.maps.event.addListener(this.map, "click", (event: any) => {
    this.marker.setPosition(event.latLng);
    this.updatePosition(event.latLng.lat(), event.latLng.lng());
  });

  // ---------------------------------------------------
  // WAIT UNTIL MAP IS FULLY LOADED (IMPORTANT FOR MODAL)
  // ---------------------------------------------------
  google.maps.event.addListenerOnce(this.map, "idle", () => {

    console.log("🟢 Map loaded — initializing Autocomplete");

    const input = document.getElementById("searchInput") as HTMLInputElement;

    if (!input) {
      console.error("❌ searchInput not found");
      return;
    }

    // -----------------------------
    // CREATE AUTOCOMPLETE (FIRST)
    // -----------------------------
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "in" },
      fields: ["geometry", "formatted_address", "name"]
    });

    // Restrict to Chennai (optional)
    const chennaiBounds = {
      north: 13.2500,
      south: 12.9000,
      east: 80.3200,
      west: 80.0500
    };
    this.autocomplete.setBounds(chennaiBounds);

    // -----------------------------------------
    // SINGLE SAFE EVENT LISTENER (NO DUPLICATES)
    // -----------------------------------------
    this.autocomplete.addListener("place_changed", () => {
      console.log("🔥 PLACE_CHANGED Fired");

      const place = this.autocomplete.getPlace();
      console.log("📍 PLACE DATA:", place);

      // User typed but did NOT select
      if (!place || Object.keys(place).length === 0) {
        console.warn("⚠ Empty place object. User did not choose from dropdown.");
        return;
      }

      // Google sometimes fires without geometry (2025 update)
      if (!place.geometry || !place.geometry.location) {
        console.warn("⚠ Place has no geometry. Ignoring...");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Update marker + map
      this.marker.setPosition({ lat, lng });
      this.map.setCenter({ lat, lng });
      this.updatePosition(lat, lng);

      // Update UI text
      this.selectedPlaceName = place.formatted_address || place.name;
    });

    // Debug log
    console.log("Google:", google.maps);
    console.log("Input:", input);
  });
}



  //📌 SAVE STORE
 saveStore() {
  if (!this.createForm.storeName ||
      !this.createForm.fullAddress ||
      !this.createForm.latitude ||
      !this.createForm.longitude) {
    this.toastr.warning("Please fill all required fields");
    return;
  }

  this.createForm.location = {
    type: "Point",
    coordinates: [this.createForm.longitude, this.createForm.latitude]
  };

  const payload = { ...this.createForm };
  if (!payload.password) {
    delete payload.password;
  }

  const req = this.apiservice.createStore(
    payload,
    this.createForm._id ? this.createForm._id : null
  );

  req.subscribe((res: any) => {
    if (res.code == 200) {
      this.toastr.success(res.message);
      this.modalRef.hide();
      this.clear();
      this.getStoreList();
    } else {
      this.toastr.error(res.message);
    }
  });
}

  //📌 CLEAR FORM
  clear() {
    this.isedit = false;
    this.createForm = {
      storeName: '',
      fullAddress: '',
      latitude: null,
      longitude: null,
      baseCost: 0,
      colorPrice: 5,
      blackPrice: 2,
      contactPerson: '',
      contactPersonNumber: '',
      password: '',
      type: 'printOnGo',
      location: { type: "Point", coordinates: [] },
      _id: null
    };
  }

  //📌 DELETE STORE
  deleteStore(item: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiservice.deleteStore(item._id).subscribe((res: any) => {
          if (res.code == 200) {
            this.toastr.success(res.message);
            this.getStoreList();
          } else {
            this.toastr.error(res.message);
          }
        });
      }
    });
  }

  cancel() {
    this.modalRef.hide();
  }

}
