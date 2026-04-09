import { Injectable } from '@angular/core';
import { MenuItems } from '../shared/menu-items/menu-items';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissions = [
    [{ "page_name": "Search", "name_type": "search", "action": [{ "name": "View", "check": true }] },
    { "page_name": "S2B Trips", "name_type": "S2B_trips", "action": [{ "name": "View", "check": true }] },
    { "page_name": "S2C Trips", "name_type": "S2C_trips", "action": [{ "name": "View", "check": true }] },
    {
      "page_name": "Stamp Documnet", "name_type": "stamp_document",
      "action": [{ "name": "View", "check": true }]
    },
    {
      "page_name": "S2B Customers", "name_type": "s2b_customers",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true }, { "name": "Edit", "check": true }, { "name": "Export", "check": false }]
    },
    {
      "page_name": "S2C Customers", "name_type": "s2C_customers", "action": [{ "name": "View", "check": true },
      { "name": "Export", "check": true }]
    },
    {
      "page_name": "Courier Partners", "name_type": "courier_partners",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Edit", "check": true }, { "name": "Export", "check": true },
      { "name": " View Trip Amount ", "check": true }, { "name": " Edit Trip Amount ", "check": true }]
    },
    {
      "page_name": "Categories", "name_type": "categories",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Edit", "check": true }, { "name": "Export", "check": true },
      { "name": "View Categories Type", "check": true }, { "name": "Add Categories Type", "check": true },
      { "name": "Edit Categories Type ", "check": true }]
    },
    {
      "page_name": "Customer Pricing", "name_type": "customer_pricing",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Edit", "check": true }, { "name": "Delete", "check": true }]
    },
    {
      "page_name": "Customer Coupon", "name_type": "customer_coupon",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Edit", "check": true }]
    },
    {
      "page_name": "Stamp", "name_type": "Stamp",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Edit", "check": true }, { "name": "View Stamp Type", "check": true },
      { "name": " Add Stamp Type", "check": true }, { "name": "Edit Stamp Type ", "check": true }]
    },
    {
      "page_name": "Courier Partner Payout", "name_type": "Courier_Partner_Payout",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "History", "check": true }]
    },
    {
      "page_name": "Settings", "name_type": "Settings",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Delete", "check": true }]
    },
    {
      "page_name": "Booking Instruction", "name_type": "Booking_Instruction",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Delete", "check": true }]
    },
    {
      "page_name": "FAQ", "name_type": "FAQ",
      "action": [{ "name": "View", "check": true }, { "name": "Add", "check": true },
      { "name": "Delete", "check": true }]
    }]
  ];

  constructor() { }

  // hasPermission(name_type: string, actionName: string): boolean {
  //   const page = this.permissions.find(p => p.name_type === name_type);
  //   if (page) {
  //     const action = page.action.find(a => a.name === actionName);
  //     return action ? action.check : false;
  //   }
  //   return false;
  // }

  // getAccessibleMenuItems() {
  //   return MenuItems.filter(menuItem => this.hasPermission(menuItem.name_type, 'View'));
  // }
}
