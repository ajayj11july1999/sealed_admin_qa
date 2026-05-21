import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss']
})
export class VehicleComponent implements OnInit {

  readonly maxVehicleNameLength = 25;
  readonly maxBasePrice = 9999;
  readonly maxNumericLimit = 99999;

  vehicleList: any[] = [];
  totalCount = 0;
  limit = 10;
  offset = 0;
  value = '';

  modalRef!: BsModalRef;
  isedit = false;

  form: any = {
    name: '',
    basePrice: '',
    perkm: '',
    basekm: '',
    status: 'active',
    _id: null,
    weightWarning: '',
    lengthWarning: '',
    imageUrl: '' 
  };

  constructor(
    private modalService: BsModalService,
    private api: ApiServiceService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getVehicleList();
  }

  getVehicleList() {
    this.api.getVehicleList(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code === 200) {
          this.vehicleList = res.data?.data || [];
          this.totalCount = res.data?.totalCount || 0;
        } else {
          this.vehicleList = [];
          this.totalCount = 0;
        }
      });
  }


  searchVehicle(event: any) {
    const sanitized = (event.target.value || '').replace(/[^a-zA-Z\s]/g, '');
    event.target.value = sanitized;
    this.value = sanitized;
    this.offset = 0;
    this.getVehicleList();
  }

  allowSearchInput(event: KeyboardEvent) {
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (controlKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    if (!/^[a-zA-Z\s]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onSearchPaste(event: ClipboardEvent) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') || '';
    const sanitized = pasted.replace(/[^a-zA-Z\s]/g, '');
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    input.value = input.value.slice(0, start) + sanitized + input.value.slice(end);
    input.dispatchEvent(new Event('input'));
  }

  pageChange(e: any) {
    this.limit = e.pageSize;
    this.offset = e.pageIndex;
    this.getVehicleList();
  }

  AddModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg',
      backdrop: 'static',
      ignoreBackdropClick: true
    });
  }
  uploadFile(file: any, base64: any) {

  const formData = new FormData();
  formData.append('file', file);

  this.api.WithoutUploadFile(formData).subscribe(
    (res: any) => {

      console.log("UPLOAD RESPONSE:", res);

      // ✅ store image
      this.form.imageUrl = res?.data?.Location;

      this.toastr.success("Image uploaded successfully");

    },
    (err) => {
      this.toastr.error("Upload failed");
    }
  );
}
async onChange(files: any) {

  if (files && files.length > 0) {
    const file = files[0];

    let ext =
      file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (
      ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'].includes(ext)
    ) {

      if (file.size <= 2097152) {

        const reader = new FileReader();

        reader.onload = () => {
          const base64: any = reader.result;
          const splitted = base64.split(',');

          this.uploadFile(file, splitted[1]);
        };

        reader.readAsDataURL(file);

      } else {
        this.toastr.error('Please upload file less than 2MB');
      }

    } else {
      this.toastr.error('Invalid file format');
    }
  }
}


