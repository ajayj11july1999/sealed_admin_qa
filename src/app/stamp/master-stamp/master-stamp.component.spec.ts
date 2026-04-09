import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterStampComponent } from './master-stamp.component';

describe('MasterStampComponent', () => {
  let component: MasterStampComponent;
  let fixture: ComponentFixture<MasterStampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterStampComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterStampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
