import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPriceMasterComponent } from './document-price-master.component';

describe('DocumentPriceMasterComponent', () => {
  let component: DocumentPriceMasterComponent;
  let fixture: ComponentFixture<DocumentPriceMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentPriceMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPriceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