removeImage() {
  this.form.imageUrl = '';
}
  editVehicle(v: any) {
    this.isedit = true;
    this.form = { ...v };
    this.normalizeFormFields();
  }

  saveVehicle() {

    const name = (this.form.name || '').trim();
    if (!name) {
      this.toastr.warning("Please enter a vehicle name");
      return;
    }

    if (name.length > this.maxVehicleNameLength) {
      this.toastr.warning(`Vehicle name must not exceed ${this.maxVehicleNameLength} characters`);
      return;
    }

    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(name)) {
      this.toastr.warning("Vehicle name must contain only letters and spaces");
      return;
    }

    if (!this.isValidAmount(this.form.basePrice, this.maxBasePrice)) {
      this.toastr.warning(`Base Price must be a valid number between 0 and ${this.maxBasePrice}`);
      return;
    }

    if (!this.isValidAmount(this.form.perkm, this.maxNumericLimit)) {
      this.toastr.warning(`Per KM Price must be a valid number between 0 and ${this.maxNumericLimit}`);
      return;
    }

    if (!this.isValidWholeNumber(this.form.basekm, this.maxNumericLimit)) {
      this.toastr.warning(`Base KM must be a valid number between 0 and ${this.maxNumericLimit}`);
      return;
    }

    if (!this.isEmptyValue(this.form.weightWarning)) {
      if (!this.isValidWholeNumber(this.form.weightWarning, this.maxNumericLimit)) {
        this.toastr.warning(`Weight Limit must be a valid number between 0 and ${this.maxNumericLimit}`);
        return;
      }
    }

    if (!this.isEmptyValue(this.form.lengthWarning)) {
      if (!this.isValidWholeNumber(this.form.lengthWarning, this.maxNumericLimit)) {
        this.toastr.warning(`Length Limit must be a valid number between 0 and ${this.maxNumericLimit}`);
        return;
      }
    }

    this.form.name = name;
    this.form.basePrice = Number(this.form.basePrice);
    this.form.perkm = Number(this.form.perkm);
    this.form.basekm = Number(this.form.basekm);
    this.form.weightWarning = this.isEmptyValue(this.form.weightWarning)
      ? null
      : Number(this.form.weightWarning);
    this.form.lengthWarning = this.isEmptyValue(this.form.lengthWarning)
      ? null
      : Number(this.form.lengthWarning);

    let req = this.api.saveVehicle(this.form, this.form._id);

    req.subscribe((res: any) => {
      if (res.code === 200) {
        this.toastr.success(res.message);
        this.modalRef.hide();
        this.clear();
        this.getVehicleList();
      } else {
        this.toastr.error(res.message);
      }
    });
  }

  deleteVehicle(v: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.deleteVehicle(v._id)
          .subscribe((res: any) => {
            if (res.code === 200) {
              this.toastr.success(res.message);
              this.getVehicleList();
            }
          });
      }
    });
  }

  clear() {
    this.isedit = false;
    this.form = {
      name: '',
      basePrice: '',
      perkm: '',
      basekm: '',
      status: 'active',
      weightWarning: '',
      lengthWarning: '',
      _id: null,
      imageUrl: ''
    };
  }

  cancel() {
    this.modalRef.hide();
    this.clear();
  }

  normalizeFormFields() {
    this.sanitizeAmountField('basePrice');
    this.sanitizeAmountField('perkm');
    this.sanitizeWholeNumberField('basekm');
    this.form.weightWarning = this.isEmptyValue(this.form.weightWarning)
      ? ''
      : this.sanitizeIntegerValue(this.form.weightWarning);
    this.form.lengthWarning = this.isEmptyValue(this.form.lengthWarning)
      ? ''
      : this.sanitizeIntegerValue(this.form.lengthWarning);
  }

  sanitizeAmountField(field: 'basePrice' | 'perkm') {
    const maxWholeDigits = field === 'basePrice' ? 6 : 5;
    this.form[field] = this.sanitizeDecimalValue(this.form[field], maxWholeDigits, 2);
  }

  sanitizeWholeNumberField(field: 'basekm' | 'weightWarning' | 'lengthWarning') {
    this.form[field] = this.sanitizeIntegerValue(this.form[field]);
  }

  blockInvalidAmountKeys(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  private sanitizeDecimalValue(value: any, maxWholeDigits: number, decimalPlaces: number) {
    const textValue = String(value || '');
    const firstDotIndex = textValue.indexOf('.');
    const withoutInvalidChars = textValue.replace(/[^0-9.]/g, '');
    const wholePart = withoutInvalidChars.split('.')[0].slice(0, maxWholeDigits);

    if (firstDotIndex === -1) {
      return wholePart;
    }

    const decimalPart = withoutInvalidChars
      .slice(withoutInvalidChars.indexOf('.') + 1)
      .replace(/\./g, '')
      .slice(0, decimalPlaces);

    return `${wholePart}.${decimalPart}`;
  }

  private sanitizeIntegerValue(value: any) {
    return String(value || '').replace(/\D/g, '');
  }

  private isValidAmount(value: any, max: number) {
    if (this.isEmptyValue(value)) {
      return false;
    }

    const textValue = String(value).trim();
    const amountPattern = /^\d+(\.\d{1,2})?$/;
    const numericValue = Number(textValue);

    return amountPattern.test(textValue) && numericValue >= 0 && numericValue <= max;
  }

  private isValidWholeNumber(value: any, max: number) {
    if (this.isEmptyValue(value)) {
      return false;
    }

    const textValue = String(value).trim();
    const wholeNumberPattern = /^\d+$/;
    const numericValue = Number(textValue);

    return wholeNumberPattern.test(textValue) && numericValue >= 0 && numericValue <= max;
  }

  private isEmptyValue(value: any) {
    return value === null || value === undefined || value === '';
  }

}
