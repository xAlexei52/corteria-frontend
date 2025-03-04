import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_services/auth-guard.service';

import { LoginComponent } from './Users/login/login.component';
import { DashboardLayoutComponent } from './Layout/Dashboard/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './Home/home/home.component';
import { RegisterComponent } from './Users/register/register.component';
import { ResetRequestComponent } from './Users/reset-request/reset-request.component';
import { ResetPasswordComponent } from './Users/reset-password/reset-password.component';

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
      { path: '', redirectTo: 'general', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
