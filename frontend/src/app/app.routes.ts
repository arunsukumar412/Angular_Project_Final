import { Component, NgModule } from '@angular/core';
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
import { ContentManagementComponent } from './app/admin/content-management/content-management.component';
import { HelpCenterComponent } from './app/admin/help-center/help-center.component';
import { LogoutComponent } from './app/admin/logout/logout.component';

import { RecruiterSidebarComponent } from './app/recruiter/recruiter-sidebar/recruiter-sidebar.component';  
import { HrDashboardComponent } from './app/recruiter/hr-dashboard/hr-dashboard.component';
import { InterviewSchedulerComponent } from './app/recruiter/interview-scheduler/interview-scheduler.component';
import { PostJobComponent } from './app/recruiter/post-job/post-job.component';
import { ShortlistCandidatesComponent } from './app/recruiter/shortlist-candidates/shortlist-candidates.component';
import { TestCredentialsComponent } from './app/recruiter/test-credentials/test-credentials.component';
import { HrSettingsComponent } from './app/recruiter/hr-settings/hr-settings.component';
import { JobManagementComponent } from './app/recruiter/job-management/job-management.component';

import { JobseekerSidebarComponent } from './app/job-seeker/jobseeker-sidebar/jobseeker-sidebar.component';
import { JobseekerDashboardComponent } from './app/job-seeker/jobseeker-dashboard/jobseeker-dashboard.component';
import { JobseekerBannerComponent } from './app/job-seeker/jobseeker-banner/jobseeker-banner.component';
import { ProfileComponent } from './app/job-seeker/profile/profile.component';
import { SavedJobsComponent } from './app/job-seeker/saved-jobs/saved-jobs.component';
import { ResumeUploadComponent } from './app/job-seeker/resume-upload/resume-upload.component';
import { BrowseJobsComponent } from './app/job-seeker/browse-jobs/browse-jobs.component';
import { ApplyJobComponent } from './app/job-seeker/apply-job/apply-job.component';
import { HistoryComponent } from './app/job-seeker/history/history.component';
import { InterviewPortalComponent } from './app/job-seeker/interview-portal/interview-portal.component';
import { HrHeaderComponent } from './app/recruiter/hr-header/hr-header.component';
import { HrFooterComponent } from './app/recruiter/hr-footer/hr-footer.component';
import { AdminHeaderComponent } from './app/admin/admin-header/admin-header.component';
import { AdminFooterComponent } from './app/admin/admin-footer/admin-footer.component';
import { JobseekerLogoutComponent } from './app/job-seeker/jobseeker-logout/jobseeker-logout.component';
import { LoginAnimationComponent } from './login-animation/login-animation.component';
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
  {path:'content-management',component:ContentManagementComponent},
  {path:'help-center',component:HelpCenterComponent},
  {path:'logout',component:LogoutComponent},
  {path: 'admin-header', component:AdminHeaderComponent},
  {path: 'admin-footer', component:AdminFooterComponent},
  
  

//Hr
  {path:'recruiter-sidebar',component:RecruiterSidebarComponent},
  {path:'hr-dashboard',component:HrDashboardComponent},
  {path:'interview-scheduler',component:InterviewSchedulerComponent},
  {path:'post-job',component:PostJobComponent},
  {path:'shortlist-candidates',component:ShortlistCandidatesComponent},
  {path:'test-credentials',component:TestCredentialsComponent},
  {path:'hr-settings',component:HrSettingsComponent},
  {path:'hr-navbar', component:HrHeaderComponent},
  {path:'hr-footer', component:HrFooterComponent},
  {path:'job-management',component:JobManagementComponent},



//Job Seeker
  {path:'jobseeker-sidebar',component:JobseekerSidebarComponent},
  {path:'jobseeker-dashboard',component:JobseekerDashboardComponent},
  {path:"jobseeker-banner",component:JobseekerBannerComponent},
  {path:'profile',component:ProfileComponent},
  {path:'saved-jobs',component:SavedJobsComponent},
  {path:'resume-upload',component:ResumeUploadComponent},
  {path:'browse-jobs',component:BrowseJobsComponent},
  {path:'apply-job',component:ApplyJobComponent},
  {path:'history',component:HistoryComponent},
  {path:'interview-portal',component:InterviewPortalComponent},
  {path:'jobseeker-logout',component:JobseekerLogoutComponent},
  {path: 'login-animation', component: LoginAnimationComponent},
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }