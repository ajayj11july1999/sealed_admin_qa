import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
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

  readonly storeNameMinLength = 3;
  readonly storeNameMaxLength = 50;
  readonly contactPersonMinLength = 3;
  readonly contactPersonMaxLength = 100;
  readonly fullAddressMaxLength = 500;
  readonly amountMaxValue = 999999.99;
  private readonly textPattern = /^[a-zA-Z0-9\s]+$/;
  private readonly contactPersonPattern = /^[a-zA-Z\s]+$/;
  private readonly addressPattern = /^[a-zA-Z0-9\s,.\-#\/]+$/;
  private readonly amountPattern = /^[0-9]+(\.[0-9]{1,2})?$/;
  private readonly phonePattern = /^[6-9]\d{9}$/;
  private readonly controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

  databaseList: any[] = [];
  totalCount = 0;
  limit = 10;
  offset = 0;
  value = '';
  modalRef!: BsModalRef;

  isedit = false;
  submitted = false;
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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  strTrim(value: any): string {
    return String(value ?? '').trim();
  }

  hasLocation(): boolean {
    const lat = this.createForm.latitude;
    const lng = this.createForm.longitude;
    return lat != null && lat !== '' && lng != null && lng !== '';
  }

  isPasswordValid(): boolean {
    const isNew = !this.createForm._id;
    const password = this.strTrim(this.createForm.password);
    if (isNew && !password) {
      return false;
    }
    return !password || password.length >= 6;
  }

  showFormErrors(): boolean {
    return (
      this.submitted &&
      (!this.isValidStoreForm() || !this.isPasswordValid() || !this.hasLocation())
    );
  }

  ngOnInit(): void {
    this.getStoreList();
  }

  //📌 LOAD TABLE LIST
  getStoreList() {
    this.apiservice.getStoreList(this.limit, this.offset * this.limit, this.value)
      .then((res: any) => {
        if (res.code == 200) {
          this.databaseList = res.data.data;
          this.totalCount = res.data.totalCount;
        }
      });
  }

  isPhoneValid(): boolean {
    const phone = this.strTrim(this.createForm.contactPersonNumber);
    return !!phone && this.phonePattern.test(phone);
  }

  getNameError(
    value: any,
    minLength: number,
    maxLength: number,
    pattern: RegExp,
    fieldLabel: string
  ): string | null {
    const name = this.strTrim(value);
    if (!name) {
      return `${fieldLabel} is required.`;
    }
    if (name.length < minLength) {
      return `${fieldLabel} must be at least ${minLength} characters.`;
    }
    if (name.length > maxLength) {
      return `${fieldLabel} must not exceed ${maxLength} characters.`;
    }
    if (!pattern.test(name)) {
      return `${fieldLabel} allows only valid characters (no special characters).`;
    }
    return null;
  }

  getStoreNameError(): string | null {
    return this.getNameError(
      this.createForm.storeName,
      this.storeNameMinLength,
      this.storeNameMaxLength,
      this.textPattern,
      'Store Name'
    );
  }

  getContactPersonError(): string | null {
    return this.getNameError(
      this.createForm.contactPerson,
      this.contactPersonMinLength,
      this.contactPersonMaxLength,
      this.contactPersonPattern,
      'Contact Person'
    );
  }

  isStoreNameValid(): boolean {
    return this.getStoreNameError() === null;
  }

  isContactPersonValid(): boolean {
    return this.getContactPersonError() === null;
  }

  isFullAddressValid(): boolean {
    const address = this.strTrim(this.createForm.fullAddress);
    return !!address && this.addressPattern.test(address);
  }

  getAmountError(
    value: any,
    required: boolean,
    allowZero: boolean,
    fieldLabel: string
  ): string | null {
    const amount = this.strTrim(value);

    if (!amount) {
      return required ? `${fieldLabel} is required.` : null;
    }
    if (!this.amountPattern.test(amount)) {
      return `${fieldLabel}: enter a valid number only (e.g. 10 or 10.50).`;
    }

    const num = parseFloat(amount);
    if (isNaN(num)) {
      return `${fieldLabel}: enter a valid number only (e.g. 10 or 10.50).`;
    }
    if (!allowZero && num <= 0) {
      return `${fieldLabel} must be greater than 0.`;
    }
    if (allowZero && num < 0) {
      return `${fieldLabel} cannot be negative.`;
    }
    if (num > this.amountMaxValue) {
      return `${fieldLabel} must not exceed ${this.amountMaxValue}.`;
    }
    return null;
  }

  getBaseCostError(): string | null {
    return this.getAmountError(this.createForm.baseCost, false, true, 'Base Cost');
  }

  getColorPriceError(): string | null {
    return this.getAmountError(this.createForm.colorPrice, true, false, 'Color Print Price');
  }

  getBlackPriceError(): string | null {
    return this.getAmountError(this.createForm.blackPrice, true, false, 'Black Print Price');
  }

  isColorPriceValid(): boolean {
    return this.getColorPriceError() === null;
  }

  isBlackPriceValid(): boolean {
    return this.getBlackPriceError() === null;
  }

  isBaseCostValid(): boolean {
    return this.getBaseCostError() === null;
  }

  onNameInput(event: Event, field: 'storeName' | 'contactPerson'): void {
    const input = event.target as HTMLInputElement;
    const max =
      field === 'storeName' ? this.storeNameMaxLength : this.contactPersonMaxLength;
    const sanitized =
      field === 'storeName'
        ? this.sanitizeAlphanumeric(input.value, max)
        : this.sanitizeLettersSpace(input.value, max);
    this.createForm[field] = sanitized;
    input.value = sanitized;
  }

  preventSpecialChars(event: KeyboardEvent): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    if (!/^[a-zA-Z0-9 ]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  allowAlphanumericSpace(event: KeyboardEvent, maxLength: number): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (input.value.length >= maxLength) {
      event.preventDefault();
      return false;
    }
    if (!/^[a-zA-Z0-9\s]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  allowLettersSpace(event: KeyboardEvent, maxLength: number): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const input = event.target as HTMLInputElement;
    if (input.value.length >= maxLength) {
      event.preventDefault();
      return false;
    }
    if (!/^[a-zA-Z\s]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  allowAddressChars(event: KeyboardEvent, maxLength: number): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const input = event.target as HTMLTextAreaElement;
    if (input.value.length >= maxLength) {
      event.preventDefault();
      return false;
    }
    if (!/^[a-zA-Z0-9\s,.\-#\/]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  allowNumbersOnly(event: KeyboardEvent): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const char = event.key;
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(char)) {
      return true;
    }
    if (char === '.' && !input.value.includes('.')) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  allowPhoneOnly(event: KeyboardEvent): boolean {
    if (this.controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return true;
    }
    const input = event.target as HTMLInputElement;
    if (input.value.length >= 10) {
      event.preventDefault();
      return false;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  sanitizeAlphanumeric(value: any, maxLength: number): string {
    if (value == null) {
      return '';
    }
    return String(value).replace(/[^a-zA-Z0-9\s]/g, '').slice(0, maxLength);
  }

  sanitizeLettersSpace(value: any, maxLength: number): string {
    if (value == null) {
      return '';
    }
    return String(value).replace(/[^a-zA-Z\s]/g, '').slice(0, maxLength);
  }

  sanitizeAddress(value: any, maxLength: number): string {
    if (value == null) {
      return '';
    }
    return String(value).replace(/[^a-zA-Z0-9\s,.\-#\/]/g, '').slice(0, maxLength);
  }

  sanitizeAmount(value: any): string {
    if (value == null || value === '') {
      return '';
    }
    let str = String(value).replace(/[^0-9.]/g, '');
    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
      str = str.slice(0, dotIndex + 1) + str.slice(dotIndex + 1).replace(/\./g, '');
    }
    if (str.startsWith('.')) {
      str = `0${str}`;
    }
    const [intPart = '', decPart] = str.split('.');
    return decPart !== undefined ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
  }

  sanitizePhone(value: any): string {
    if (value == null) {
      return '';
    }
    return String(value).replace(/\D/g, '').slice(0, 10);
  }

  onAlphanumericPaste(
    event: ClipboardEvent,
    field: 'storeName',
    maxLength: number
  ): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/[^a-zA-Z0-9\s]/g, '');
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeAlphanumeric(merged, maxLength);
    this.createForm[field] = sanitized;
    input.value = sanitized;
  }

  onContactPersonPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/[^a-zA-Z\s]/g, '');
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeLettersSpace(merged, this.contactPersonMaxLength);
    this.createForm.contactPerson = sanitized;
    input.value = sanitized;
  }

  onAddressPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLTextAreaElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/[^a-zA-Z0-9\s,.\-#\/]/g, '');
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeAddress(merged, this.fullAddressMaxLength);
    this.createForm.fullAddress = sanitized;
    input.value = sanitized;
  }

  onAmountPaste(event: ClipboardEvent, field: 'baseCost' | 'colorPrice' | 'blackPrice'): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = event.clipboardData?.getData('text') ?? '';
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizeAmount(merged);
    this.createForm[field] = sanitized === '' ? (field === 'baseCost' ? 0 : '') : sanitized;
    input.value = sanitized;
  }

  onAmountInput(event: Event, field: 'baseCost' | 'colorPrice' | 'blackPrice'): void {
    const input = event.target as HTMLInputElement;
    const sanitized = this.sanitizeAmount(input.value);
    this.createForm[field] = sanitized === '' ? (field === 'baseCost' ? 0 : '') : sanitized;
    input.value = sanitized;
  }

  onPhonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    const merged = `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`;
    const sanitized = this.sanitizePhone(merged);
    this.createForm.contactPersonNumber = sanitized;
    input.value = sanitized;
  }

  sanitizeFormFields(): void {
    this.createForm.storeName = this.sanitizeAlphanumeric(this.createForm.storeName, this.storeNameMaxLength);
    this.createForm.contactPerson = this.sanitizeLettersSpace(
      this.createForm.contactPerson,
      this.contactPersonMaxLength
    );
    this.createForm.fullAddress = this.sanitizeAddress(this.createForm.fullAddress, this.fullAddressMaxLength);
    this.createForm.contactPersonNumber = this.sanitizePhone(this.createForm.contactPersonNumber);
    this.createForm.baseCost = this.sanitizeAmount(this.createForm.baseCost) || '0';
    this.createForm.colorPrice = this.sanitizeAmount(this.createForm.colorPrice);
    this.createForm.blackPrice = this.sanitizeAmount(this.createForm.blackPrice);
  }

  isValidStoreForm(): boolean {
    if (!this.isStoreNameValid()) {
      return false;
    }
    if (!this.isFullAddressValid()) {
      return false;
    }
    if (!this.isContactPersonValid()) {
      return false;
    }
    if (!this.isPhoneValid()) {
      return false;
    }
    if (!this.isBaseCostValid()) {
      return false;
    }
    if (!this.isColorPriceValid()) {
      return false;
    }
    if (!this.isBlackPriceValid()) {
      return false;
    }
    return true;
  }

  searchUserList(e: any) {
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
    e.target.value = sanitized;
    this.value = sanitized;
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
  this.submitted = false;
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
    this.submitted = false;

    this.createForm = {
      ...item,
      storeName: this.sanitizeAlphanumeric(item?.storeName, this.storeNameMaxLength),
      contactPerson: this.sanitizeLettersSpace(item?.contactPerson, this.contactPersonMaxLength),
      fullAddress: this.sanitizeAddress(item?.fullAddress, this.fullAddressMaxLength),
      contactPersonNumber: this.sanitizePhone(item?.contactPersonNumber),
      baseCost: this.sanitizeAmount(item?.baseCost) || '0',
      colorPrice: this.sanitizeAmount(item?.colorPrice),
      blackPrice: this.sanitizeAmount(item?.blackPrice),
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
      const address = this.sanitizeAddress(results[0].formatted_address, this.fullAddressMaxLength);
      this.createForm.fullAddress = address;
      this.selectedPlaceName = address;
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

    // Auto-set default coordinates for new stores so Save is never blocked by null lat/lng
    if (!this.createForm.latitude || !this.createForm.longitude) {
      this.updatePosition(defaultLat, defaultLng);
    }

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
  saveStore(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    this.submitted = true;
    this.sanitizeFormFields();
    this.cdr.detectChanges();

    const f = this.createForm;

    if (!this.isValidStoreForm() || !this.isPasswordValid() || !this.hasLocation()) {
      this.toastr.warning('Please fix the highlighted errors before saving');
      this.cdr.detectChanges();
      return;
    }

    this.createForm.location = {
      type: "Point",
      coordinates: [f.longitude, f.latitude]
    };

    const payload = { ...f };
    if (!this.strTrim(payload.password)) {
      delete payload.password;
    }

    this.apiservice.createStore(payload, f._id ? f._id : null).subscribe({
      next: (res: any) => {
        if (res.code == 200) {
          this.toastr.success(res.message);
          this.modalRef.hide();
          this.clear();
          this.getStoreList();
        } else {
          this.toastr.error(res.message);
        }
      },
      error: () => {
        this.toastr.error('Failed to save store. Please try again.');
      }
    });
  }

  //📌 CLEAR FORM
  clear() {
    this.isedit = false;
    this.submitted = false;
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
