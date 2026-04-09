import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bAddComponent } from './b2b-add.component';

describe('B2bAddComponent', () => {
  let component: B2bAddComponent;
  let fixture: ComponentFixture<B2bAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
