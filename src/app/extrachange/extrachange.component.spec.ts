import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ExtrachangeComponent } from './extrachange.component';
import { ApiServiceService } from '../service/api-service.service';
import { CopyService } from '../service/exportService/copyService';
import { ExcelService } from '../service/exportService/excelService';
import { PdfService } from '../service/exportService/pdfService';
import { PrintService } from '../service/exportService/printService';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

describe('ExtrachangeComponent', () => {
  let component: ExtrachangeComponent;
  let fixture: ComponentFixture<ExtrachangeComponent>;
  let apiSpy: jasmine.SpyObj<ApiServiceService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiServiceService', [
      'addcharge',
      'getextraCharges',
      'getPdfExcelDownload',
      'updatecharge'
    ]);
    apiSpy.addcharge.and.returnValue(of({ code: 200, status: true }));
    apiSpy.getextraCharges.and.returnValue(Promise.resolve({ code: 200, data: { data: [], totalCount: 0 } }));
    apiSpy.getPdfExcelDownload.and.returnValue(Promise.resolve({ code: 200, data: '' }));
    apiSpy.updatecharge.and.returnValue(of({ code: 200, status: true }));

    await TestBed.configureTestingModule({
      declarations: [ExtrachangeComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiServiceService, useValue: apiSpy },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['success', 'error']) },
        { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) },
        { provide: CopyService, useValue: jasmine.createSpyObj('CopyService', ['copyTableText']) },
        { provide: ExcelService, useValue: jasmine.createSpyObj('ExcelService', ['downloadBase64ExcelFile']) },
        { provide: PrintService, useValue: jasmine.createSpyObj('PrintService', ['printElement']) },
        { provide: PdfService, useValue: jasmine.createSpyObj('PdfService', ['downloadBase64File']) },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtrachangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('delivery charge validation', () => {
    it('should reject excessively large delivery charges', () => {
      const control = component.deliveryChargeForm.get('deliveryCharge');

      control?.setValue('999999');

      expect(control?.invalid).toBeTrue();
      expect(control?.errors?.max || control?.errors?.maxlength || control?.errors?.pattern).toBeTruthy();
    });

    it('should reject zero delivery charges', () => {
      const control = component.deliveryChargeForm.get('deliveryCharge');

      control?.setValue('0');

      expect(control?.invalid).toBeTrue();
      expect(control?.errors?.min).toBeTruthy();
    });

    it('should reject all-zero decimal delivery charges', () => {
      const control = component.deliveryChargeForm.get('deliveryCharge');

      control?.setValue('0.00');

      expect(control?.invalid).toBeTrue();
      expect(control?.errors?.min).toBeTruthy();
    });

    it('should accept a delivery charge greater than zero and below one', () => {
      const control = component.deliveryChargeForm.get('deliveryCharge');

      control?.setValue('0.50');

      expect(control?.valid).toBeTrue();
    });

    it('should accept a delivery charge within the valid range', () => {
      const control = component.deliveryChargeForm.get('deliveryCharge');

      control?.setValue('250.50');

      expect(control?.valid).toBeTrue();
    });

    it('should sanitize pasted delivery charge input', () => {
      const input = document.createElement('input');
      input.value = '12abc.345';

      component.sanitizeDeliveryChargeInput({ target: input } as unknown as Event);

      expect(input.value).toBe('12.34');
      expect(component.deliveryChargeForm.get('deliveryCharge')?.value).toBe('12.34');
    });
  });
});
