import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZoneComponent } from './zone.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { ZoneService  } from '../service/zone-service';
describe('ZoneComponent', () => {
  let component: ZoneComponent;
  let fixture: ComponentFixture<ZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZoneComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [ZoneService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load zones on init', () => {
    spyOn(component, 'loadZones');
    component.ngOnInit();
    expect(component.loadZones).toHaveBeenCalled();
  });
});
