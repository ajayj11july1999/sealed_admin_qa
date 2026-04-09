import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bCustomersComponent } from './b2b-customers.component';

describe('B2bCustomersComponent', () => {
  let component: B2bCustomersComponent;
  let fixture: ComponentFixture<B2bCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bCustomersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
