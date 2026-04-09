import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KmPriceMasterComponent } from './km-price-master.component';

describe('KmPriceMasterComponent', () => {
  let component: KmPriceMasterComponent;
  let fixture: ComponentFixture<KmPriceMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KmPriceMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KmPriceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
