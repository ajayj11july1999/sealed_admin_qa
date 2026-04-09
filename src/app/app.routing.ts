import { Routes } from '@angular/router';

import { B2bCustomersComponent } from './b2b-customers/b2b-customers.component';
import { B2bTripsComponent } from './b2b-trips/b2b-trips.component';

import { CourierGeneratePayoutComponent } from './courier-generate-payout/courier-generate-payout.component';
import { CourierPayoutViewComponent } from './courier-payout-view/courier-payout-view.component';
import { CourierPayoutComponent } from './courier-payout/courier-payout.component';
import { CourierViewComponent } from './courier-view/courier-view.component';
import { CouriersComponent } from './couriers/couriers.component';
import { CustomerViewComponent } from './customer-view/customer-view.component';
import { CustomersComponent } from './customers/customers.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemoMaterialModule } from './demo-material-module';
import { DeliveryTripComponent } from './delivery-trip/delivery-trip.component';
import { EnterOtpComponent } from './enter-otp/enter-otp.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FullComponent } from './layouts/full/full.component';
import { LoginComponent } from './login/login.component';

import { PayoutComponent } from './payout/payout.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SearchComponent } from './search/search.component';
import { SettingComponent } from './setting/setting.component';
import { StampDocumentComponent } from './stamp-document/stamp-document.component';
import { TripDetailsComponent } from './trip-details/trip-details.component';
import { AuthGuardServiceService } from './service/auth-guard-service.service';
import { DemoRequestComponent } from './demo-request/demo-request.component';
import { MobileAppTripsComponent } from './mobile-app-trips/mobile-app-trips.component';
import { AddSubadminComponent } from './add-subadmin/add-subadmin.component';
import { MapComponent } from './map/map.component';
import { FoodComponent } from './food/food.component';
import { RestaurantComponent } from './restaurant/restaurant.component';
import { AddRestaurantComponent } from './add-restaurant/add-restaurant.component';
import { FaqComponent } from './faq/faq.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { TermsComponent } from './terms/terms.component';
import { TermsupdateComponent } from './termsupdate/termsupdate.component';
import { MastercategoryComponent } from './mastercategory/mastercategory.component';
import { TypesmasterComponent } from './typesmaster/typesmaster.component';
import { CategoriesComponent } from './categories/categories.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { BookingInstructionComponent } from './booking-instruction/booking-instruction.component';
import { DocumentPriceMasterComponent } from './pricing/document-price-master/document-price-master.component';
import { KmPriceMasterComponent } from './pricing/km-price-master/km-price-master.component';
import { TypeMasterStampComponent } from './stamp/type-master-stamp/type-master-stamp.component';
import { MasterStampComponent } from './stamp/master-stamp/master-stamp.component';
import { CourierPayoutsComponent } from './couriers/courier-payouts/courier-payouts.component';
import { CourierWageAmountComponent } from './couriers/courier-wage-amount/courier-wage-amount.component';
import { CourierPayoutHistoryComponent } from './couriers/courier-payout-history/courier-payout-history.component';
import { CouponComponent } from './coupon/coupon.component';
import { CreateUpdateAdminComponent } from './add-subadmin/create-update-admin/create-update-admin.component';
import { B2bAddComponent } from './b2b-customers/b2b-add/b2b-add.component';
import { CourierAddComponent } from './couriers/courier-add/courier-add.component';
import { PaymentComponent } from './payment/payment.component';
import { StoreComponent } from './store/store.component';

import { ZoneComponent } from './Zonemap/zone.component';
import { ExtrachangeComponent } from './extrachange/extrachange.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { FlaggedConsumersComponent } from './flagged-consumers/flagged-consumers.component';
import { UserBehaviorViewComponent } from './user-behavior-view/user-behavior-view.component';

