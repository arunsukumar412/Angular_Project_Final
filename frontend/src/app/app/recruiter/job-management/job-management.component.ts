import { Component, OnInit } from '@angular/core';
import { ShortlistCandidateService } from '../../../services/shortlist-candidate.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApplicationService } from '../../../services/application.service';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

interface Job {
  id: number;
  job_title: string;
  company: string;
  department: string;
  location: string;
  application: string;
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
  filteredJobs: Job[] = [];
  paginatedJobs: Job[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  editingJob: Job | null = null;
  newJob: Partial<Job> = { job_title: '', company: '', department: '', location: '', application: '' };
  showJobModal: boolean = false;
  // No modal state needed for shortlist
  // Remove Math: any; and add a helper for min

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  constructor(
    private applicationService: ApplicationService,
    private shortlistCandidateService: ShortlistCandidateService
  ) {}

  shortlistCandidate(job: Job): void {
    // Add a candidate with visible name and position for shortlist table
    const candidate = {
      candidateId: 'auto-' + Date.now(),
      candidateName: job.job_title + ' Candidate', // Visible in Name column
      candidateEmail: job.company.replace(/\s+/g, '').toLowerCase() + '@example.com',
      candidateImage: '',
      jobId: job.id.toString(),
      jobTitle: job.job_title, // Visible in Position/Job Title column
      status: 'Shortlisted'
    };
    this.shortlistCandidateService.create(candidate).subscribe({
      next: () => {
        alert('Candidate shortlisted!');
      },
      error: (err: any) => {
        alert('Error shortlisting candidate: ' + (err?.error?.message || err.message || err));
      }
    });
  }

  // Removed modal and addShortlistCandidate logic

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.applicationService.getJobs().subscribe({
      next: (jobs: any[]) => {
        this.jobs = jobs.map(job => ({
          id: job.id,
          job_title: job.job_title,
          company: job.company,
          department: job.department,
          location: job.location,
          application: job.application
        }));
        this.filterJobs();
      },
      error: (error) => {
        console.error('Error fetching jobs:', error);
        this.jobs = [];
      }
    });
  }

  addJob(): void {
    if (!this.newJob.job_title || !this.newJob.company) return;
    this.applicationService.createJob({
      job_title: this.newJob.job_title,
      company: this.newJob.company,
      department: this.newJob.department,
      location: this.newJob.location,
      application: this.newJob.application
    }).subscribe(() => {
      this.fetchJobs();
      this.closeJobModal();
    });
  }

  editJob(job: Job): void {
    this.editingJob = { ...job };
    this.showJobModal = true;
  }

  updateJob(): void {
    if (!this.editingJob) return;
    this.applicationService.updateJob(this.editingJob.id, {
      job_title: this.editingJob.job_title,
      company: this.editingJob.company,
      department: this.editingJob.department,
      location: this.editingJob.location,
      application: this.editingJob.application
    }).subscribe(() => {
      this.fetchJobs();
      this.closeJobModal();
    });
  }

  deleteJob(id: number): void {
    this.applicationService.deleteJob(id).subscribe(() => {
      this.fetchJobs();
    });
  }

  openJobModal(): void {
    this.editingJob = null;
    this.newJob = { job_title: '', company: '', department: '', location: '', application: '' };
    this.showJobModal = true;
  }

  closeJobModal(): void {
    this.showJobModal = false;
    this.editingJob = null;
    this.newJob = { job_title: '', company: '', department: '', location: '', application: '' };
  }

  getApplicationsCount(jobId: number): number {
    // Implement logic if you have applications data, otherwise return 0
    return 0;
  }

  filterJobs(): void {
    this.filteredJobs = this.searchQuery
      ? this.jobs.filter(job =>
          job.job_title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(this.searchQuery.toLowerCase())
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

  // Application-related methods removed for job management only
}