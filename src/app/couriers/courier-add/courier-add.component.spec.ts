import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierAddComponent } from './courier-add.component';

describe('CourierAddComponent', () => {
  let component: CourierAddComponent;
  let fixture: ComponentFixture<CourierAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourierAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourierAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
