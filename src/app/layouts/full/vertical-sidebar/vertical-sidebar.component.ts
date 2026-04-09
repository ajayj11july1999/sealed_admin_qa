import {
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MediaMatcher } from '@angular/cdk/layout';


// import { MenuItems } from '../../../shared/menu-items/menu-items';

import { Router } from '@angular/router';
import { ApiServiceService } from 'src/app/service/api-service.service';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';
interface Action {
  name: string;
  check: boolean;
}
interface Page {
  page_name: string;
  name_type: string;
  action: Action[];
}
@Component({
  selector: 'app-vertical-sidebar',
  templateUrl: './vertical-sidebar.component.html',
  styleUrls: []
})

export class VerticalAppSidebarComponent implements OnDestroy {
  public config: PerfectScrollbarConfigInterface = {};
  mobileQuery: MediaQueryList;
  SUBMENUITEMS = [
    {
      state: 'Dashboard',
      name: 'Dashboard',
      type: 'link',
      icon: 'dashboard',
    },
    {
      state: 'search',
      name: 'Search',
      type: 'link',
      icon: 'search',
    },
    // {
    //   state: 'b2b-trips',
    //   name: 'S2B Trips',
    //   type: 'link',
    //   icon: 'supervised_user_circle',
    // },
    {
      state: 'mobile-app-trips',
      name: 'B2C Trips',
      type: 'link',
      icon: 'dashboard',
    },

    // {
    //   state: 'delivery_trip',
    //   name: 'Delivery Trip',
    //   type: 'link',
    //   icon: 'group',
    // },
    {
      state: 'stamp_document',
      name: 'Stamp Document',
      type: 'link',
      icon: 'local_post_office',
    },
    // {
    //   state: 'b2b-customers',
    //   name: 'S2B Customers',
    //   type: 'link',
    //   icon: 'supervisor_account',
    // },
    {
      state: 'customers',
      name: 'B2C Customers',
      type: 'link',
      icon: 'shield',
    },
    {
      state: 'couriers',
      name: 'Courier partners',
      type: 'sub',
      icon: 'group',
      children: [
        {
          state: 'master',
          name: 'Master ',
          type: 'link',
          icon: 'support',
        },
        {
          state: 'trip_amount',
          name: ' Wage Amount',
          type: 'link',
          icon: 'support',
        },
        // {
        //   state: 'payouts',
        //   name: ' PayOuts',
        //   type: 'link',
        //   icon: 'support',
        // },
      ]
    },
    {
      state: 'categories',
      name: 'Categories',
      type: 'sub',
      icon: 'location_on',
      children: [
        {
          state: 'mastercategory',
          name: 'Master',
          type: 'link',
          icon: 'support',
        },
        {
          state: 'typesmaster',
          name: 'Types Master',
          type: 'link',
          icon: 'support',
        }
      ]
    },
    {
      state: 'Coupon',
      name: 'Manage Coupon',
      type: 'link',
      icon: 'dashboard',
    },
    // {
    //   state: 'Pricings',
    //   name: 'Pricing Master',
    //   type: 'sub',
    //   icon: 'location_on',
    //   children: [
    //     {
    //       state: 'KM-price-Master',
    //       name: 'KM Price Master',
    //       type: 'link',
    //       icon: 'support',
    //     },
    //     {
    //       state: 'Document-price-Master',
    //       name: 'Document Price Master',
    //       type: 'link',
    //       icon: 'support',
    //     },
    //   ]
    // },
    {
      state: 'Stamps',
      name: 'Stamp',
      type: 'sub',
      icon: 'location_on',
      children: [
        {
          state: 'Master',
          name: 'Master Stamp',
          type: 'link',
          icon: 'support',
        },
        {
          state: 'Type-master',
          name: ' Type Master',
          type: 'link',
          icon: 'support',
        },
      ]
    },
   
    // {
    //   state: 'payout',
    //   name: 'COD/COP Status',
    //   type: 'link',
    //   icon: 'credit_card',
    // },

    // {
    //   state: 'add-subadmin',
    //   name: 'Sub Admin',
    //   type: 'link',
    //   icon: 'person',
    // },
    {
      state: 'settings',
      name: 'Setting',
      type: 'sub',
      icon: 'group',
      children: [
        {
          state: 'master',
          name: 'Banner Master',
          type: 'link',
          icon: 'support',
        },
        // {
        //   state: 'typesmaster',
        //   name: 'Banner Types ',
        //   type: 'link',
        //   icon: 'support',
        // },
        {
          state: 'booking_instruction',
          name: 'Booking Instruction',
          type: 'link',
          icon: 'support',
        },
        // {
        //   state: 'aboutus',
        //   name: 'About Us',
        //   type: 'link',
        //   icon: 'support',
        // },
        // {
        //   state: 'terms',
        //   name: 'Terms',
        //   type: 'link',
        //   icon: 'support',
        // }
      ]
    },
    // {
    //   state: 'demo-request',
    //   name: 'Demo Request',
    //   type: 'link',
    //   icon: 'phone_in_talk',
    // },
    {
      state: 'map',
      name: 'Map',
      type: 'link',
      icon: 'location_on',
    },
    {
      state: 'faq',
      name: 'FAQ',
      type: 'link',
      icon: 'location_on',
    },
    {
      state: 'reviews',
      name: 'Review & Rating',
      type: 'link',
      icon: 'location_on',
    },
    {
      state: 'terms',
      name: 'Terms',
      type: 'link',
      icon: 'location_on',
    },
      {
      state: 'store',
      name: 'Manage Store',
      type: 'link',
      icon: 'store',
    },
     {
      state: 'vehicle',
      name: 'Manage vehicle',
      type: 'link',
      icon: 'vehicle',
    },




    // {
    //   state: 'restaurant',
    //   name: 'Restaurant',
    //   type: 'link',
    //   icon: 'location_on',
    // }

  ];
  MENUITEMS = [
    {
      state: 'Dashboard',
      name: 'Dashboard',
      type: 'link',
      icon: 'dashboard',
    },
    {
      state: 'zones',
      name: 'zones',
      type: 'link',
      icon: 'location_on',
    },
    {
      state: 'search',
      name: 'Search',
      type: 'link',
      icon: 'search',
    },
    // {
    //   state: 'b2b-trips',
    //   name: ' S2B Trips',
    //   type: 'link',
    //   icon: 'supervised_user_circle',
    // },
    {
      state: 'mobile-app-trips',
      name: 'B2C Trips',
      type: 'link',
      icon: 'dashboard',
    },

    // {
    //   state: 'delivery_trip',
    //   name: 'Delivery Trip',
    //   type: 'link',
    //   icon: 'group',
    // },
    {
      state: 'stamp_document',
      name: 'Stamp Document',
      type: 'link',
      icon: 'local_post_office',
    },
    // {
    //   state: 'b2b-customers',
    //   name: 'S2B Customers',
    //   type: 'link',
    //   icon: 'supervisor_account',
    // },
    {
      state: 'customers',
      name: 'B2C Customers',
      type: 'link',
      icon: 'shield',
    },
      {
      state: 'flagged-consumers',
      name: 'Flagged Consumers',
      type: 'link',
      icon: 'warning',
    },
    {
      state: 'couriers',
      name: 'Courier partners',
      type: 'sub',
      icon: 'group',
      children: [
        {
          state: 'master',
          name: 'Master ',
          type: 'link',
          icon: 'support',
        },
        {
          state: 'trip_amount',
          name: ' Wage Amount',
          type: 'link',
          icon: 'support',
        },
        {
          state: 'payouts',
          name: ' PayOuts',
          type: 'link',
          icon: 'support',
        },
      ]
    },
    {
  state: 'extracharge',
  name: 'Extra Charge',
  type: 'link',
  icon: 'attach_money'
},
    // {
    //   state: 'categories',
    //   name: 'Categories',
    //   type: 'sub',
    //   icon: 'location_on',
    //   children: [
    //     {
    //       state: 'mastercategory',
    //       name: 'Master',
    //       type: 'link',
    //       icon: 'support',
    //     },
    //     {
    //       state: 'typesmaster',
    //       name: 'Types Master',
    //       type: 'link',
    //       icon: 'support',
    //     }
    //   ]
    // },
    {
      state: 'Coupon',
      name: 'Manage Coupon',
      type: 'link',
      icon: 'dashboard',
    },
    // {
    //   state: 'Pricings',
    //   name: 'Pricing Master',
    //   type: 'sub',
    //   icon: 'location_on',
    //   children: [
    //     {
    //       state: 'KM-price-Master',
    //       name: 'KM Price Master',
    //       type: 'link',
    //       icon: 'support',
    //     },
    //     {
    //       state: 'Document-price-Master',
    //       name: 'Document Price Master',
    //       type: 'link',
    //       icon: 'support',
    //     },
    //   ]
    // },
    {
      state: 'payment',
      name: 'Manage Refund Payment ',
      type: 'link',
      icon: 'dashboard',
    },
    {
      state: 'Stamps',
      name: 'Stamp',
      type: 'sub',
      icon: 'location_on',
      children: [
        {
          state: 'Master',
          name: 'Master Stamp',
          type: 'link',
          icon: 'support',
        },
        {
          state: 'Type-master',
          name: ' Type Master',
          type: 'link',
          icon: 'support',
        },
      ]
    },
    // {
    //   state: 'payout',
    //   name: 'COD/COP Status',
    //   type: 'link',
    //   icon: 'credit_card',
    // },

    // {
    //   state: 'add-subadmin',
    //   name: 'Sub Admin',
    //   type: 'link',
    //   icon: 'person',
    // },
    {
      state: 'settings',
      name: 'Setting',
      type: 'sub',
      icon: 'group',
      children: [
        {
          state: 'master',
          name: 'Banner Master',
          type: 'link',
          icon: 'support',
        },
        // {
        //   state: 'typesmaster',
        //   name: 'Banner Types ',
        //   type: 'link',
        //   icon: 'support',
        // },
        {
          state: 'booking_instruction',
          name: 'Booking Instruction',
          type: 'link',
          icon: 'support',
        },
        // {
        //   state: 'aboutus',
        //   name: 'About Us',
        //   type: 'link',
        //   icon: 'support',
        // },
        // {
        //   state: 'terms',
        //   name: 'Terms',
        //   type: 'link',
        //   icon: 'support',
        // }
      ]
    },
    // {
    //   state: 'demo-request',
    //   name: 'Demo Request',
    //   type: 'link',
    //   icon: 'phone_in_talk',
    // },
    // {
    //   state: 'map',
    //   name: 'Map',
    //   type: 'link',
    //   icon: 'location_on',
    // },
    {
      state: 'faq',
      name: 'FAQ',
      type: 'link',
      icon: 'location_on',
    },
     {
      state: 'reviews',
      name: 'Review & Rating',
      type: 'link',
      icon: 'reviews',
    },
    // {
    //   state: 'terms',
    //   name: 'Terms',
    //   type: 'link',
    //   icon: 'location_on',
    // },
  {
      state: 'store',
      name: 'Manage Store',
      type: 'link',
      icon: 'store',
    },

    {
      state: 'vehicle',
      name: 'Manage vehicle',
      type: 'link',
      icon: 'vehicle',
    },
    

    // {
    //   state: 'restaurant',
    //   name: 'Restaurant',
    //   type: 'link',
    //   icon: 'location_on',
    // }

  ];
  private _mobileQueryListener: () => void;
  status = true;

