import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsupdateComponent } from './termsupdate.component';

describe('TermsupdateComponent', () => {
  let component: TermsupdateComponent;
  let fixture: ComponentFixture<TermsupdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsupdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
