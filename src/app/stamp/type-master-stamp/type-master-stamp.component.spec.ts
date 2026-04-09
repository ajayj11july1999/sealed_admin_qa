import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeMasterStampComponent } from './type-master-stamp.component';

describe('TypeMasterStampComponent', () => {
  let component: TypeMasterStampComponent;
  let fixture: ComponentFixture<TypeMasterStampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeMasterStampComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeMasterStampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
