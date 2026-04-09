import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StampDocumentComponent } from './stamp-document.component';

describe('StampDocumentComponent', () => {
  let component: StampDocumentComponent;
  let fixture: ComponentFixture<StampDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StampDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StampDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
