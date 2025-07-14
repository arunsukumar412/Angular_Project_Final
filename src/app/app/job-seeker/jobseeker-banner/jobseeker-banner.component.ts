import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';

@Component({
  selector: 'app-jobseeker-banner',
  imports: [JobseekerSidebarComponent],
  templateUrl: './jobseeker-banner.component.html',
  styleUrl: './jobseeker-banner.component.css'
})
export class JobseekerBannerComponent {

}
