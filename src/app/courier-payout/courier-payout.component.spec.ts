import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierPayoutComponent } from './courier-payout.component';

describe('CourierPayoutComponent', () => {
  let component: CourierPayoutComponent;
  let fixture: ComponentFixture<CourierPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierPayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
