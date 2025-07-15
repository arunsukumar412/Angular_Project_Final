import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApplicationService } from '../../../services/application.service';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

interface Job {
  id: number;
  title: string;
  company: string;
  department: string;
  location: string;
}

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  department: string;
  location: string;
  appliedDate: Date;
  status: string;
  candidate: {
    id: string;
    firstName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  resume: string;
  coverLetter: string;
  questions: { question: string; answer: string }[];
}

@Component({
  selector: 'app-job-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RecruiterSidebarComponent,
    HrHeaderComponent,
    HrFooterComponent
  ],
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css']
})
export class JobManagementComponent implements OnInit {
  jobs: Job[] = [];
  applications: Application[] = [];
  filteredJobs: Job[] = [];
  paginatedJobs: Job[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  showApplicationsModal: boolean = false;
  selectedJobApplications: Application[] = [];
  selectedApplication: Application | null = null;
  showApplicationModal: boolean = false;
Math: any;

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.applicationService.getApplications().subscribe({
      next: (apps: any[]) => {
        this.applications = apps.map(app => ({
          id: app.id,
          jobId: app.jobId || 0,
          jobTitle: app.jobTitle || 'Unknown Job',
          company: app.company || 'Unknown Company',
          department: app.department || 'Unknown Department',
          location: app.location || 'Chennai',
          appliedDate: new Date(app.appliedDate || new Date()),
          status: app.status || 'Under Review',
          candidate: {
            id: app.candidate?.id || `cand_${app.id}`,
            firstName: app.candidate?.firstName || 'Unknown Candidate',
            email: app.candidate?.email || 'unknown@example.com',
            phone: app.candidate?.phone || 'N/A',
            avatar: app.candidate?.avatar || 'assets/default-avatar.png'
          },
          resume: app.resume || 'https://example.com/resumes/default.pdf',
          coverLetter: app.coverLetter || 'No cover letter provided',
          questions: app.questions || []
        }));

        // Derive unique jobs from applications
        this.jobs = Array.from(
          new Map(
            this.applications.map(app => [
              app.jobId,
              {
                id: app.jobId,
                title: app.jobTitle,
                company: app.company,
                department: app.department,
                location: app.location
              }
            ])
          ).values()
        );

        this.filterJobs();
      },
      error: (error) => {
        console.error('Error fetching applications:', error);
        this.jobs = [];
        this.applications = [];
      }
    });
  }

  getApplicationsCount(jobId: number): number {
    return this.applications.filter(app => app.jobId === jobId).length;
  }

  filterJobs(): void {
    this.filteredJobs = this.searchQuery
      ? this.jobs.filter(job =>
          job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      : [...this.jobs];
    this.paginateJobs();
  }

  paginateJobs(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedJobs = this.filteredJobs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredJobs.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginateJobs();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateJobs();
    }
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredJobs.length) {
      this.currentPage++;
      this.paginateJobs();
    }
  }

  viewApplications(jobId: number): void {
    this.selectedJobApplications = this.applications.filter(app => app.jobId === jobId);
    this.showApplicationsModal = true;
  }

  closeApplicationsModal(): void {
    this.showApplicationsModal = false;
    this.selectedJobApplications = [];
  }

  viewApplication(application: Application): void {
    this.selectedApplication = application;
    this.showApplicationModal = true;
  }

  closeApplicationModal(): void {
    this.showApplicationModal = false;
    this.selectedApplication = null;
  }

  downloadResume(url: string): void {
    console.log('Downloading resume from:', url);
    // Implement actual download logic here
  }
}