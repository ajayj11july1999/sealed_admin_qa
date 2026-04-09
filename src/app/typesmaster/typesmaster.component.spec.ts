import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesmasterComponent } from './typesmaster.component';

describe('TypesmasterComponent', () => {
  let component: TypesmasterComponent;
  let fixture: ComponentFixture<TypesmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypesmasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