  itemSelect: number[] = [];
  parentIndex = 0;
  childIndex = 0;

  setClickedRow(i: number, j: number) {
    this.parentIndex = i;
    this.childIndex = j;
  }
  subclickEvent() {
    this.status = true;
  }
  selectedMenus: any;
  scrollToTop(menu: any) {
    this.selectedMenus = menu;
    document.querySelector('.page-wrapper')?.scroll({
      top: 0,
      left: 0
    });
  }
  userInfo: any;
  adminMenu: boolean = false;
  menutype: any = 'Not Admin';
  roles: any = [];
  menus;
  constructor(
    changeDetectorRef: ChangeDetectorRef,
    private apiService: ApiServiceService,
    media: MediaMatcher,
    private router: Router,
    // public menuItems: MenuItems,

  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);
    let userrole = this.userInfo?.role;



    this.menus = []
    if (userrole == 'subadmin') {
      this.menus = this.getMenuitem()
    } else {
      this.menus = this.MENUITEMS
    }
    console.log("menus", this.menus)
    // userrole.forEach((d,i)=>{
    //   this.roles.push(d.role_name);
    //   // if(d.role_name == 'Admin user' && d.id == 4){
    //   //   this.adminMenu = true;
    //   //   this.menutype = 'Admin';
    //   // }else if(d.role_name == 'User Manager' && d.id == 1){
    //   //   this.adminMenu = true;
    //   //   this.menutype = 'Usermanagement';
    //   // }
    // });

