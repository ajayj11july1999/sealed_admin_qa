import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierPayoutsComponent } from './courier-payouts.component';

describe('CourierPayoutsComponent', () => {
  let component: CourierPayoutsComponent;
  let fixture: ComponentFixture<CourierPayoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierPayoutsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierPayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
