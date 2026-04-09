import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateAdminComponent } from './create-update-admin.component';

describe('CreateUpdateAdminComponent', () => {
  let component: CreateUpdateAdminComponent;
  let fixture: ComponentFixture<CreateUpdateAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
