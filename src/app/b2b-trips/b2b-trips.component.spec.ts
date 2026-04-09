import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bTripsComponent } from './b2b-trips.component';

describe('B2bTripsComponent', () => {
  let component: B2bTripsComponent;
  let fixture: ComponentFixture<B2bTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bTripsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
