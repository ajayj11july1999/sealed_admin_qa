import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierPayoutHistoryComponent } from './courier-payout-history.component';

describe('CourierPayoutHistoryComponent', () => {
  let component: CourierPayoutHistoryComponent;
  let fixture: ComponentFixture<CourierPayoutHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierPayoutHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierPayoutHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
