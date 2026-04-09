import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodPopupComponent } from './food-popup.component';

describe('FoodPopupComponent', () => {
  let component: FoodPopupComponent;
  let fixture: ComponentFixture<FoodPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
