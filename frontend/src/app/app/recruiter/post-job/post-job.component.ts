
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';
import { JobService } from '../../../services/job.service';

interface Job {
  job_id?: string;
  title: string;
  department: string | number; // Accepts either department name or id
  location: string;
  description: string;
  status: string;
  postedDate?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.css'],
  imports: [CommonModule, FormsModule, RecruiterSidebarComponent, HrHeaderComponent, HrFooterComponent],
  standalone: true
})
export class PostJobComponent implements OnInit {
  jobs: Job[] = [];

  departments: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Product' },
    { id: 3, name: 'Design' },
    { id: 4, name: 'Marketing' }
  ];

  notifications: Notification[] = [];

  // State
  filteredJobs: Job[] = [];
  paginatedJobs: Job[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  showPostJobModal: boolean = false;
  showEditJobModal: boolean = false;
  showNotificationDropdown: boolean = false;
  showUserDropdown: boolean = false;

  // Form data
  newJob: Job = {
    title: '',
    department: '',
    location: '',
    description: '',
    status: 'Open'
  };

  editJob: Job = { ...this.newJob };

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.filterJobs();
    });
  }

  // Filter jobs based on search query and status
  filterJobs(): void {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch =
        job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        this.getDepartmentName(job.department).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || job.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
    this.updatePaginatedJobs();
  }

  // Update paginated jobs for current page
  updatePaginatedJobs(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedJobs = this.filteredJobs.slice(start, end);
  }

  // Pagination controls
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedJobs();
    }
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredJobs.length) {
      this.currentPage++;
      this.updatePaginatedJobs();
    }
  }

  // Modal controls
  openPostJobModal(): void {
    this.newJob = {
      title: '',
      department: '',
      location: '',
      description: '',
      status: 'Open'
    };
    this.showPostJobModal = true;
  }

  closePostJobModal(): void {
    this.showPostJobModal = false;
  }

  openEditJobModal(job: Job): void {
    this.editJob = { ...job };
    this.showEditJobModal = true;
  }

  closeEditJobModal(): void {
    this.showEditJobModal = false;
  }

  // Job actions
  postJob(): void {
    if (this.isJobFormValid()) {
      this.jobService.createJob(this.newJob).subscribe(() => {
        this.closePostJobModal();
        this.loadJobs();
      });
    }
  }

  updateJob(): void {
    if (this.isEditJobFormValid() && this.editJob.job_id) {
      this.jobService.updateJob(this.editJob.job_id, this.editJob).subscribe(() => {
        this.closeEditJobModal();
        this.loadJobs();
      });
    }
  }

  deleteJob(job_id: string): void {
    this.jobService.deleteJob(job_id).subscribe(() => {
      this.loadJobs();
    });
  }

  // Form validation
  isJobFormValid(): boolean {
    return !!this.newJob.title && !!this.newJob.department && !!this.newJob.location && !!this.newJob.description && !!this.newJob.status;
  }

  isEditJobFormValid(): boolean {
    return !!this.editJob.title && !!this.editJob.department && !!this.editJob.location && !!this.editJob.description && !!this.editJob.status;
  }

  // Status color mapping
  getStatusColor(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get department name by ID or return string if already name
  getDepartmentName(department: string | number): string {
    if (typeof department === 'string' && isNaN(Number(department))) {
      // If department is already a name
      return department;
    }
    const dept = this.departments.find(d => d.id === +department);
    return dept ? dept.name : (typeof department === 'string' ? department : 'Unknown');
  }

  // Dropdown controls
  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.showNotificationDropdown = false;
    }
  }

  // Logout
  logout(): void {
    console.log('User logged out');
  }

  // Refresh data
  refreshData(): void {
    this.loadJobs();
  }
}
