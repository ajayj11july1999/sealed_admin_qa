import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ApiServiceService } from '../service/api-service.service';
import { CopyService } from '../service/exportService/copyService';
import { ExcelService } from '../service/exportService/excelService';
import { PrintService } from '../service/exportService/printService';
import { PdfService } from '../service/exportService/pdfService';

@Component({
  selector: 'app-extrachange',
  templateUrl: './extrachange.component.html',
  styleUrls: ['./extrachange.component.scss']
})
export class ExtrachangeComponent implements OnInit {

  @ViewChild('myPaginator') myPaginator: any;
  modalRef!: BsModalRef;

  offset = 0;
  limit = 7;
  totalCount = 0;

  deliveryChargeForm!: FormGroup;

  value = '';
  extracharge: any[] = [];

  extrachargeid: string | null = null;
  updataform = false;

  type: any;
  path: any;

  constructor(
    private fb: FormBuilder,
    private apiservice: ApiServiceService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    private copyService: CopyService,
    private excelService: ExcelService,
    private printService: PrintService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getextracharges();
  }

  /* ---------- FORM INIT ---------- */

  initForm() {
    this.deliveryChargeForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      deliveryCharge: ['', [Validators.required, Validators.min(0), Validators.max(300)]]
    });
  }

  get f() {
    return this.deliveryChargeForm.controls;
  }

  /* ---------- MODAL ---------- */

  AddModal(template: TemplateRef<any>) {
    const config: any = {
      backdrop: 'static', class: 'custm_modal gray modal-lg', keyboard: false, ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(template, Object.assign({}, config));
  }

  cancel() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  resetForm() {
    this.deliveryChargeForm.reset({
      name: '',
      deliveryCharge: ''
    });

    this.deliveryChargeForm.markAsPristine();
    this.deliveryChargeForm.markAsUntouched();

    this.extrachargeid = null;
    this.updataform = false;
  }

  /* ---------- ADD ---------- */

  openAdd() {
    this.resetForm();
  }

  add() {
    if (this.deliveryChargeForm.invalid) return;

    const payload = {
      name: this.deliveryChargeForm.value.name,
      extracharges: this.deliveryChargeForm.value.deliveryCharge
    };

    this.apiservice.addcharge(payload).subscribe(
      (res: any) => {
        if (res.code === 200 && res.status === true) {
          this.toastrService.success("Added Successfully");
          this.getextracharges();
          this.cancel();
          this.resetForm();
        } else {
          this.toastrService.error(res.message);
        }
      },
      () => {
        this.toastrService.error("Extracharge already exists");
      }
    );
  }

  /* ---------- EDIT ---------- */

  editcharge(item: any) {
    this.updataform = true;
    this.extrachargeid = item._id;

    this.deliveryChargeForm.patchValue({
      name: item.name,
      deliveryCharge: item.extracharges
    });
  }

  /* ---------- UPDATE ---------- */

  onSubmit() {
    if (this.deliveryChargeForm.invalid || !this.extrachargeid) return;

    const payload = {
      name: this.deliveryChargeForm.value.name,
      extracharges: this.deliveryChargeForm.value.deliveryCharge
    };

    this.apiservice.updatecharge(payload, this.extrachargeid).subscribe(
      (res: any) => {
        if (res.code === 200 && res.status === true) {
          this.toastrService.success("Updated Successfully");
          this.getextracharges();
          this.cancel();
          this.resetForm();
        } else {
          this.toastrService.error(res.message);
        }
      },
      () => {
        this.toastrService.error("Update failed");
      }
    );
  }

  /* ---------- FETCH DATA ---------- */

  getextracharges() {
    this.apiservice
      .getextraCharges(this.limit, this.offset, this.value)
      .then((res: any) => {
        if (res.code === 200) {
          this.extracharge = res.data?.data || [];
          this.totalCount = res.data?.totalCount || 0;
        }
      })
      .catch(() => {});
  }

  /* ---------- PAGINATION ---------- */

  pageChange(e: any) {
    this.offset = e.pageIndex * e.pageSize;
    this.getextracharges();
  }

  /* ---------- STATUS ---------- */

  updatestatus(event: MatSlideToggleChange, id: string) {
    const payload = {
      status: event.checked ? 'active' : 'inactive'
    };

    this.apiservice.updatecharge(payload, id).subscribe((res: any) => {
      if (res.code === 200 && res.status === true) {
        this.toastrService.success("Status Updated");
        this.getextracharges();
      }
    });
  }

  /* ---------- SEARCH ---------- */

  onsearch(e: any) {
    this.value = e.target.value;
    this.offset = 0;
    this.getextracharges();
  }

  /* ---------- EXPORT ---------- */

  exportAsXLSX(): void {
    this.path = 'extraChargeMaster';
    this.type = 'excel';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code === 200) {
        const name = 'extraChargeList' + '_' + Date.now();
        this.excelService.downloadBase64ExcelFile(res.data, name);
      }
    }).catch(() => {});
  }

  exportAsPdf(): void {
    this.path = 'extraChargeMaster';
    this.type = 'pdf';
    this.apiservice.getPdfExcelDownload(this.path, this.type).then((res: any) => {
      if (res.code === 200) {
        const name = 'extraChargeList' + '_' + Date.now();
        this.pdfService.downloadBase64File(res.data, name);
      }
    }).catch(() => {});
  }

  async printTable(): Promise<void> {
    const savedLimit = this.limit;
    this.limit = this.totalCount;
    this.offset = 0;
    await this.getextracharges();

    setTimeout(() => {
      const tableElement = document.querySelector('#table') as HTMLElement;
      if (tableElement) {
        this.printService.printElement(tableElement);
      }
      this.limit = savedLimit;
      this.offset = 0;
      this.getextracharges();
    }, 1000);
  }

  async copyTable(): Promise<void> {
    const savedLimit = this.limit;
    this.limit = this.totalCount;
    this.offset = 0;
    await this.getextracharges();

    setTimeout(async () => {
      await this.copyService.copyTableText('#table');
      this.limit = savedLimit;
      this.offset = 0;
      this.getextracharges();
    }, 1000);
  }
}
