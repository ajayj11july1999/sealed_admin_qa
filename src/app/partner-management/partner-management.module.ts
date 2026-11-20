import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DemoMaterialModule } from '../demo-material-module';
import { CredentialsDialogComponent } from './dialogs/credentials-dialog.component';
import { PartnerCostDialogComponent } from './dialogs/partner-cost-dialog.component';
import { PartnerLoginDialogComponent } from './dialogs/partner-login-dialog.component';
import { PmConfirmDialogComponent } from './dialogs/pm-confirm-dialog.component';
import { PartnerCreateComponent } from './partner-create/partner-create.component';
import { PartnerDetailComponent } from './partner-detail/partner-detail.component';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { PartnerLoginsComponent } from './partner-logins/partner-logins.component';
import { PartnerPricingComponent } from './partner-pricing/partner-pricing.component';

/**
 * Partners (API): businesses that book through sealed_partner_api — onboarding,
 * their price per vehicle, and their partner portal logins. Lazy-loaded at
 * /partners-api, so none of it is in the panel's main bundle.
 */
const routes: Routes = [
  { path: '', component: PartnerListComponent, data: { title: 'Partners (API)' } },
  { path: 'new', component: PartnerCreateComponent, data: { title: 'Create partner' } },
  { path: ':keyId', component: PartnerDetailComponent, data: { title: 'Partner' } },
];

@NgModule({
  declarations: [
    PartnerListComponent,
    PartnerCreateComponent,
    PartnerDetailComponent,
    PartnerPricingComponent,
    PartnerLoginsComponent,
    CredentialsDialogComponent,
    PartnerCostDialogComponent,
    PartnerLoginDialogComponent,
    PmConfirmDialogComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DemoMaterialModule, NgSelectModule, RouterModule.forChild(routes)],
})
export class PartnerManagementModule {}
