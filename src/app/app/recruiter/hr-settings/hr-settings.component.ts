import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from "../hr-header/hr-header.component";
import { HrFooterComponent } from "../hr-footer/hr-footer.component";
@Component({
  selector: 'app-hr-settings',
  imports: [RecruiterSidebarComponent, CommonModule, FormsModule, HrHeaderComponent, HrFooterComponent],
  templateUrl: './hr-settings.component.html',
  styleUrl: './hr-settings.component.css'
})
export class HrSettingsComponent {

}
