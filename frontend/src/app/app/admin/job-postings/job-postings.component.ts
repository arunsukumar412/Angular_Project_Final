import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';


interface Job {
  job_id: string;
  title: string;
  description: string;
  location?: string;
  company?: string;
  posted_by?: string;
  status: 'open' | 'closed' | 'draft';
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface Activity {
  jobTitle: string;
  action: string;
  details: string;
  timestamp: Date;
}

interface Log {
  message: string;
  timestamp: Date;
}

interface Tab {
  label: string;
  value: 'all' | 'open' | 'closed';
  count: number;
}

@Component({
  selector: 'app-job-postings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent,AdminFooterComponent,AdminHeaderComponent],
  templateUrl: './job-postings.component.html',
  styleUrls: ['./job-postings.component.css'],
})
export class JobPostingsComponent implements OnInit, OnDestroy {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  showSidebar = false;
  searchQuery = '';
  filterStatus: 'open' | 'closed' | 'draft' | '' = '';
  filterDate: string | null = null;
  activeTab: 'all' | 'open' | 'closed' = 'all';
  activities: Activity[] = [];
  activityLog: Log[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  startIndex = 0;
  endIndex = 0;
  totalJobs = 0;
  currentUser = 'Admin';
  currentDate = new Date('2025-07-04T23:53:00+05:30'); // 11:53 PM IST, July 04, 2025
  currentYear = this.currentDate.getFullYear();
  version = '2.4.1';
  maxJobs = 50;
  remainingJobs = 0;
  showUserDropdown = false;

  tabs: Tab[] = [
    { label: 'All Jobs', value: 'all', count: 0 },
    { label: 'Open Jobs', value: 'open', count: 0 },
    { label: 'Closed Jobs', value: 'closed', count: 0 },
  ];

  private sortField: keyof Job = 'title';
  private sortDirection: 'asc' | 'desc' = 'asc';
  private activityLogInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadJobs();
    this.updateTabCounts();
    this.calculateRemainingJobs();
    this.startActivityLogging();
  }

  ngOnDestroy(): void {
    if (this.activityLogInterval) {
      clearInterval(this.activityLogInterval);
      this.activityLogInterval = null;
    }
  }

  loadJobs(): void {
    this.http.get<Job[]>('/api/job-postings').subscribe({
      next: (jobs) => {
        // Map jobs to ensure posted_date is available for UI
        this.jobs = jobs.map(job => ({
          ...job,
          posted_date: job['posted_date'] || job.created_at || job['postedDate'] || '',
          posted_by: job.posted_by || job['postedBy'] || job['posted_by_name'] || '',
        }));
        this.filterJobs();
        this.calculateRemainingJobs();
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.logActivity('Failed to load jobs from backend.');
      }
    });
  }

  // Removed generateMockActivities

  filterJobs(): void {
    this.filteredJobs = (this.jobs || []).filter((job: Job) => {
      if (!job || !job.title) return false;
      const matchesTitle = job.title.toLowerCase().includes((this.searchQuery || '').toLowerCase());
      const matchesStatus = this.filterStatus ? job.status === this.filterStatus : true;
      let matchesDate = true;
      if (this.filterDate) {
        // Try both created_at and postedDate for compatibility
        const jobDate = job.created_at || (job as any).postedDate;
        if (jobDate) {
          matchesDate = new Date(jobDate).toISOString().split('T')[0] === this.filterDate;
        } else {
          matchesDate = false;
        }
      }
      return matchesTitle && matchesStatus && matchesDate;
    });
    this.totalJobs = this.filteredJobs.length;
    this.updateTabCounts();
    this.updatePagination();
  }

  updateTabCounts(): void {
    this.tabs[0].count = this.filteredJobs.length;
    this.tabs[1].count = this.filteredJobs.filter((j: Job) => j.status === 'open').length;
    this.tabs[2].count = this.filteredJobs.filter((j: Job) => j.status === 'closed').length;
  }

  setActiveTab(tab: 'all' | 'open' | 'closed'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.filterJobs();
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  calculateRemainingJobs(): void {
    this.remainingJobs = this.maxJobs - this.jobs.length;
  }

  sortTable(field: keyof Job): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredJobs.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      // Sort by posted_date if requested
      if (field === 'posted_date') {
        const dateA = valueA ? new Date(valueA) : new Date(0);
        const dateB = valueB ? new Date(valueB) : new Date(0);
        return this.sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      return this.sortDirection === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.endIndex < this.totalJobs) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  updatePagination(): void {
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalJobs);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout(): void {
    console.log('Logged out');
  }

  openPolicy(type: string): void {
    console.log(`Opening ${type} policy`);
  }

  openContact(): void {
    console.log('Opening contact form');
  }

  logActivity(message: string): void {
    this.activityLog.unshift({ message, timestamp: new Date() });
    if (this.activityLog.length > 10) {
      this.activityLog.pop();
    }
  }

  startActivityLogging(): void {
    this.activityLogInterval = setInterval(() => {
      this.logActivity(`System checked at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    }, 300000);
  }
}