export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuardServiceService],
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
      {
        path: 'Dashboard',
        component: DashboardComponent,

        data: {
          title: ' Admin Dashboard',
          urls: [{ title: 'Dashboard', url: '/   ' }],
        },
      },
      {
        path: 'mobile-app-trips',
        component: MobileAppTripsComponent,

        data: {
          title: 'B2C-Trips',
          urls: [{ title: 'Mobile App Trips', url: '/   ' }],
        },
      },
      {
        path: 'trip_details',
        component: TripDetailsComponent,

        data: {
          title: 'Dashboard',
          urls: [{ title: 'trip_details', url: '/   ' }],
        },
      },
      {
        path: 'search',
        component: SearchComponent,

        data: {
          title: 'Search',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'search' }],
        },
      },
      {
        path: 'delivery_trip',
        component: DeliveryTripComponent,

        data: {
          title: 'Delivery_trip',
          urls: [
            { title: 'Dashboard', url: '/   ' },
            { title: 'delivery_trip' },
          ],
        },
      },
      {
        path: 'stamp_document',
        component: StampDocumentComponent,

        data: {
          title: 'Stamp Document',
          urls: [
            { title: 'Dashboard', url: '/   ' },
            { title: 'stamp_document' },
          ],
        },
      },
      {
        path: 'couriers/master',
        component: CouriersComponent,

        data: {
          title: 'Couriers',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },
      {
        path: 'couriers/master/courier-add',
        component: CourierAddComponent,

        data: {
          title: 'Couriers',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },
      {
        path: 'couriers/history',
        component: CourierPayoutHistoryComponent,

        data: {
          title: 'Couriers',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },

      {
        path: 'couriers/payouts',
        component: CourierPayoutsComponent,

        data: {
          title: 'Payouts',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },
      {
        path: 'couriers/payouts/:id',
        component: CourierPayoutsComponent,

        data: {
          title: 'Payouts',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },
      {
        path: 'couriers/trip_amount',
        component: CourierWageAmountComponent,

        data: {
          title: 'Couriers',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },
      {
        path: 'courier-view',
        component: CourierViewComponent,

        data: {
          title: 'Courier-view',
          urls: [
            { title: 'Dashboard', url: '/   ' },
            { title: 'courier-view' },
          ],
        },
      },
      {
        path: 'courier-payout/:id',
        component: CourierPayoutComponent,

        data: {
          title: 'Courier-payout',
          urls: [
            { title: 'Dashboard', url: '/   ' },
            { title: 'courier-payout' },
          ],
        },
      },
      {
        path: 'courier-payout-view/:id/:name',
        component: CourierPayoutViewComponent,

        data: {
          title: 'Courier-payout-view',
          urls: [
            { title: 'Dashboard', url: '/ ' },
            { title: 'courier-payout-view' },
          ],
        },
      },
      {
        path: 'courier-generate-payout/:id',
        component: CourierGeneratePayoutComponent,

        data: {
          title: 'Courier-generate-payout',
          urls: [
            { title: 'Dashboard', url: '/ ' },
            { title: 'courier-generate-payout' },
          ],
        },
      },
      {
        path: 'payouts',
        component: CourierPayoutsComponent,

        data: {
          title: 'Payouts',
          urls: [{ title: 'Dashboard', url: '/   ' }, { title: 'couriers' }],
        },
      },
      {
        path: 'customers',
        component: CustomersComponent,

        data: {
          title: 'B2C-Customers',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'customers' }],
        },
      },
      {
        path: 'customer-view',
        component: CustomerViewComponent,

        data: {
          title: 'Customer-view',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'customer-view' }],
        },
      },
      {
        path: 'b2b-trips',
        component: B2bTripsComponent,

        data: {
          title: 'S2B-Trips',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'b2b-trips' }],
        },
      }, {
        path: 'b2b-customers/b2b-add',
        component: B2bAddComponent,

        data: {
          title: 'S2B-customers',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'b2b-customers' }],
        },
      },
      {
        path: 'b2b-customers',
        component: B2bCustomersComponent,

        data: {
          title: 'S2B-customers',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'b2b-customers' }],
        },
      },
      {
        path: 'payout',
        component: PayoutComponent,

        data: {
          title: 'COD/COP Status',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'payout' }],
        },
      },
      {
        path: 'settings/master',
        component: SettingComponent,

        data: {
          title: 'Settings',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'setting' }],
        },
      },
      {
        path: 'settings/typesmaster',
        component: SettingComponent,

        data: {
          title: 'Settings',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'setting' }],
        },
      },
      {
        path: 'settings/booking_instruction',
        component: BookingInstructionComponent,

        data: {
          title: 'Booking Instruction',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'Booking Instruction' }],
        },
      },
      {
        path: 'settings/aboutus',
        component: AboutusComponent,

        data: {
          title: 'About Us',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'aboutus' }],
        },
      },
      {
        path: 'settings/terms',
        component: TermsupdateComponent,

        data: {
          title: 'Terms',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'setting' }],
        },
      },
      {
        path: 'demo-request',
        component: DemoRequestComponent,

        data: {
          title: 'demo-Request',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'demo-request' }],
        },
      },

      {
  path: 'zones',
  component: ZoneComponent,
  data: {
    title: 'Zones',
    urls: [
      { title: 'Dashboard', url: '/' },
      { title: 'Zones' }
    ],
  },
},

      {
        path: 'map',
        component: MapComponent,

        data: {
          title: 'Map',
          urls: [{ title: 'map', url: '/ ' }, { title: 'map' }],
        },
      },
      {
        path: 'faq',
        component: FaqComponent,

        data: {
          title: 'FAQ',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'FAQ' }],
        },
      },
      {
        path: 'reviews',
        component: ReviewsComponent,
        canActivate: [AuthGuardServiceService],
        data: {
          title: 'Review & Rating',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'Review & Rating' }],
        },
      },
      {
        path: 'terms',
        component: TermsComponent,

        data: {
          title: 'Terms',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'terms' }],
        },
      },
      {
        path: 'terms/update',
        component: TermsupdateComponent,

        data: {
          title: 'Terms',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'terms' }],
        },
      },
      {
        path: 'categories',
        component: CategoriesComponent,
        // canActivate: [AuthGuardService],
        data: {
          title: ' Category',
          urls: [
            { title: 'Dashboard', url: '/' },
            { title: ' category' },
          ],
        },
      },
      {
        path: 'categories/mastercategory',
        component: MastercategoryComponent,
        // canActivate: [AuthGuardService],
        data: {
          title: 'master Category',
          urls: [
            { title: 'Dashboard', url: '/' },
            { title: 'Master category' },
          ],
        },
      },
      {
        path: 'categories/typesmaster',
        component: TypesmasterComponent,
        // canActivate: [AuthGuardService],
        data: {
          title: 'Types Master',
          urls: [
            { title: 'Dashboard', url: '/' },
            { title: 'Assign Meal' },
          ],
        },
      },
      {
        path: 'Pricings/KM-price-Master',
        component: KmPriceMasterComponent,

        data: {
          title: 'KM Price Master',
          urls: [{ title: 'KM Price Master', url: '/   ' }],
        },
      },

      {
        path: 'Pricings/Document-price-Master',
        component: DocumentPriceMasterComponent,

        data: {
          title: 'Document Pricing Master',
          urls: [{ title: 'KM Price Master', url: '/   ' }],
        },
      },
      {
        path: 'Stamps/Master',
        component: MasterStampComponent,

        data: {
          title: 'Master Stamp',
          urls: [{ title: 'Master Stamp', url: '/   ' }],
        },
      },

      {
        path: 'Stamps/Type-master',
        component: TypeMasterStampComponent,

        data: {
          title: 'Type Master Stamp',
          urls: [{ title: 'Type Master Stamp', url: '/   ' }],
        },
      },
      {
        path: 'add-subadmin',
        component: AddSubadminComponent,

        data: {
          title: 'Create SubAdmin',
          urls: [{ title: 'add-subadmin', url: '/   ' }],
        },
      },
      {
        path: 'Coupon',
        component: CouponComponent,

        data: {
          title: 'Manage Coupon',
          urls: [{ title: 'Mobile App Trips', url: '/   ' }],
        },
      },
      {
        path: 'payment',
        component: PaymentComponent,

        data: {
          title: 'Manage Refund Payment',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'Payment' }],
        },
      },
      {
        path: 'add-subadmin/create',
        component: CreateUpdateAdminComponent,

        data: {
          title: 'Sub Admin',
          urls: [{ title: 'Mobile App Trips', url: '/   ' }],
        },
      },
       
