import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierGeneratePayoutComponent } from './courier-generate-payout.component';

describe('CourierGeneratePayoutComponent', () => {
  let component: CourierGeneratePayoutComponent;
  let fixture: ComponentFixture<CourierGeneratePayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierGeneratePayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierGeneratePayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
