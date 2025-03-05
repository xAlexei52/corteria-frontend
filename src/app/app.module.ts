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
