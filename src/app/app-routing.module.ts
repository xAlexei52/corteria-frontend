import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_services/auth-guard.service';

import { LoginComponent } from './Users/login/login.component';
import { DashboardLayoutComponent } from './Layout/Dashboard/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './Home/home/home.component';
import { RegisterComponent } from './Users/register/register.component';
import { ResetRequestComponent } from './Users/reset-request/reset-request.component';
import { ResetPasswordComponent } from './Users/reset-password/reset-password.component';
import { TrailerEntriesListComponent } from './TrailerEntries/trailer-entries-list/trailer-entries-list.component';
import { TrailerEntriesFormComponent } from './TrailerEntries/trailer-entries-form/trailer-entries-form.component';
import { TrailerEntriesDetailComponent } from './TrailerEntries/trailer-entries-detail/trailer-entries-detail.component';
import { ManufacturingOrderFormComponent } from './ManufacturintOrders/manufacturing-order-form/manufacturing-order-form.component';
import { ManufacturingOrdersListComponent } from './ManufacturintOrders/manufacturing-orders-list/manufacturing-orders-list.component';
import { ManufacturingOrderDetailComponent } from './ManufacturintOrders/manufacturing-order-detail/manufacturing-order-detail.component';
import { CustomerListComponent } from './Customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './Customers/customer-form/customer-form.component';
import { CustomerDetailComponent } from './Customers/customer-detail/customer-detail.component';
import { CustomerFinancialSummaryComponent } from './Customers/customer-financial-summary/customer-financial-summary.component';
import { CustomerDebtManagmentComponent } from './Customers/customer-debt-managment/customer-debt-managment.component';
import { SaleListComponent } from './Sales/sale-list/sale-list.component';
import { SaleFormComponent } from './Sales/sale-form/sale-form.component';
import { SaleDetailComponent } from './Sales/sale-detail/sale-detail.component';
import { SalePaymentComponent } from './Sales/sale-payment/sale-payment.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-request', component: ResetRequestComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      {
        path: 'trailer-entries',
        children: [
          { path: '', component: TrailerEntriesListComponent },
          { path: 'create', component: TrailerEntriesFormComponent },
          { path: 'edit/:id', component: TrailerEntriesFormComponent },
          { path: 'details/:id', component: TrailerEntriesDetailComponent },
        ],
      },
      {
        path: 'manufacturing-orders',
        children: [
          { path: '', component: ManufacturingOrdersListComponent },
          {
            path: 'create/:trailerEntryId',
            component: ManufacturingOrderFormComponent,
          },
          { path: 'details/:id', component: ManufacturingOrderDetailComponent },
        ],
      },
      {
        path: 'clients',
        children: [
          { path: 'list', component: CustomerListComponent },
          { path: 'new', component: CustomerFormComponent },
          { path: 'edit/:id', component: CustomerFormComponent },
          { path: 'details/:id', component: CustomerDetailComponent },
          { path: 'finances', component: CustomerFinancialSummaryComponent },
          {
            path: 'financial-summary/:id',
            component: CustomerFinancialSummaryComponent,
          },
          { path: 'debts', component: CustomerDetailComponent },
          {
            path: 'debt-management/:id',
            component: CustomerDebtManagmentComponent,
          },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'sales',
        children: [
          { path: 'list', component: SaleListComponent },
          { path: 'new', component: SaleFormComponent },
          { path: 'edit/:id', component: SaleFormComponent },
          { path: 'details/:id', component: SaleDetailComponent },
          { path: 'payment/:id', component: SalePaymentComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
