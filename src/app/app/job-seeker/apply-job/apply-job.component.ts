import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApplicationService } from '../../../services/application.service';
import { JobseekerSidebarComponent } from "../jobseeker-sidebar/jobseeker-sidebar.component";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms';

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  type: string;
  experience: string;
  remote: boolean;
  urgent?: boolean;
  featured?: boolean;
  postedDate: string;
}
interface Resume {
  id: number;
  name: string;
  file?: File;
}

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  date: Date;
  status: string;
}

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.css'],
  standalone: true,
  imports: [JobseekerSidebarComponent,ReactiveFormsModule, CommonModule,FormsModule]
})
export class ApplyJobComponent implements OnInit {
  applicationForm: FormGroup;
  isLoading = false;
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  selectedJob: Job | null = null;
  resumes: Resume[] = [];
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  showApplicationForm = false;
  showPolicyModal = false;
  policyAccepted = false;
  interviewCount = 0;
  showSuccessMessage = false;
  submittedJobTitle: string = '';
  submittedJobCompany: string = '';
  currentYear = new Date().getFullYear();
  filterStatus: string = '';
  sortColumn: keyof Application = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage: number = 0;
  pageSize: number = 10;
  activeFilters: string[] = [];

  formFields = [
    { id: 'fullName', label: 'Full Name', control: 'fullName', type: 'text', placeholder: 'Enter your full name', required: true, minLength: 2, fullWidth: false },
    { id: 'email', label: 'Email Address', control: 'email', type: 'text', placeholder: 'Enter your email', required: true, minLength: 5, fullWidth: false },
    { id: 'phone', label: 'Phone Number', control: 'phone', type: 'text', placeholder: 'Enter your phone number', required: true, minLength: 10, fullWidth: false },
    { id: 'resume', label: 'Resume', control: 'resume', type: 'file', placeholder: '', required: true, fullWidth: false, accept: '.pdf,.doc,.docx', hint: 'PDF or Word document (max 2MB)' },
    { id: 'coverLetter', label: 'Cover Letter', control: 'coverLetter', type: 'textarea', placeholder: 'Write a brief cover letter...', required: false, fullWidth: true, rows: 4 }
  ];

  applicationColumns = [
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    { key: 'date', label: 'Date Applied' },
    { key: 'status', label: 'Status' }
  ];

  statusClasses = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Accepted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Interview': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    'Submitted': 'bg-gray-100 text-gray-800'
  };

  statusFilters = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Accepted', label: 'Accepted' }
  ];
Math: any;
column: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService
  ) {
    this.applicationForm = this.fb.group({
      jobId: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      resume: [null, Validators.required],
      coverLetter: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.filteredJobs = [...jobs];
      const jobId = this.route.snapshot.paramMap.get('jobId');
      if (jobId) {
        const job = jobs.find(j => j.id === +jobId);
        if (job) {
          this.selectJob(job);
        }
      }
      this.isLoading = false;
    });

    this.fetchResumes().subscribe(resumes => {
      this.resumes = resumes;
    });
  }

  private fetchJobs(): Observable<Job[]> {
    return of([
      { id: 1, title: 'AI Research Scientist', company: 'Genworx.ai', description: 'Develop advanced machine learning models...', type: 'Full-time', experience: 'Senior', remote: true, urgent: true, featured: true, postedDate: '2025-06-15' },
      { id: 2, title: 'Machine Learning Engineer', company: 'Genworx.ai', description: 'Build scalable AI systems...', type: 'Full-time', experience: 'Mid-level', remote: false, postedDate: '2025-06-10' },
      { id: 3, title: 'Data Scientist', company: 'Genworx.ai', description: 'Analyze complex datasets...', type: 'Contract', experience: 'Junior', remote: true, postedDate: '2025-06-05' },
    ]);
  }

  private fetchResumes(): Observable<Resume[]> {
    return of([
      { id: 1, name: 'AI Resume 2023.pdf' },
      { id: 2, name: 'Tech Resume 2024.pdf' },
    ]);
  }

  filterJobs(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    this.filteredJobs = searchTerm ? this.jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm)
    ) : [...this.jobs];
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.filteredJobs = [...this.jobs];
  }

  resetFilters(): void {
    this.activeFilters = [];
    this.filteredJobs = [...this.jobs];
  }

  selectJob(job: Job | null): void {
    this.selectedJob = job;
    if (job) {
      this.showPolicyModal = true;
      this.policyAccepted = false;
      this.applicationForm.patchValue({ jobId: job.id });
    } else {
      this.showPolicyModal = false;
      this.showApplicationForm = false;
      this.applicationForm.reset();
    }
  }

  closePolicyModal(): void {
    this.showPolicyModal = false;
    this.selectedJob = null;
    this.applicationForm.reset();
  }

  proceedToApplication(): void {
    if (this.policyAccepted) {
      this.showPolicyModal = false;
      this.showApplicationForm = true;
    }
  }

  submitApplication(): void {
    if (this.applicationForm.valid) {
      this.isLoading = true;
      const formValue = this.applicationForm.value;
      const applicationData = {
        jobId: formValue.jobId,
        firstName: formValue.fullName.split(' ')[0] || '',
        email: formValue.email,
        phone: formValue.phone,
        resume: formValue.resume ? formValue.resume.name : '',
        coverLetter: formValue.coverLetter || '',
      };
      console.log('Submitting Data:', applicationData); // Debug log
      this.applicationService.submitApplication(applicationData).subscribe({
        next: (response: any) => {
          const newApplication: Application = {
            id: response.id,
            jobId: formValue.jobId,
            jobTitle: this.selectedJob?.title || '',
            company: this.selectedJob?.company || '',
            date: new Date(response.createdAt || new Date()),
            status: response.status || 'Under Review',
          };
          this.submittedJobTitle = this.selectedJob?.title || '';
          this.submittedJobCompany = this.selectedJob?.company || '';
          this.applications.unshift(newApplication);
          this.filteredApplications = [...this.applications];
          this.interviewCount = this.applications.filter(app => app.status === 'Interview').length;
          this.applicationForm.reset();
          this.showApplicationForm = false;
          this.selectedJob = null;
          this.isLoading = false;
          this.showSuccessMessage = true;
        },
        error: (error: any) => {
          console.error('Error submitting application:', error);
          this.isLoading = false;
          alert('Failed to submit application. Please try again.');
        }
      });
    } else {
      this.applicationForm.markAllAsTouched();
    }
  }

  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.router.navigate(['/jobseeker-dashboard']);
  }

  resetForm(): void {
    this.applicationForm.reset();
    if (this.selectedJob) {
      this.applicationForm.patchValue({ jobId: this.selectedJob.id });
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        this.applicationForm.get('resume')?.setErrors({ fileTooLarge: true });
      } else {
        this.applicationForm.patchValue({ resume: file });
        this.applicationForm.get('resume')?.updateValueAndValidity();
      }
    }
  }

  filterApplications(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus = select.value;
    this.filteredApplications = this.filterStatus
      ? this.applications.filter(app => app.status.toLowerCase() === this.filterStatus.toLowerCase())
      : [...this.applications];
  }

  searchApplications(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    this.filteredApplications = searchTerm
      ? this.applications.filter(app =>
          app.jobTitle.toLowerCase().includes(searchTerm) ||
          app.company.toLowerCase().includes(searchTerm)
        )
      : [...this.applications];
  }

  sortApplications(column: keyof Application): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filteredApplications.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (valA instanceof Date && valB instanceof Date) {
        return this.sortDirection === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }
      return 0;
    });
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.filteredApplications.length) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/jobseeker-dashboard']);
  }
}