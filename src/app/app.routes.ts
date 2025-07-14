import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './app/auth/login/login.component';
import { RegisterComponent } from './app/auth/register/register.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ForgotPasswordComponent } from './app/auth/forgot-password/forgot-password.component';
import { HomePageComponent } from './app/home-page/home-page/home-page.component';
import { DashboardComponent } from './app/admin/dashboard/dashboard.component';
import { ManageJobsComponent } from './app/recruiter/manage-jobs/manage-jobs.component';
import { UserManagementComponent } from './app/admin/user-management/user-management.component';  
import { AdminSettingsComponent } from './app/admin/admin-settings/admin-settings.component';
import { JobPostingsComponent } from './app/admin/job-postings/job-postings.component';
import { AdminReportManagementComponent } from './app/admin/admin-report-management/admin-report-management.component';
import { AuthGuard } from './auth.guard';
import { SidebarComponent } from './app/admin/sidebar/sidebar.component';
import { RecruiterSidebarComponent } from './app/recruiter/recruiter-sidebar/recruiter-sidebar.component';  
import { HrDashboardComponent } from './app/recruiter/hr-dashboard/hr-dashboard.component';
import { InterviewSchedulerComponent } from './app/recruiter/interview-scheduler/interview-scheduler.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent, title: 'home' },
  { path: 'login', component: LoginComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent , canActivate: [AuthGuard]},
  {path:'register',component:RegisterComponent},
  {path: 'home', component: HomePageComponent },
  {path: 'dashboard', component: DashboardComponent , canActivate: [AuthGuard] },
  {path:'sidebar',component:SidebarComponent},
  {path:'user-management',component:UserManagementComponent},
  {path:'job-postings',component:JobPostingsComponent},
  {path:'admin-report-management',component:AdminReportManagementComponent},
  {path:'admin-settings',component:AdminSettingsComponent},
  {path:'recruiter-sidebar',component:RecruiterSidebarComponent},
  {path:'hr-dashboard',component:HrDashboardComponent},
  {path:'interview-scheduler',component:InterviewSchedulerComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }