import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewChild,
  HostListener,
  Directive,
  AfterViewInit
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { HorizontalMenuItems } from '../../../shared/menu-items/horizontal-menu-items';

@Component({
  selector: 'app-horizontal-sidebar',
  templateUrl: './horizontal-sidebar.component.html',
  styleUrls: []
})

export class HorizontalAppSidebarComponent implements OnDestroy {
  public config: PerfectScrollbarConfigInterface = {};
  mobileQuery: MediaQueryList;

  userInfo:any;
  adminMenu:boolean = false;
  menutype:any ='Not Admin';

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: HorizontalMenuItems
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 1024px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    let userrole = this.userInfo?.role;
    userrole.forEach((d,i)=>{
      if(d.role_name == 'Admin user' && d.id == 4){
        this.adminMenu = true;
        this.menutype = 'Admin';
      }
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
