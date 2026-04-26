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

  vehicleList: any[] = [];
  totalCount = 0;
  limit = 10;
  offset = 0;
  value = '';

  modalRef!: BsModalRef;
  isedit = false;

  form: any = {
    name: '',
    basePrice: 0,
    perkm: 0,
    basekm: 0,
    status: 'active',
    _id: null,
    weightWarning: null as number | null,
    lengthWarning: null as number | null,
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
         
    console.log('API RESPONSE:', res);     // DEBUG
    console.log('VEHICLES:', res.data);    // DEBUG

    this.vehicleList = res.data; 

        // Vehicle API gives: data: []
        this.vehicleList = res.data;
        this.totalCount = res.data.length;
      }
    });
}


  searchVehicle(event: any) {
    this.value = event.target.value;
    this.offset = 0;
    this.getVehicleList();
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
  }

  saveVehicle() {

    const name = (this.form.name || '').trim();
    if (!name) {
      this.toastr.warning("Please enter a vehicle name");
      return;
    }

    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(name)) {
      this.toastr.warning("Vehicle name must contain only letters and spaces");
      return;
    }

    const basePrice = Number(this.form.basePrice);
    const perkm = Number(this.form.perkm);
    const basekm = Number(this.form.basekm);

    if (this.form.basePrice === null || this.form.basePrice === '' || isNaN(basePrice) || basePrice < 0 || basePrice > 999999) {
      this.toastr.warning("Base Price must be a valid number between 0 and 999999");
      return;
    }

    if (this.form.perkm === null || this.form.perkm === '' || isNaN(perkm) || perkm < 0 || perkm > 99999) {
      this.toastr.warning("Per KM Price must be a valid number between 0 and 99999");
      return;
    }

    if (this.form.basekm === null || this.form.basekm === '' || isNaN(basekm) || basekm < 0 || basekm > 99999) {
      this.toastr.warning("Base KM must be a valid number between 0 and 99999");
      return;
    }

    if (this.form.weightWarning !== null && this.form.weightWarning !== '') {
      const w = Number(this.form.weightWarning);
      if (isNaN(w) || w < 0 || w > 99999) {
        this.toastr.warning("Weight Limit must be a valid number between 0 and 99999");
        return;
      }
    }

    if (this.form.lengthWarning !== null && this.form.lengthWarning !== '') {
      const l = Number(this.form.lengthWarning);
      if (isNaN(l) || l < 0 || l > 99999) {
        this.toastr.warning("Length Limit must be a valid number between 0 and 99999");
        return;
      }
    }

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
      basePrice: 0,
      perkm: 0,
      basekm: 0,
      status: 'active',
      weightWarning: null as number | null,
      lengthWarning: null as number | null,
      _id: null
    };
  }

  cancel() {
    this.modalRef.hide();
  }

  allowOnlyAlphaSpace(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z\s]$/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  blockInvalidNumKeys(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

}
