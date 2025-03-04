import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './_services/auth-guard.service';

import { LoginComponent } from './Users/login/login.component';
import { DashboardLayoutComponent } from './Layout/Dashboard/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './Home/home/home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: LoginComponent },
  { 
    path: '', 
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'general', pathMatch: 'full' }, 
    ]
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
