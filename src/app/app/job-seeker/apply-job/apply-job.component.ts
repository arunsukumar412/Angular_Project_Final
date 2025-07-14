import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

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

interface FormField {
  id: string;
  label: string;
  control: string;
  type: string;
  placeholder: string;
  required: boolean;
  minLength?: number;
  fullWidth: boolean;
  accept?: string;
  hint?: string;
  rows?: number;
  options?: { value: string; label: string }[];
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, JobseekerSidebarComponent,DatePipe],
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

  formFields: FormField[] = [
    {
      id: 'fullName',
      label: 'Full Name',
      control: 'fullName',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
      minLength: 2,
      fullWidth: false
    },
    {
      id: 'email',
      label: 'Email Address',
      control: 'email',
      type: 'text',
      placeholder: 'Enter your email',
      required: true,
      minLength: 5,
      fullWidth: false
    },
    {
      id: 'phone',
      label: 'Phone Number',
      control: 'phone',
      type: 'text',
      placeholder: 'Enter your phone number',
      required: true,
      minLength: 10,
      fullWidth: false
    },
    {
      id: 'coverLetter',
      label: 'Cover Letter',
      control: 'coverLetter',
      type: 'textarea',
      placeholder: 'Write a brief cover letter...',
      required: false,
      fullWidth: true,
      rows: 4
    }
  ];

  tableColumns = [
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    { key: 'date', label: 'Date Applied' },
    { key: 'status', label: 'Status' }
  ];

  statusClasses: { [key: string]: string } = {
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
applicationColumns: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
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
    
    this.fetchApplications().subscribe(applications => {
      this.applications = applications;
      this.filteredApplications = [...applications];
      this.interviewCount = applications.filter(app => app.status === 'Interview').length;
    });
  }

  private resumeValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const group = form as FormGroup;
    const resumeId = group.get('resumeId')?.value;
    const resumeFile = group.get('resumeFile')?.value;
    return resumeId || resumeFile ? null : { resumeRequired: true };
  }

  private fetchJobs(): Observable<Job[]> {
    return of([
      { 
        id: 1, 
        title: 'AI Research Scientist', 
        company: 'Genworx.ai', 
        description: 'Develop advanced machine learning models for cutting-edge AI applications.',
        type: 'Full-time',
        experience: 'Senior',
        remote: true,
        urgent: true,
        featured: true,
        postedDate: '2025-06-15'
      },
      { 
        id: 2, 
        title: 'Machine Learning Engineer', 
        company: 'Genworx.ai', 
        description: 'Build scalable AI systems for real-time data processing.',
        type: 'Full-time',
        experience: 'Mid-level',
        remote: false,
        postedDate: '2025-06-10'
      },
      { 
        id: 3, 
        title: 'Data Scientist', 
        company: 'Genworx.ai', 
        description: 'Analyze complex datasets to drive AI-driven business insights.',
        type: 'Contract',
        experience: 'Junior',
        remote: true,
        postedDate: '2025-06-05'
      },
    ]);
  }

  private fetchResumes(): Observable<Resume[]> {
    return of([
      { id: 1, name: 'AI Resume 2023.pdf' },
      { id: 2, name: 'Tech Resume 2024.pdf' },
    ]);
  }

  private fetchApplications(): Observable<Application[]> {
    return of([
      { id: 1, jobId: 1, jobTitle: 'AI Research Scientist', company: 'Genworx.ai', date: new Date('2025-06-15'), status: 'Under Review' },
      { id: 2, jobId: 2, jobTitle: 'Machine Learning Engineer', company: 'Genworx.ai', date: new Date('2025-06-10'), status: 'Interview' },
    ]);
  }

  filterJobs(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredJobs = [...this.jobs];
      return;
    }
    
    this.filteredJobs = this.jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) || 
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm)
    );
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    // Implement filter logic here
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
      setTimeout(() => {
        const formValue = this.applicationForm.value;
        const newApplication: Application = {
          id: this.applications.length + 1,
          jobId: formValue.jobId,
          jobTitle: this.selectedJob?.title || '',
          company: this.selectedJob?.company || '',
          date: new Date(),
          status: 'Under Review',
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
      }, 1000);
    } else {
      this.applicationForm.markAllAsTouched();
    }
  }

  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
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
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.applicationForm.get('resume')?.setErrors({ fileTooLarge: true });
      } else {
        this.applicationForm.patchValue({ resume: file });
        this.applicationForm.get('resume')?.updateValueAndValidity();
      }
    }
  }

  validateField(field: string): void {
    const control = this.applicationForm.get(field);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  filterApplications(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus = select.value;
    
    this.filteredApplications = this.filterStatus
      ? this.applications.filter(app => 
          app.status.toLowerCase() === this.filterStatus.toLowerCase())
      : [...this.applications];
  }

  searchApplications(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    
    if (!searchTerm) {
      this.filteredApplications = [...this.applications];
      return;
    }
    
    this.filteredApplications = this.applications.filter(app => 
      app.jobTitle.toLowerCase().includes(searchTerm) || 
      app.company.toLowerCase().includes(searchTerm)
    );
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
        return this.sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else if (valA instanceof Date && valB instanceof Date) {
        return this.sortDirection === 'asc' 
          ? valA.getTime() - valB.getTime() 
          : valB.getTime() - valA.getTime();
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