{
  path: 'store',
  component: StoreComponent,
  data: {
    title: 'Manage Store',
    urls: [
      { title: 'Dashboard', url: '/' },
      { title: 'Manage Store' }
    ],
  },
},
{
  path: 'vehicle',
  component: VehicleComponent,
  data: {
    title: 'Manage Vehicle',
    urls: [
      { title: 'Dashboard', url: '/' },
      { title: 'Manage Vehicle' }
    ],
  },
},
 {
        path: 'flagged-consumers',
        component: FlaggedConsumersComponent,
        data: {
          title: 'Flagged Consumers',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'Flagged Consumers' }],
        },
      },
      {
        path: 'user-behavior-view',
        component: UserBehaviorViewComponent,
        data: {
          title: 'User Behavior',
          urls: [{ title: 'Dashboard', url: '/ ' }, { title: 'User Behavior' }],
        },
      },

{
  path: 'extracharge',
  component: ExtrachangeComponent,
  data: {
    title: 'Manage ExtraCharge',
    urls: [
      { title: 'Dashboard', url: '/' },
      { title: 'Manage ExtraCharge' }
    ],
  },
},
      {
        path: 'restaurant',
        component: RestaurantComponent,

        data: {
          title: 'Restaurant',
          urls: [{ title: 'Restaurant', url: '/   ' }],
        },
      },
      {
        path: 'restaurant/add-restaurant',
        component: AddRestaurantComponent,

        data: {
          title: 'Add Restaurant',
          urls: [{ title: 'Restaurant', url: '/   ' }],
        },
      },
      {
        path: 'restaurant/food',
        component: FoodComponent,

        data: {
          title: 'Food',
          urls: [{ title: 'Food', url: '/   ' }],
        },
      },



    ],
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page',
    },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Registration',
    },
  },
  {
    path: 'otp',
    component: EnterOtpComponent,
    data: {
      title: 'OTP',
    },
  },

  {
    path: 'forgotpass',
    component: ForgotPasswordComponent,
    data: {
      title: 'Forgot password',
    },
  },

  {
    path: 'resetPassword',
    component: ResetPasswordComponent,
    data: {
      title: 'Reset password',
    },
  },
];
