import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrachangeComponent } from './extrachange.component';

describe('ExtrachangeComponent', () => {
  let component: ExtrachangeComponent;
  let fixture: ComponentFixture<ExtrachangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtrachangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtrachangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
