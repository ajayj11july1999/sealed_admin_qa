import { Injectable } from '@angular/core';

export interface BadgeItem {
  type: string;
  value: string;
}
export interface Saperator {
  name: string;
  type?: string;
}
export interface SubChildren {
  state: string;
  name: string;
  type?: string;
}
export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  child?: SubChildren[];
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  saperator?: Saperator[];
  children?: ChildrenItems[];
}

const MENUITEMS = [
  {
    state: 'dashboard',
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
  {
    state: 'b2b-trips',
    name: ' S2B Trips',
    type: 'link',
    icon: 'supervised_user_circle',
  },
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
  {
    state: 'b2b-customers',
    name: 'S2B Customers',
    type: 'link',
    icon: 'supervisor_account',
  },
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
        name: 'Master Stamp',
        type: 'link',
        icon: 'support',
      },
      // {
      //   state: 'trip_amount',
      //   name: ' Wage Amount',
      //   type: 'link',
      //   icon: 'support',
      // },
      {
        state: 'payouts',
        name: ' PayOuts',
        type: 'link',
        icon: 'support',
      },
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
  {
    state: 'Pricings',
    name: 'Pricings',
    type: 'sub',
    icon: 'location_on',
    children: [
      {
        state: 'KM-price-Master',
        name: 'KM Price Master',
        type: 'link',
        icon: 'support',
      },
      {
        state: 'Document-price-Master',
        name: 'Document Price Master',
        type: 'link',
        icon: 'support',
      },
    ]
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
  {
    state: 'payout',
    name: 'COD/COP Status',
    type: 'link',
    icon: 'credit_card',
  },

  {
    state: 'add-subadmin',
    name: 'Sub Admin',
    type: 'link',
    icon: 'person',
  },
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
      {
        state: 'aboutus',
        name: 'About Us',
        type: 'link',
        icon: 'support',
      },
      {
        state: 'terms',
        name: 'Terms',
        type: 'link',
        icon: 'support',
      }
    ]
  },
  {
    state: 'demo-request',
    name: 'Demo Request',
    type: 'link',
    icon: 'phone_in_talk',
  },
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
    state: 'terms',
    name: 'Terms',
    type: 'link',
    icon: 'location_on',
  },




  // {
  //   state: 'restaurant',
  //   name: 'Restaurant',
  //   type: 'link',
  //   icon: 'location_on',
  // }

];

const ADMINMENUITEMS = [
  {
    state: 'drawlist',
    name: 'Campaign Master',
    type: 'link',
    icon: 'support',
  },
  {
    state: 'conductDraw',
    name: 'Draw List',
    type: 'link',
    icon: 'support',
  },
  {
    state: 'userlist',
    name: 'User Management',
    type: 'link',
    icon: 'person',
  },
  // {
  //   state: 'Audits',
  //   name: 'Audits',
  //   type: 'link',
  //   icon: 'event_note'
  // },
];

const USERMENUITEMS = [
  {
    state: 'userlist',
    name: 'User Management',
    type: 'link',
    icon: 'person',
  },
];

@Injectable()
export class MenuItems {
  userInfo: any;
  adminMenu: boolean = false;
  pageAccess: any;
  constructor() {
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);
    let userrole = this.userInfo?.role;
    console.log(this.userInfo, userrole, "aaaaaa")
    // userrole.forEach((d, i) => {
    //   if (d.role_name == 'Admin user' && d.id == 4) {
    //     this.adminMenu = true;
    //   }
    // });
    if (userrole == 'subadmin') {
      this.pageAccess = localStorage.getItem('pageAccess')
        ? JSON.parse(localStorage.getItem('pageAccess') || '')
        : '';
      console.log(this.pageAccess)
      // const filteredB = b.filter(item => item.name === 'View' && item.check === true);
      // console.log(filteredB);
    }
  }
  // getMenuitem(): Menu[] {
  //   if (this.userInfo?.role == 'admin') {
  //     console.log(this.userInfo?.role, "sssssssssssss")
  //     return MENUITEMS;
  //   } else {


  //     const filteredMenu = MENUITEMS.filter(menuItem => {
  //       const access = this.pageAccess.find((accessItem: any) => accessItem.page_name === menuItem.state);
  //       if (access) {
  //         return access.action.some((action: any) => action.check == true);
  //       }
  //       return false;
  //     });

  //     // If there are submenu items, filter them based on their access rights
  //     filteredMenu.forEach(menuItem => {
  //       if (menuItem.children) {
  //         menuItem.children = menuItem.children.filter(childItem => {
  //           const access = this.pageAccess.find((accessItem: any) => accessItem.name_type === childItem.state);
  //           if (access) {
  //             return access.action.some((action: any) => action.check);
  //           }
  //           return false;
  //         });
  //       }
  //     });

  //     return filteredMenu;
  //   }
  // }

  getMenuitem(): Menu[] {

    const filteredMenu = MENUITEMS.filter((menuItem: any) => {
      const access = this.pageAccess.find((accessItem: any) =>
        accessItem?.name_type === menuItem?.state);

      console.log(menuItem?.state)

      if (access) {
        console.log(access, "aaaaaaaaaaa")
        // Check if any action has `check: true`
        return access.action.some((action: any) => action.check === true);
      }
      return false;


    });

    // If there are submenu items, filter them based on their access rights
    filteredMenu.forEach((menuItem: any) => {
      if (menuItem.children) {
        console.log(menuItem.children, "aaaaaaaaaaaaa")
        menuItem.children = menuItem.children.filter((childItem: any) => {
          console.log(childItem, "aaaaaaaaaaaaa")
          const access = this.pageAccess.find((accessItem: any) => accessItem?.name_type === childItem?.state);
          if (access) {
            console.log(access, "aaaaaaaaaaaaa")
            return access.action.some((action: any) => action.check === true);

          }
          return false;
        });
      }
    });
    console.log(filteredMenu, "aaaaaaaaaaaaa")
    return filteredMenu;

  }

  // getMenuitem(): Menu[] {
  //   return MENUITEMS;
  // }

  // getMenuitem(): Menu[] {
  //   return MENUITEMS;
  // }

  getMenuitems(type): Menu[] {
    if (type == 'Admin') {
      return ADMINMENUITEMS;
    } else if (type == 'Usermanagement') {
      return USERMENUITEMS;
    } else {
      return MENUITEMS;
    }
  }
}