    if (this.roles.includes('Admin user')) {
      this.adminMenu = true;
      this.menutype = 'Admin';
    } else if (this.roles.includes('User Manager')) {
      this.adminMenu = true;
      this.menutype = 'Usermanagement';
    }


  }

  ngOnDestroy(): void {
    // tslint:disable-next-line: deprecation
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }


  logout() {
    // this.userServ.userLogout();
    // this.authServ.logOut().then(resp => {
    //   // console.log('FROM LOGOUT =>', resp);
    //   if (resp) {
    //     this.router.navigate(['login']);
    //   }
    // }).catch(err => {
    //   //console.log('FROM LOGOUT ERR =>', err);
    //   this.router.navigate(['login']);
    // });
  }

  getMenuitem() {
    let userrole = this.userInfo?.role;
    if (userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')
      console.log(this.SUBMENUITEMS, "aaa")
      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[]): Page[] =>
          pages.filter(page => page.action.some(action => action.name === "View" && action.check));
        let dataAcces = getTrueViewActions(pageDetails)

        var Submenyarray: any = []

        Submenyarray = this.SUBMENUITEMS
          .filter(aItem => dataAcces.some(b => b.page_name === aItem.name || (aItem.state === 'faq' && b.page_name === 'FAQ') || (aItem.state === 'reviews' && b.page_name === 'Review & Rating'))) // Filter only matching items
          .map(aItem => {
            const bItem = dataAcces.find(b => b.page_name === aItem.name || (aItem.state === 'faq' && b.page_name === 'FAQ') || (aItem.state === 'reviews' && b.page_name === 'Review & Rating'));
            return bItem ? { ...aItem, ...bItem } : aItem;
          });
        Submenyarray.unshift({
          state: 'Dashboard',
          name: 'Dashboard',
          type: 'link',
          icon: 'dashboard'
        });
        Submenyarray.push({
          state: 'payouts',
          name: ' PayOuts',
          type: 'link',
          icon: 'support',
        },);
        console.log("dataAcces", dataAcces)
        console.log("Submenyarray", Submenyarray)
        Submenyarray.map(e => {
          if (e.state == "categories") {
            console.log(e.action,)
            e.action.map(a => {
              if (a.name == "View Categories Type") {
                if (a.check == false) {
                  e.children = e.children.filter(item => item.state !== "typesmaster");
                }
              }
            });
          } else if (e.state == "Stamps") {
            console.log(e.action,)
            e.action.map(a => {
              if (a.name == "View Stamp Type") {
                if (a.check == false) {
                  e.children = e.children.filter(item => item.state !== "Type-master");
                }
              }
            });
          }
          else if (e.state == "couriers") {
            console.log(e.action,)
            e.action.map(a => {
              if (a.name == "View Trip Amount ") {
                if (a.check == false) {
                  e.children = e.children.filter(item => item.state !== "trip_amount");
                }
              }
            });
          }

        })
        return Submenyarray;
        var menudata = [{
          state: 'Dashboard',
          name: 'Dashboard',
          type: 'link',
          icon: 'dashboard'
        }]
        return menudata;
      } else {
        var menudata = [{
          state: 'Dashboard',
          name: 'Dashboard',
          type: 'link',
          icon: 'dashboard'
        }]
        return menudata;
      }

    }
  }
  usertype: any;
  orderStatus: any;
  value: any;
  Consumernewtrip: any;
  totalCount: any;

  // getListConsumerNewtrip() {

  //   this.usertype = 'consumer';
  //   this.orderStatus = 'new';
  //   this.value='';
  //   this.apiService
  //     .getconsumerActiveTrip(this.usertype, this.orderStatus, this.value)
  //     .then((res) => {

  //       this.Consumernewtrip = res?.data?.data ? res.data.data : [];
  //       this.totalCount = res?.data.totalCount;



  //     })
  //     .catch((err) => { });
  // }
  fetchOrderCountPeriodically() {

    // this.getListConsumerNewtrip();
    const interval = 10000; // 1 min
    setTimeout(() => {
      // this.getListConsumerNewtrip();
      this.fetchOrderCountPeriodically();
    }, interval);
  }
}