import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';


interface Job {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'draft';
  postedBy: string;
  postedDate: Date;
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

  ngOnInit(): void {
    this.loadJobs();
    this.generateMockActivities();
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
    this.jobs = [
      {
        id: 'job1',
        title: 'Software Engineer',
        description: 'Develop web applications.',
        status: 'open',
        postedBy: 'HR Manager 1',
        postedDate: new Date('2025-07-03T10:00:00+05:30'),
      },
      {
        id: 'job2',
        title: 'HR Specialist',
        description: 'Manage recruitment processes.',
        status: 'closed',
        postedBy: 'HR Manager 2',
        postedDate: new Date('2025-07-02T14:30:00+05:30'),
      },
      {
        id: 'job3',
        title: 'Data Analyst',
        description: 'Analyze business data.',
        status: 'draft',
        postedBy: 'HR Manager 1',
        postedDate: new Date('2025-07-01T09:15:00+05:30'),
      },
    ];
    this.filterJobs();
  }

  generateMockActivities(): void {
    this.activities = [
      {
        jobTitle: 'Software Engineer',
        action: 'Status changed',
        details: 'Moved to open',
        timestamp: new Date('2025-07-04T22:00:00+05:30'),
      },
      {
        jobTitle: 'HR Specialist',
        action: 'Closed',
        details: 'Job closed by HR',
        timestamp: new Date('2025-07-04T20:30:00+05:30'),
      },
    ];
  }

  filterJobs(): void {
    this.filteredJobs = this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        (this.filterStatus ? job.status === this.filterStatus : true) &&
        (!this.filterDate ||
          new Date(job.postedDate).toISOString().split('T')[0] === this.filterDate),
    );
    this.totalJobs = this.filteredJobs.length;
    this.updateTabCounts();
    this.updatePagination();
  }

  updateTabCounts(): void {
    this.tabs[0].count = this.filteredJobs.length;
    this.tabs[1].count = this.filteredJobs.filter((j) => j.status === 'open').length;
    this.tabs[2].count = this.filteredJobs.filter((j) => j.status === 'closed').length;
  }

  setActiveTab(tab: 'all' | 'open' | 'closed'): void {
    this.activeTab = tab;
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
      if (field === 'postedDate' && valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
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