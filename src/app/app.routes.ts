import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ForgotPasswordComponent } from './app/auth/forgot-password/forgot-password.component';
import { RegisterComponent } from './app/auth/register/register.component'; 
import { HomePageComponent } from './app/home-page/home-page/home-page.component';
import { DashboardComponent } from './app/admin/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent, title: 'home' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'home', component: HomePageComponent },
  {path: 'dashboard', component: DashboardComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }