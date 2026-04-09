import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierPayoutViewComponent } from './courier-payout-view.component';

describe('CourierPayoutViewComponent', () => {
  let component: CourierPayoutViewComponent;
  let fixture: ComponentFixture<CourierPayoutViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierPayoutViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierPayoutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
