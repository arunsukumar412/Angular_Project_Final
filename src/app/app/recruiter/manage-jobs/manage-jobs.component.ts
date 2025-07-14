import { Component } from '@angular/core';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

@Component({
  selector: 'app-manage-jobs',
  imports: [RecruiterSidebarComponent,HrHeaderComponent,HrFooterComponent],
  templateUrl: './manage-jobs.component.html',
  styleUrl: './manage-jobs.component.css'
})
export class ManageJobsComponent {

}
