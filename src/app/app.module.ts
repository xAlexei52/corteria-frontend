import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { TokenInterceptorService } from './_services/token-interceptor.service';
import { LoginComponent } from './Users/login/login.component';
import { RegisterComponent } from './Users/register/register.component';
import { ResetRequestComponent } from './Users/reset-request/reset-request.component';
import { ResetPasswordComponent } from './Users/reset-password/reset-password.component';
import { SidebarComponent } from './Layout/Sidebar/sidebar/sidebar.component';
import { DashboardLayoutComponent } from './Layout/Dashboard/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './Home/home/home.component';
import { TrailerEntriesDetailComponent } from './TrailerEntries/trailer-entries-detail/trailer-entries-detail.component';
import { TrailerEntriesFormComponent } from './TrailerEntries/trailer-entries-form/trailer-entries-form.component';
import { TrailerEntriesListComponent } from './TrailerEntries/trailer-entries-list/trailer-entries-list.component';
import { ManufacturingOrderFormComponent } from './ManufacturintOrders/manufacturing-order-form/manufacturing-order-form.component';
import { ManufacturingOrdersListComponent } from './ManufacturintOrders/manufacturing-orders-list/manufacturing-orders-list.component';
import { ManufacturingOrderDetailComponent } from './ManufacturintOrders/manufacturing-order-detail/manufacturing-order-detail.component';
import { CustomerListComponent } from './Customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './Customers/customer-form/customer-form.component';
import { CustomerDetailComponent } from './Customers/customer-detail/customer-detail.component';
import { CustomerFinancialSummaryComponent } from './Customers/customer-financial-summary/customer-financial-summary.component';
import { CustomerDebtManagmentComponent } from './Customers/customer-debt-managment/customer-debt-managment.component';
import { CustomerDocumentComponent } from './Customers/customer-document/customer-document.component';
import { SaleListComponent } from './Sales/sale-list/sale-list.component';
import { SaleFormComponent } from './Sales/sale-form/sale-form.component';
import { SaleDetailComponent } from './Sales/sale-detail/sale-detail.component';
import { SalePaymentComponent } from './Sales/sale-payment/sale-payment.component';
import { ProductListComponent } from './Proeducts/product-list/product-list.component';
import { ProductFormComponent } from './Proeducts/product-form/product-form.component';
import { ProductDetailComponent } from './Proeducts/product-detail/product-detail.component';
import { SupplyListComponent } from './Supplies/supply-list/supply-list.component';
import { SupplyFormComponent } from './Supplies/supply-form/supply-form.component';
import { SupplyDetailComponent } from './Supplies/supply-detail/supply-detail.component';
import { RecipeListComponent } from './Recipes/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './Recipes/recipe-form/recipe-form.component';
import { RecipeDetailComponent } from './Recipes/recipe-detail/recipe-detail.component';
import { UserListComponent } from './Users/user-list/user-list.component';
import { UserDetailComponent } from './Users/user-detail/user-detail.component';
import { UserEditComponent } from './Users/user-edit/user-edit.component';
import { FixedExpenseListComponent } from './FixedExpenses/fixed-expense-list/fixed-expense-list.component';
import { FixedExpenseFormComponent } from './FixedExpenses/fixed-expense-form/fixed-expense-form.component';
import { FixedExpenseDetailComponent } from './FixedExpenses/fixed-expense-detail/fixed-expense-detail.component';
import { ProjectListComponent } from './Projects/project-list/project-list.component';
import { ProjectFormComponent } from './Projects/project-form/project-form.component';
import { ProjectDetailComponent } from './Projects/project-detail/project-detail.component';
import { ProjectFinancialComponent } from './Projects/project-financial/project-financial.component';
import { ProjectExpenseListComponent } from './Projects/project-expense-list/project-expense-list.component';
import { ProjectExpenseFormComponent } from './Projects/project-expense-form/project-expense-form.component';
import { ProjectIncomeListComponent } from './Projects/project-income-list/project-income-list.component';
import { ProjectIncomeFormComponent } from './Projects/project-income-form/project-income-form.component';
import { WarehouseListComponent } from './Warehouses/warehouse-list/warehouse-list.component';
import { WarehouseInventoryComponent } from './Warehouses/warehouse-inventory/warehouse-inventory.component';
import { SaleRomaneoComponent } from './Sales/sale-romaneo/sale-romaneo.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ResetRequestComponent,
    ResetPasswordComponent,
    SidebarComponent,
    DashboardLayoutComponent,
    HomeComponent,
    TrailerEntriesDetailComponent,
    TrailerEntriesFormComponent,
    TrailerEntriesListComponent,
    ManufacturingOrderFormComponent,
    ManufacturingOrdersListComponent,
    ManufacturingOrderDetailComponent,
    CustomerListComponent,
    CustomerFormComponent,
    CustomerDetailComponent,
    CustomerFinancialSummaryComponent,
    CustomerDebtManagmentComponent,
    CustomerDocumentComponent,
    SaleListComponent,
    SaleFormComponent,
    SaleDetailComponent,
    SalePaymentComponent,
    ProductListComponent,
    ProductFormComponent,
    ProductDetailComponent,
    SupplyListComponent,
    SupplyFormComponent,
    SupplyDetailComponent,
    RecipeListComponent,
    RecipeFormComponent,
    RecipeDetailComponent,
    UserListComponent,
    UserDetailComponent,
    UserEditComponent,
    FixedExpenseListComponent,
    FixedExpenseFormComponent,
    FixedExpenseDetailComponent,
    ProjectListComponent,
    ProjectFormComponent,
    ProjectDetailComponent,
    ProjectFinancialComponent,
    ProjectExpenseListComponent,
    ProjectExpenseFormComponent,
    ProjectIncomeListComponent,
    ProjectIncomeFormComponent,
    WarehouseListComponent,
    WarehouseInventoryComponent,
    SaleRomaneoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
