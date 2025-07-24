import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApplicationService } from '../../../services/application.service'; // Assuming this path is correct
import { JobseekerSidebarComponent } from "../jobseeker-sidebar/jobseeker-sidebar.component"; // Assuming this path is correct
import { CommonModule, DatePipe } from '@angular/common'; // Added DatePipe for HTML
import { FormsModule } from '@angular/forms'; // Keep FormsModule for ngModel

// Interface for Job data
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
  postedDate: string; // Keep as string for consistency with your provided data
  companyLogo?: string; // Added for visual enhancement
  skills?: string[]; // Added for potential future filtering/display
  location: string; // Ensure location is part of Job interface
}

// Interface for Resume (if you were managing multiple resumes)
interface Resume {
  id: number;
  name: string;
  file?: File;
}

// Interface for Application data
interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  date: Date; // Keep as Date object for sorting
  status: string;
}

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.css'],
  standalone: true,
  imports: [JobseekerSidebarComponent, ReactiveFormsModule, CommonModule, FormsModule] // Ensure all modules are imported
})
export class ApplyJobComponent implements OnInit {
  applicationForm: FormGroup;
  isLoading = false;

  // Job Listing Data
  jobs: Job[] = [];
  filteredJobs: Job[] = []; // Jobs after search and filters
  jobSearchTerm: string = ''; // Separate search term for jobs list

  // Selected Job for forms/modals
  selectedJob: Job | null = null;
  showApplicationForm = false;
  showPolicyModal = false;
  policyAccepted = false;
  interviewCount = 0; // This will now be dynamically calculated from applications
  showSuccessMessage = false;
  submittedJobTitle: string = '';
  submittedJobCompany: string = '';

  // Application List Data
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  filterStatus: string = ''; // Filter for application status
  applicationSearchTerm: string = ''; // Search term for applications list
  sortColumn: keyof Application = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage: number = 0; // 0-indexed for pagination
  pageSize: number = 5; // Items per page for applications table (reduced for better demo)

  currentYear = new Date().getFullYear(); // Used in footer or copyright

  // View state: 'jobs' or 'applications'
  currentView: 'jobs' | 'applications' = 'jobs';

  // Dynamic Form Fields Configuration for Application Form
  formFields = [
    { id: 'fullName', label: 'Full Name', control: 'fullName', type: 'text', placeholder: 'Enter your full name', required: true, minLength: 2, fullWidth: false },
    { id: 'email', label: 'Email Address', control: 'email', type: 'text', placeholder: 'Enter your email', required: true, minLength: 5, fullWidth: false },
    { id: 'phone', label: 'Phone Number', control: 'phone', type: 'text', placeholder: 'Enter your phone number', required: true, minLength: 10, fullWidth: false },
    { id: 'resume', label: 'Upload Resume', control: 'resume', type: 'file', placeholder: '', required: true, fullWidth: false, accept: '.pdf,.doc,.docx', hint: 'PDF or Word document (max 2MB)' },
    { id: 'coverLetter', label: 'Cover Letter', control: 'coverLetter', type: 'textarea', placeholder: 'Write a brief cover letter...', required: false, fullWidth: true, rows: 4 }
  ];

  // Columns for the "My Applications" table
  applicationColumns = [
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    { key: 'date', label: 'Date Applied' },
    { key: 'status', label: 'Status' }
  ];

  // Tailwind classes for application status badges
  statusClasses: { [key: string]: string } = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Accepted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Interview': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-indigo-100 text-indigo-800', // Changed to indigo for distinctness
    'Submitted': 'bg-gray-100 text-gray-800'
  };

  // Filter options for application status
  statusFilters = [
    { value: '', label: 'All Statuses' }, // Added 'All Statuses'
    { value: 'Pending', label: 'Pending' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Accepted', label: 'Accepted' }
  ];

  // Not used in this component, but keeping for completeness if needed elsewhere
  resumes: Resume[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService // Injected service
  ) {
    // Initialize application form with validators
    this.applicationForm = this.fb.group({
      jobId: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Basic 10-digit phone validation
      resume: [null, Validators.required], // Will store File object or its name
      coverLetter: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    // Fetch jobs data
    this.fetchJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.filteredJobs = [...jobs]; // Initialize filteredJobs with all jobs
      this.isLoading = false;

      // Check if a specific jobId was passed in the route (for direct application link)
      const jobId = this.route.snapshot.paramMap.get('jobId');
      if (jobId) {
        const job = jobs.find(j => j.id === +jobId);
        if (job) {
          this.selectJob(job); // Automatically open policy modal for this job
        }
      }
    });

    // Simulate fetching existing applications
    this.fetchApplications().subscribe(apps => {
      this.applications = apps;
      this.applyApplicationFiltersAndSort(); // Apply initial filters/sort to applications
    });

    // Fetch resumes (if needed, currently not used in the form)
    this.fetchResumes().subscribe(resumes => {
      this.resumes = resumes;
    });
  }

  /**
   * Simulates fetching job data from an API.
   * @returns An Observable of Job array.
   */
  private fetchJobs(): Observable<Job[]> {
    // In a real application, this would be an HttpClient.get call to your backend
    return of([
      { id: 1, title: 'AI Research Scientist', company: 'Genworx.ai', location: 'Hyderabad', description: 'Develop advanced machine learning models and algorithms for cutting-edge AI products. Strong background in deep learning, NLP, or computer vision required. Collaborate with cross-functional teams to bring research to production.', type: 'Full-time', experience: 'Senior', remote: true, urgent: true, featured: true, postedDate: '2025-06-15', companyLogo: 'https://placehold.co/40x40/3B82F6/FFFFFF?text=GA', skills: ['Deep Learning', 'NLP', 'Python', 'PyTorch'] },
      { id: 2, title: 'Machine Learning Engineer', company: 'Innovate Minds', location: 'Bengaluru', description: 'Build scalable AI systems and deploy machine learning models into production environments. Work on optimizing model performance and integrating AI solutions into existing platforms.', type: 'Full-time', experience: 'Mid-level', remote: false, postedDate: '2025-06-10', companyLogo: 'https://placehold.co/40x40/6366F1/FFFFFF?text=IM', skills: ['MLOps', 'AWS', 'Python', 'TensorFlow'] },
      { id: 3, title: 'Data Scientist', company: 'Data Insights Co.', location: 'Chennai', description: 'Analyze complex datasets to extract actionable insights and inform business decisions. Develop statistical models and visualizations to present findings to stakeholders.', type: 'Contract', experience: 'Junior', remote: true, postedDate: '2025-06-05', companyLogo: 'https://placehold.co/40x40/EF4444/FFFFFF?text=DI', skills: ['R', 'SQL', 'Statistics', 'Tableau'] },
      { id: 4, title: 'Frontend Developer (Angular)', company: 'Web Solutions Ltd.', location: 'Hyderabad', description: 'Design and implement responsive and intuitive user interfaces using Angular. Collaborate with backend developers and UX designers to deliver seamless web applications.', type: 'Full-time', experience: 'Mid-level', remote: false, postedDate: '2025-06-20', companyLogo: 'https://placehold.co/40x40/10B981/FFFFFF?text=WS', skills: ['Angular', 'TypeScript', 'HTML', 'CSS'] },
      { id: 5, title: 'Backend Engineer (Node.js)', company: 'Cloud Services Inc.', location: 'Bengaluru', description: 'Develop and maintain robust and scalable backend services using Node.js. Design and implement APIs, manage databases, and ensure high performance and security.', type: 'Full-time', experience: 'Senior', remote: true, postedDate: '2025-06-22', companyLogo: 'https://placehold.co/40x40/F59E0B/FFFFFF?text=CS', skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'] },
      { id: 6, title: 'Product Designer', company: 'Design Innovators', location: 'Mumbai', description: 'Lead the product design process from concept to launch, focusing on user-centered design principles. Create wireframes, prototypes, and high-fidelity mockups.', type: 'Full-time', experience: 'Mid-level', remote: false, postedDate: '2025-06-18', companyLogo: 'https://placehold.co/40x40/6B7280/FFFFFF?text=DI', skills: ['Figma', 'Sketch', 'User Research', 'Prototyping'] },
      { id: 7, title: 'Cybersecurity Analyst', company: 'SecureTech', location: 'Chennai', description: 'Monitor, detect, and respond to security incidents. Conduct vulnerability assessments and implement security measures to protect systems and data.', type: 'Full-time', experience: 'Entry-level', remote: false, postedDate: '2025-06-12', companyLogo: 'https://placehold.co/40x40/06B6D4/FFFFFF?text=ST', skills: ['Network Security', 'Incident Response', 'CompTIA Security+'] },
      { id: 8, title: 'Technical Writer', company: 'DocuGenius', location: 'Pune', description: 'Create clear, concise, and comprehensive technical documentation for software products. Collaborate with engineers and product managers to ensure accuracy.', type: 'Contract', experience: 'Junior', remote: true, postedDate: '2025-06-08', companyLogo: 'https://placehold.co/40x40/8B5CF6/FFFFFF?text=DG', skills: ['Technical Writing', 'Markdown', 'API Documentation'] },
      { id: 9, title: 'Mobile App Developer (iOS)', company: 'AppCrafters', location: 'Bengaluru', description: 'Develop and maintain high-quality iOS applications. Work with Swift and Xcode to create intuitive and performant mobile experiences.', type: 'Full-time', experience: 'Mid-level', remote: false, postedDate: '2025-06-25', companyLogo: 'https://placehold.co/40x40/EC4899/FFFFFF?text=AC', skills: ['Swift', 'iOS SDK', 'Xcode', 'UI/UX'] },
      { id: 10, title: 'Cloud Architect', company: 'CloudScale', location: 'Hyderabad', description: 'Design and implement scalable, secure, and cost-effective cloud solutions on AWS, Azure, or GCP. Provide technical leadership and guidance.', type: 'Full-time', experience: 'Senior', remote: true, featured: true, postedDate: '2025-06-01', companyLogo: 'https://placehold.co/40x40/34D399/FFFFFF?text=CS', skills: ['AWS', 'Azure', 'GCP', 'Solution Architecture'] }
    ]);
  }

  /**
   * Simulates fetching existing application data.
   * @returns An Observable of Application array.
   */
  private fetchApplications(): Observable<Application[]> {
    // In a real application, this would fetch from a user's application history
    return of([
      { id: 101, jobId: 1, jobTitle: 'AI Research Scientist', company: 'Genworx.ai', date: new Date('2025-07-20T10:00:00Z'), status: 'Under Review' },
      { id: 102, jobId: 4, jobTitle: 'Frontend Developer (Angular)', company: 'Web Solutions Ltd.', date: new Date('2025-07-18T14:30:00Z'), status: 'Interview' },
      { id: 103, jobId: 2, jobTitle: 'Machine Learning Engineer', company: 'Innovate Minds', date: new Date('2025-07-15T09:15:00Z'), status: 'Rejected' },
      { id: 104, jobId: 5, jobTitle: 'Backend Engineer (Node.js)', company: 'Cloud Services Inc.', date: new Date('2025-07-22T11:45:00Z'), status: 'Accepted' },
      { id: 105, jobId: 3, jobTitle: 'Data Scientist', company: 'Data Insights Co.', date: new Date('2025-07-19T16:00:00Z'), status: 'Pending' },
      { id: 106, jobId: 6, jobTitle: 'Product Designer', company: 'Design Innovators', date: new Date('2025-07-16T12:00:00Z'), status: 'Under Review' },
      { id: 107, jobId: 7, jobTitle: 'Cybersecurity Analyst', company: 'SecureTech', date: new Date('2025-07-21T09:00:00Z'), status: 'Interview' },
      { id: 108, jobId: 8, jobTitle: 'Technical Writer', company: 'DocuGenius', date: new Date('2025-07-17T17:00:00Z'), status: 'Pending' },
      { id: 109, jobId: 9, jobTitle: 'Mobile App Developer (iOS)', company: 'AppCrafters', date: new Date('2025-07-14T10:30:00Z'), status: 'Rejected' },
      { id: 110, jobId: 10, jobTitle: 'Cloud Architect', company: 'CloudScale', date: new Date('2025-07-23T08:00:00Z'), status: 'Accepted' },
    ]);
  }

  /**
   * Simulates fetching resume data (not directly used in the form submission, but kept for context).
   * @returns An Observable of Resume array.
   */
  private fetchResumes(): Observable<Resume[]> {
    return of([
      { id: 1, name: 'AI Resume 2023.pdf' },
      { id: 2, name: 'Tech Resume 2024.pdf' },
    ]);
  }

  /**
   * Filters the list of available jobs based on a search term.
   * @param event The input event from the search bar.
   */
  filterJobs(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.jobSearchTerm = input.value.toLowerCase(); // Update job search term

    let tempJobs = [...this.jobs];

    if (this.jobSearchTerm) {
      tempJobs = tempJobs.filter(job =>
        job.title.toLowerCase().includes(this.jobSearchTerm) ||
        job.company.toLowerCase().includes(this.jobSearchTerm) ||
        job.description.toLowerCase().includes(this.jobSearchTerm) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(this.jobSearchTerm)))
      );
    }
    this.filteredJobs = tempJobs;
  }

  /**
   * Removes a specific filter chip (currently only for job search term).
   * @param filter The filter string to remove.
   */
  removeJobFilter(filter: string): void {
    if (filter === this.jobSearchTerm) {
      this.jobSearchTerm = '';
      this.filterJobs({ target: { value: '' } } as unknown as Event); // Trigger filterJobs to clear
    }
    // Extend this for other filter types if implemented
  }

  /**
   * Resets all job filters and search terms.
   */
  resetJobFilters(): void {
    this.jobSearchTerm = '';
    this.filteredJobs = [...this.jobs];
  }

  /**
   * Selects a job and opens the policy modal.
   * @param job The selected Job object, or null to close modals.
   */
  selectJob(job: Job | null): void {
    this.selectedJob = job;
    if (job) {
      this.showPolicyModal = true;
      this.policyAccepted = false; // Reset policy acceptance
      this.applicationForm.patchValue({ jobId: job.id }); // Set jobId in form
    } else {
      // Close all modals and reset form if no job is selected
      this.showPolicyModal = false;
      this.showApplicationForm = false;
      this.applicationForm.reset();
    }
  }

  /**
   * Closes the policy modal and clears the selected job.
   */
  closePolicyModal(): void {
    this.showPolicyModal = false;
    this.selectedJob = null; // Clear selected job if policy not accepted
    this.applicationForm.reset(); // Reset form if policy is rejected
  }

  /**
   * Proceeds to the application form if the policy is accepted.
   */
  proceedToApplication(): void {
    if (this.policyAccepted && this.selectedJob) {
      this.showPolicyModal = false;
      this.showApplicationForm = true;
      this.resetForm(); // Reset form for a new application
    }
  }

  /**
   * Handles file input for resume upload, including file size validation.
   * @param event The input event from the file input.
   */
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxFileSize = 2 * 1024 * 1024; // 2MB

      if (file.size > maxFileSize) {
        this.applicationForm.get('resume')?.setErrors({ fileTooLarge: true });
        this.applicationForm.get('resume')?.markAsTouched(); // Mark as touched to show error
      } else {
        this.applicationForm.patchValue({ resume: file }); // Store the File object
        this.applicationForm.get('resume')?.updateValueAndValidity(); // Re-validate
      }
    } else {
      this.applicationForm.patchValue({ resume: null });
      this.applicationForm.get('resume')?.updateValueAndValidity();
    }
  }

  /**
   * Helper to get file name for display in the form.
   * @param file The File object.
   * @returns The file name or 'Choose File'.
   */
  getFileName(file: File | null): string {
    return file ? file.name : 'Choose File';
  }

  /**
   * Submits the job application form.
   */
  submitApplication(): void {
    if (this.applicationForm.valid) {
      this.isLoading = true;
      const formValue = this.applicationForm.value;

      // Prepare application data for service call
      const applicationData = {
        jobId: formValue.jobId,
        firstName: formValue.fullName?.split(' ')[0] || '', // Extract first name
        fullName: formValue.fullName, // Keep full name for backend
        email: formValue.email,
        phone: formValue.phone,
        resume: formValue.resume, // Pass the File object as required by ApplicationData
        resumeName: formValue.resume ? (formValue.resume as File).name : '', // Send file name
        coverLetter: formValue.coverLetter || '',
        // Add other fields as per your backend API
      };

      console.log('Submitting Data:', applicationData); // Debug log

      // Simulate API call using ApplicationService
      this.applicationService.submitApplication(applicationData).subscribe({
        next: (response: any) => {
          // Create a new application object to add to the local list
          const newApplication: Application = {
            id: response.id || Math.floor(Math.random() * 100000), // Generate ID if not from backend
            jobId: formValue.jobId,
            jobTitle: this.selectedJob?.title || '',
            company: this.selectedJob?.company || '',
            date: new Date(response.createdAt || new Date()), // Use backend date or current date
            status: response.status || 'Submitted', // Default status
          };

          this.submittedJobTitle = this.selectedJob?.title || '';
          this.submittedJobCompany = this.selectedJob?.company || '';

          this.applications.unshift(newApplication); // Add new application to the beginning of the list
          this.applyApplicationFiltersAndSort(); // Re-apply filters/sort to update the applications table
          this.interviewCount = this.applications.filter(app => app.status === 'Interview').length; // Update interview count

          this.applicationForm.reset(); // Reset the form
          this.showApplicationForm = false; // Hide the form
          this.selectedJob = null; // Clear selected job
          this.isLoading = false; // Hide loading spinner
          this.showSuccessMessage = true; // Show success message
        },
        error: (error: any) => {
          console.error('Error submitting application:', error);
          this.isLoading = false;
          // Use a custom modal or toast for error messages instead of alert()
          alert('Failed to submit application. Please try again.');
        }
      });
    } else {
      // Mark all form fields as touched to display validation errors
      this.applicationForm.markAllAsTouched();
    }
  }

  /**
   * Closes the success message modal and navigates to the dashboard.
   */
  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.router.navigate(['/jobseeker-dashboard']); // Navigate to dashboard
  }

  /**
   * Resets the application form to its initial state.
   */
  resetForm(): void {
    this.applicationForm.reset();
    // Re-patch jobId if a job is still selected
    if (this.selectedJob) {
      this.applicationForm.patchValue({ jobId: this.selectedJob.id });
    }
    this.applicationForm.get('resume')?.setErrors(null); // Clear any file errors
  }

  /**
   * Filters the list of user applications based on status.
   * @param event The change event from the status filter dropdown.
   */
  filterApplications(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus = select.value;
    this.applyApplicationFiltersAndSort();
  }

  /**
   * Searches the list of user applications by job title or company.
   * @param event The input event from the search bar.
   */
  searchApplications(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.applicationSearchTerm = input.value.toLowerCase();
    this.applyApplicationFiltersAndSort();
  }

  /**
   * Applies all filters and sorting to the applications list.
   */
  applyApplicationFiltersAndSort(): void {
    let tempApplications = [...this.applications];

    // Apply status filter
    if (this.filterStatus) {
      tempApplications = tempApplications.filter(app => app.status.toLowerCase() === this.filterStatus.toLowerCase());
    }

    // Apply search filter
    if (this.applicationSearchTerm) {
      tempApplications = tempApplications.filter(app =>
        app.jobTitle.toLowerCase().includes(this.applicationSearchTerm) ||
        app.company.toLowerCase().includes(this.applicationSearchTerm)
      );
    }

    // Apply sorting
    tempApplications.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (valA instanceof Date && valB instanceof Date) {
        return this.sortDirection === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }
      return 0;
    });

    // Update filteredApplications and re-paginate
    this.filteredApplications = tempApplications;
    this.paginateApplications();
  }

  /**
   * Paginates the filtered applications for display.
   */
  paginateApplications(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredApplications = this.filteredApplications.slice(startIndex, endIndex);
  }

  /**
   * Navigates to the next page of applications.
   */
  nextPage(): void {
    // Check against the full filteredApplications array length, not just the current page's slice
    if ((this.currentPage + 1) * this.pageSize < this.applications.filter(app =>
      (this.filterStatus ? app.status.toLowerCase() === this.filterStatus.toLowerCase() : true) &&
      (this.applicationSearchTerm ? (app.jobTitle.toLowerCase().includes(this.applicationSearchTerm) || app.company.toLowerCase().includes(this.applicationSearchTerm)) : true)
    ).length) {
      this.currentPage++;
      this.applyApplicationFiltersAndSort(); // Re-apply filters/sort to get correct slice
    }
  }

  /**
   * Navigates to the previous page of applications.
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.applyApplicationFiltersAndSort(); // Re-apply filters/sort to get correct slice
    }
  }

  /**
   * Calculates the total number of pages for applications.
   */
  get totalApplicationPages(): number {
    // Calculate total pages based on the currently filtered applications, not all applications
    return Math.ceil(this.applications.filter(app =>
      (this.filterStatus ? app.status.toLowerCase() === this.filterStatus.toLowerCase() : true) &&
      (this.applicationSearchTerm ? (app.jobTitle.toLowerCase().includes(this.applicationSearchTerm) || app.company.toLowerCase().includes(this.applicationSearchTerm)) : true)
    ).length / this.pageSize);
  }

  /**
   * Generates an array of page numbers for pagination controls.
   */
  getApplicationPageNumbers(): number[] {
    const pages = [];
    for (let i = 0; i < this.totalApplicationPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Navigates to a specific page of applications.
   * @param page The page number (0-indexed) to navigate to.
   */
  goToApplicationPage(page: number): void {
    this.currentPage = page;
    this.applyApplicationFiltersAndSort();
  }

  /**
   * Navigates to the jobseeker dashboard.
   */
  goToDashboard(): void {
    this.router.navigate(['/jobseeker-dashboard']);
  }

  /**
   * Toggles between 'jobs' and 'applications' views.
   * @param view The view to switch to.
   */
  switchView(view: 'jobs' | 'applications'): void {
    this.currentView = view;
    // Reset any modals or forms when switching views
    this.showApplicationForm = false;
    this.showPolicyModal = false;
    this.showSuccessMessage = false;
    this.selectedJob = null; // Clear selected job when switching views
    if (view === 'applications') {
      this.applyApplicationFiltersAndSort(); // Ensure applications are correctly filtered/sorted
    } else {
      this.resetJobFilters(); // Reset job filters when switching to jobs view
    }
  }
}