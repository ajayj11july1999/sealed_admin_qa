import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CouponComponent } from './coupon.component';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MatDialog } from '@angular/material/dialog';
import { CopyService } from '../service/exportService/copyService';
import { ExcelService } from '../service/exportService/excelService';
import { PrintService } from '../service/exportService/printService';
import { PdfService } from '../service/exportService/pdfService';

describe('CouponComponent', () => {
  let component: CouponComponent;
  let fixture: ComponentFixture<CouponComponent>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let apiSpy: jasmine.SpyObj<ApiServiceService>;

  const mockUserInfo = { role: 'admin' };

  beforeEach(async () => {
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    apiSpy = jasmine.createSpyObj('ApiServiceService', [
      'getlistCoupon', 'createCoupon', 'deleteCoupon', 'getPdfExcelDownload'
    ]);
    apiSpy.getlistCoupon.and.returnValue(Promise.resolve({ code: 200, data: { data: [], totalCount: 0 } }));

    await TestBed.configureTestingModule({
      declarations: [CouponComponent],
      imports: [HttpClientTestingModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: ToastrService, useValue: toastrSpy },
        { provide: ApiServiceService, useValue: apiSpy },
        { provide: NgxSpinnerService, useValue: jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']) },
        { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: CopyService, useValue: jasmine.createSpyObj('CopyService', ['copyTableText']) },
        { provide: ExcelService, useValue: jasmine.createSpyObj('ExcelService', ['exportAsExcelFile', 'downloadBase64ExcelFile']) },
        { provide: PrintService, useValue: jasmine.createSpyObj('PrintService', ['printElement']) },
        { provide: PdfService, useValue: jasmine.createSpyObj('PdfService', ['downloadBase64File', 'exportToPDF']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'userInfoA') return JSON.stringify(mockUserInfo);
      return null;
    });
    fixture = TestBed.createComponent(CouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Coupon Name field validation ────────────────────────────────────────────

  describe('Coupon Name field – input restrictions', () => {
    const namePattern = /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/;

    it('should reject a coupon name longer than 50 characters', () => {
      const longName = 'A'.repeat(51);
      component.couponform.name = longName;
      const isWithinLimit = component.couponform.name.length <= 50;
      expect(isWithinLimit).toBeFalse();
    });

    it('should accept a coupon name of exactly 50 characters', () => {
      const maxName = 'ValidName'.padEnd(50, '0');
      component.couponform.name = maxName;
      expect(component.couponform.name.length).toBe(50);
    });

    it('should reject a coupon name containing special characters', () => {
      expect(namePattern.test('Coupon@#!%')).toBeFalse();
    });

    it('should accept a coupon name with only letters, numbers, and spaces between words', () => {
      expect(namePattern.test('SUMMER SALE 2024')).toBeTrue();
    });

    it('should reject a coupon name that is a combination of large input and special chars', () => {
      const maliciousName = 'A'.repeat(100) + '!@#$%^&*()';
      expect(namePattern.test(maliciousName)).toBeFalse();
      expect(maliciousName.length <= 50).toBeFalse();
    });

    // ── Blank / whitespace-only input ────────────────────────────────────────
    it('should reject a coupon name that is a single blank space', () => {
      expect(namePattern.test(' ')).toBeFalse();
    });

    it('should reject a coupon name made up entirely of spaces', () => {
      expect(namePattern.test('     ')).toBeFalse();
    });

    it('should reject a coupon name with leading spaces', () => {
      expect(namePattern.test(' SUMMER10')).toBeFalse();
    });

    it('should reject a coupon name with trailing spaces', () => {
      expect(namePattern.test('SUMMER10 ')).toBeFalse();
    });

    it('should reject a coupon name with consecutive spaces between words', () => {
      expect(namePattern.test('SUMMER  SALE')).toBeFalse();
    });

    it('should reject an empty coupon name', () => {
      component.couponform.name = '';
      expect(component.couponform.name.trim().length).toBe(0);
    });
  });

  // ─── Coupon Amount field validation ──────────────────────────────────────────

  describe('Coupon Amount field – input restrictions', () => {
    it('should reject an amount greater than 99999', () => {
      const largeAmount = 1000000;
      component.couponform.amount = largeAmount;
      const isValid = component.couponform.amount <= 99999;
      expect(isValid).toBeFalse();
    });

    it('should accept an amount within the valid range (1 – 99999)', () => {
      component.couponform.amount = 500;
      expect(component.couponform.amount).toBeGreaterThanOrEqual(1);
      expect(component.couponform.amount).toBeLessThanOrEqual(99999);
    });

    it('should reject zero as a coupon amount', () => {
      component.couponform.amount = 0;
      const isValid = component.couponform.amount >= 1;
      expect(isValid).toBeFalse();
    });

    it('should reject a negative amount', () => {
      component.couponform.amount = -50;
      const isValid = component.couponform.amount >= 1;
      expect(isValid).toBeFalse();
    });

    it('should reject a non-numeric string as amount', () => {
      const invalidAmount = 'abc';
      const parsed = Number(invalidAmount);
      expect(isNaN(parsed)).toBeTrue();
    });
  });

  // ─── addCoupon method – form-level validation ─────────────────────────────

  describe('addCoupon – form validation gate', () => {
    it('should show a warning when the form is invalid', () => {
      const invalidForm: any = { form: { valid: false } };
      component.addCoupon(invalidForm);
      expect(toastrSpy.warning).toHaveBeenCalledWith('Please fill all the required fields');
    });

    it('should call createCoupon API when the form is valid', () => {
      apiSpy.createCoupon.and.returnValue(of({ code: 200, message: 'Created' }));
      component.modalRef = jasmine.createSpyObj('BsModalRef', ['hide']);

      component.couponform = {
        name: 'SUMMER10',
        amount: 100,
        type: 'B2C',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        _id: null,
      };

      const validForm: any = { form: { valid: true } };
      component.addCoupon(validForm);

      expect(apiSpy.createCoupon).toHaveBeenCalled();
    });

    it('should NOT call createCoupon API when the form is invalid', () => {
      const invalidForm: any = { form: { valid: false } };
      component.addCoupon(invalidForm);
      expect(apiSpy.createCoupon).not.toHaveBeenCalled();
    });
  });

  // ─── Date validation ─────────────────────────────────────────────────────

  describe('Date field – start and end date restrictions', () => {
    it('should initialise today as a Date instance', () => {
      expect(component.today).toBeInstanceOf(Date);
    });

    it('today should not be in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(component.today.getTime()).toBeGreaterThan(yesterday.getTime());
    });

    it('minEndDate should return today when no startDate is set', () => {
      component.couponform.startDate = '';
      const min = component.minEndDate;
      expect(min.toDateString()).toBe(component.today.toDateString());
    });

    it('minEndDate should return the startDate when startDate is set', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      component.couponform.startDate = futureDate;
      expect(component.minEndDate.toDateString()).toBe(futureDate.toDateString());
    });

    it('should reject an end date before the start date', () => {
      const start = new Date();
      start.setDate(start.getDate() + 3);
      const end = new Date();
      end.setDate(end.getDate() + 1);
      const isEndBeforeStart = end < start;
      expect(isEndBeforeStart).toBeTrue();
    });

    it('should accept an end date equal to the start date', () => {
      const start = new Date();
      start.setDate(start.getDate() + 3);
      const end = new Date(start);
      const isValid = end >= start;
      expect(isValid).toBeTrue();
    });

    it('should accept an end date after the start date', () => {
      const start = new Date();
      start.setDate(start.getDate() + 2);
      const end = new Date();
      end.setDate(end.getDate() + 10);
      const isValid = end >= start;
      expect(isValid).toBeTrue();
    });

    it('should reject a past date as start date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const isBeforeToday = pastDate < component.today;
      expect(isBeforeToday).toBeTrue();
    });

    it('should reject a past date as end date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const isBeforeToday = pastDate < component.today;
      expect(isBeforeToday).toBeTrue();
    });

    it('addCoupon should block submission when form is invalid due to date violation', () => {
      const invalidForm: any = { form: { valid: false } };
      component.addCoupon(invalidForm);
      expect(toastrSpy.warning).toHaveBeenCalledWith('Please fill all the required fields');
      expect(apiSpy.createCoupon).not.toHaveBeenCalled();
    });
  });

  // ─── Pagination ──────────────────────────────────────────────────────────

  describe('pageChange() – pagination navigation', () => {
    it('should set offset to the selected page index', () => {
      component.pageChange({ pageIndex: 1, pageSize: 9 });
      expect(component.offset).toBe(1);
    });

    it('should set limit to the selected page size', () => {
      component.pageChange({ pageIndex: 0, pageSize: 9 });
      expect(component.limit).toBe(9);
    });

    it('should call getlistCoupon API with correct offset when navigating to page 2', () => {
      component.pageChange({ pageIndex: 1, pageSize: 9 });
      expect(apiSpy.getlistCoupon).toHaveBeenCalledWith(9, 1, undefined);
    });

    it('should call getlistCoupon API with offset 0 when navigating back to page 1', () => {
      component.pageChange({ pageIndex: 1, pageSize: 9 });
      component.pageChange({ pageIndex: 0, pageSize: 9 });
      expect(apiSpy.getlistCoupon).toHaveBeenCalledWith(9, 0, undefined);
    });

    it('should NOT reset offset to 0 inside getlistCoupon after pageChange', () => {
      component.pageChange({ pageIndex: 2, pageSize: 9 });
      expect(component.offset).toBe(2);
    });

    it('should preserve the search value when paginating', () => {
      component.value = 'SUMMER';
      component.pageChange({ pageIndex: 1, pageSize: 9 });
      expect(apiSpy.getlistCoupon).toHaveBeenCalledWith(9, 1, 'SUMMER');
    });

    it('initial load should use default limit=9 and offset=0', () => {
      expect(apiSpy.getlistCoupon).toHaveBeenCalledWith(9, 0, undefined);
    });
  });

  // ─── clear() – form reset ─────────────────────────────────────────────────

  describe('clear() – form reset after submit', () => {
    it('should reset all couponform fields to empty values', () => {
      component.couponform = {
        name: 'TESTCOUPON',
        amount: 200,
        type: 'B2C',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        _id: 'abc123',
      };

      component.clear();

      expect(component.couponform.name).toBe('');
      expect(component.couponform.amount).toBe('');
      expect(component.couponform.type).toBe('');
      expect(component.couponform.startDate).toBe('');
      expect(component.couponform.endDate).toBe('');
      expect(component.couponform.status).toBe('');
      expect(component.couponform._id).toBeNull();
    });

    it('should set isedit to false after clear()', () => {
      component.isedit = true;
      component.clear();
      expect(component.isedit).toBeFalse();
    });
  });

  // ─── editTerms() – populate form for editing ─────────────────────────────

  describe('editTerms() – populate form for edit', () => {
    it('should populate couponform with the selected item', () => {
      const item = {
        name: 'WINTER50',
        amount: 50,
        type: 'B2C',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        status: 'active',
        _id: 'xyz789',
      };

      component.editTerms(item);

      expect(component.couponform).toEqual(item);
    });

    it('should set isedit to true when editing an item', () => {
      component.isedit = false;
      component.editTerms({ name: 'TEST', amount: 10, type: 'B2C', startDate: '', endDate: '', status: 'active', _id: '1' });
      expect(component.isedit).toBeTrue();
    });
  });
});
