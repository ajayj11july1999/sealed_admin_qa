import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierWageAmountComponent } from './courier-wage-amount.component';

describe('CourierWageAmountComponent', () => {
  let component: CourierWageAmountComponent;
  let fixture: ComponentFixture<CourierWageAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierWageAmountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierWageAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
