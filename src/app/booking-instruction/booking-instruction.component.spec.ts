import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingInstructionComponent } from './booking-instruction.component';

describe('BookingInstructionComponent', () => {
  let component: BookingInstructionComponent;
  let fixture: ComponentFixture<BookingInstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingInstructionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
