import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';
import { HrHeaderComponent } from '../hr-header/hr-header.component';
import { HrFooterComponent } from '../hr-footer/hr-footer.component';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  postedDate: string;
  description: string;
  status: string;
  statusColor: string;
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
  // Data
  jobs: Job[] = [
    {
      id: 1,
      title: 'Software Engineer',
      department: '1',
      location: 'San Francisco, CA',
      postedDate: '2025-07-01',
      description: 'Develop and maintain web applications.',
      status: 'Open',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: '2',
      location: 'New York',
      postedDate: '2025-06-25',
      description: 'Lead product strategy and development.',
      status: 'Closed',
      statusColor: 'bg-red-100 text-red-800'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: '3',
      location: 'San Francisco, CA',
      postedDate: '2025-06-20',
      description: 'Design user-friendly interfaces.',
      status: 'Draft',
      statusColor: 'bg-yellow-100 text-yellow-800'
    }
  ];

  departments: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Product' },
    { id: 3, name: 'Design' },
    { id: 4, name: 'Marketing' }
  ];

  notifications: Notification[] = [
    { id: 1, message: 'New job posted: Software Engineer', time: '2 hours ago', icon: 'fas fa-briefcase' },
    { id: 2, message: 'Job status updated: Product Manager', time: '1 day ago', icon: 'fas fa-sync-alt' }
  ];

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
    id: 0,
    title: '',
    department: '',
    location: '',
    postedDate: '',
    description: '',
    status: 'Open',
    statusColor: 'bg-green-100 text-green-800'
  };

  editJob: Job = { ...this.newJob };

  constructor() {}

  ngOnInit(): void {
    this.filterJobs();
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
      id: 0,
      title: '',
      department: '',
      location: '',
      postedDate: '',
      description: '',
      status: 'Open',
      statusColor: 'bg-green-100 text-green-800'
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
      const newId = this.jobs.length > 0 ? Math.max(...this.jobs.map(j => j.id)) + 1 : 1;
      this.newJob.id = newId;
      this.newJob.postedDate = new Date().toISOString().split('T')[0];
      this.newJob.statusColor = this.getStatusColor(this.newJob.status);
      this.jobs.push({ ...this.newJob });
      this.notifications.push({
        id: this.notifications.length + 1,
        message: `New job posted: ${this.newJob.title}`,
        time: 'Just now',
        icon: 'fas fa-briefcase'
      });
      this.closePostJobModal();
      this.filterJobs();
    }
  }

  updateJob(): void {
    if (this.isEditJobFormValid()) {
      const index = this.jobs.findIndex(j => j.id === this.editJob.id);
      if (index !== -1) {
        this.editJob.statusColor = this.getStatusColor(this.editJob.status);
        this.jobs[index] = { ...this.editJob };
        this.notifications.push({
          id: this.notifications.length + 1,
          message: `Job updated: ${this.editJob.title}`,
          time: 'Just now',
          icon: 'fas fa-sync-alt'
        });
        this.closeEditJobModal();
        this.filterJobs();
      }
    }
  }

  deleteJob(id: number): void {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      this.jobs = this.jobs.filter(j => j.id !== id);
      this.notifications.push({
        id: this.notifications.length + 1,
        message: `Job deleted: ${job.title}`,
        time: 'Just now',
        icon: 'fas fa-trash'
      });
      this.filterJobs();
    }
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

  // Get department name by ID
  getDepartmentName(departmentId: string): string {
    const dept = this.departments.find(d => d.id === +departmentId);
    return dept ? dept.name : 'Unknown';
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
    this.filterJobs();
  }
}
