import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileAppTripsComponent } from './mobile-app-trips.component';

describe('MobileAppTripsComponent', () => {
  let component: MobileAppTripsComponent;
  let fixture: ComponentFixture<MobileAppTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileAppTripsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileAppTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
