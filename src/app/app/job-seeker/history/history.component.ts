import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaginatePipe } from '../../../shared/pipes/paginate.pipe';
import { RouterModule } from '@angular/router';
import { JobseekerBannerComponent } from '../jobseeker-banner/jobseeker-banner.component';
import { JobseekerSidebarComponent } from '../jobseeker-sidebar/jobseeker-sidebar.component';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  date: Date;
  status: 'Under Review' | 'Interview' | 'Rejected';
}

@Component({
  selector: 'app-history',
  standalone: true,
templateUrl: './history.component.html',
styleUrl: './history.component.css',
imports: [CommonModule,FormsModule,PaginatePipe, RouterModule,JobseekerSidebarComponent],
})
export class HistoryComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  isLoading: boolean = true;
  isDarkMode: boolean = false;
  filterStatus: string = '';
  sortColumn: keyof Application | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulate fetching data
    this.loadApplications();
  }

  loadApplications(): void {
    // Mock data (replace with actual API call)
    this.applications = [
      { id: 1, jobTitle: 'Software Engineer', company: 'Tech Corp', date: new Date('2025-06-01'), status: 'Under Review' },
      { id: 2, jobTitle: 'Product Manager', company: 'Innovate Inc', date: new Date('2025-05-15'), status: 'Interview' },
      { id: 3, jobTitle: 'Data Analyst', company: 'Data Co', date: new Date('2025-04-10'), status: 'Rejected' },
      // Add more mock data as needed
    ];
    this.isLoading = false;
    this.applyFilters();
  }

  getApplicationCount(): number {
    return this.applications.length;
  }

  getFilteredApplications(): Application[] {
    return this.filteredApplications;
  }

  applyFilters(): void {
    let filtered = this.applications;

    // Apply status filter
    if (this.filterStatus) {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }


    // Update pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.filteredApplications = filtered;
  }

  sortApplications(column: keyof Application): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  handlePageEvent(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  viewApplicationDetails(id: number): void {
    this.router.navigate(['/application', id]);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    // Optionally apply dark mode styles to the document
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}