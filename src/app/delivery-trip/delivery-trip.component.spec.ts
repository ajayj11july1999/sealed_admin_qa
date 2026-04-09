import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryTripComponent } from './delivery-trip.component';

describe('DeliveryTripComponent', () => {
  let component: DeliveryTripComponent;
  let fixture: ComponentFixture<DeliveryTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryTripComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
