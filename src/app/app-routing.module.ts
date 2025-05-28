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
import { RoleGuard } from './_services/AuthService/role.guard';
import { WarehouseListComponent } from './Warehouses/warehouse-list/warehouse-list.component';
import { WarehouseInventoryComponent } from './Warehouses/warehouse-inventory/warehouse-inventory.component';
import { SaleRomaneoComponent } from './Sales/sale-romaneo/sale-romaneo.component';
import { ExpenseListComponent } from './CompanyExpenses/expense-list/expense-list.component';
import { ExpenseFormComponent } from './CompanyExpenses/expense-form/expense-form.component';
import { ExpenseDetailComponent } from './CompanyExpenses/expense-detail/expense-detail.component';
import { ExpenseStatisticsComponent } from './CompanyExpenses/expense-statistics/expense-statistics.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-request', component: ResetRequestComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'user', 'manager'] },
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
          { path: 'romaneo/:detailId', component: SaleRomaneoComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'products',
        children: [
          { path: 'list', component: ProductListComponent },
          { path: 'new', component: ProductFormComponent },
          { path: 'edit/:id', component: ProductFormComponent },
          { path: 'details/:id', component: ProductDetailComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'supplies',
        children: [
          { path: 'list', component: SupplyListComponent },
          { path: 'new', component: SupplyFormComponent },
          { path: 'edit/:id', component: SupplyFormComponent },
          { path: 'details/:id', component: SupplyDetailComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'recipes',
        children: [
          { path: 'list', component: RecipeListComponent },
          { path: 'new', component: RecipeFormComponent },
          { path: 'edit/:id', component: RecipeFormComponent },
          { path: 'details/:id', component: RecipeDetailComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'users',
        children: [
          { path: 'list', component: UserListComponent },
          { path: 'details/:id', component: UserDetailComponent },
          { path: 'edit/:id', component: UserEditComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'fixed-expenses',
        children: [
          { path: 'list', component: FixedExpenseListComponent },
          { path: 'new', component: FixedExpenseFormComponent },
          { path: 'edit/:id', component: FixedExpenseFormComponent },
          { path: 'details/:id', component: FixedExpenseDetailComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'projects',
        canActivate: [AuthGuard],
        children: [
          { path: 'list', component: ProjectListComponent },
          { path: 'new', component: ProjectFormComponent },
          { path: 'edit/:id', component: ProjectFormComponent },
          { path: 'details/:id', component: ProjectDetailComponent },
          { path: 'financial/:id', component: ProjectFinancialComponent },
          {
            path: 'expenses/:projectId',
            component: ProjectExpenseListComponent,
          },
          {
            path: 'expenses/new/:projectId',
            component: ProjectExpenseFormComponent,
          },
          { path: 'expenses/edit/:id', component: ProjectExpenseFormComponent },
          { path: 'incomes/:projectId', component: ProjectIncomeListComponent },
          {
            path: 'incomes/new/:projectId',
            component: ProjectIncomeFormComponent,
          },
          { path: 'incomes/edit/:id', component: ProjectIncomeFormComponent },
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'company-expenses',
        children: [
          { path: 'list', component: ExpenseListComponent },
          { path: 'new', component: ExpenseFormComponent }, // Lo agregaremos después
          { path: 'edit/:id', component: ExpenseFormComponent }, // Lo agregaremos después
          { path: 'details/:id', component: ExpenseDetailComponent }, // Lo agregaremos después
          { path: 'statistics', component: ExpenseStatisticsComponent }, // Lo agregaremos después
          { path: '', redirectTo: 'list', pathMatch: 'full' },
        ],
      },
      {
        path: 'warehouses',
        children: [
          { path: '', component: WarehouseListComponent },
          { path: 'inventory/:id', component: WarehouseInventoryComponent },
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
