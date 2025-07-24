import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSyncAlt, 
  faDownload, 
  faFilter, 
  faSearch, 
  faUsers, 
  faUserCheck, 
  faClock, 
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faUserTie,
  faFileAlt,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { AdminFooterComponent } from "../admin-footer/admin-footer.component";

interface Report {
  id: number;
  user: string;
  email?: string;
  position: string;
  jobId?: number;
  status: string;
  updatedAt: string;
  [key: string]: any;
}

interface HRMetrics {
  totalInterviews: number;
  hrCount: number;
  activeCandidates: number;
  hiringSuccessRate: number;
  hrHiredPeople: number;
}

@Component({
  selector: 'app-admin-report-management',
  templateUrl: './admin-report-management.component.html',
  styleUrls: ['./admin-report-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SidebarComponent, AdminHeaderComponent, AdminFooterComponent],
})
export class AdminReportManagementComponent implements OnInit {
  // Font Awesome icons
  faSyncAlt = faSyncAlt;
  faDownload = faDownload;
  faFilter = faFilter;
  faSearch = faSearch;
  faUsers = faUsers;
  faUserCheck = faUserCheck;
  faClock = faClock;
  faChartLine = faChartLine;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  // Component state
  currentUser = 'Admin';
  hrMetrics: HRMetrics = {
    totalInterviews: 0,
    hrCount: 0,
    activeCandidates: 0,
    hiringSuccessRate: 0,
    hrHiredPeople: 0
  };

  // Data
  candidateReports: Report[] = [];
  paginatedCandidateReports: Report[] = [];
  // Users from backend 'users' table
  usersFromBackend: any[] = [];

  // Filters
  filterStatus = '';
  filterDateStart = '';
  filterDateEnd = '';
  searchQuery = '';
  showFilters = false;

  // Pagination
  candidatePage = 1;
  itemsPerPage = 6; // Reduced to fit square cards better

  // Export Modal
  showExportModal = false;
  exportFormat = 'CSV';
  includeAll = true;
  includeSelected = false;
  faTachometerAlt: IconProp | undefined;
  faUserTie: IconProp = faUserTie;
  faFileAlt: IconProp = faFileAlt;
  faBell: IconProp = faBell;
  selectedReport: any;

  // Toast
  toastMessage: string = '';
  toastOpacity: number = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchAdminUsers();
    this.fetchAllUsers();
  }

  // Fetch all users from backend 'users' table
  fetchAllUsers(): void {
    this.http.get<any[]>('/api/users').subscribe({
      next: (users) => {
        this.usersFromBackend = users;
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        this.usersFromBackend = [];
      }
    });
  }

  private fetchAdminUsers(): void {
    this.http.get<any[]>('/api/admin-users').subscribe({
      next: (users) => {
        // Map backend fields to Report interface for display
        this.candidateReports = users.map((user, idx) => ({
          id: user.id || idx + 1,
          user: user.username || user.name || '',
          email: user.email || '',
          position: user.role || '',
          jobId: user.job_id || undefined,
          status: user.status || '',
          updatedAt: user.updated_at ? formatDate(user.updated_at, 'yyyy-MM-dd', 'en-US') : ''
        }));
        // Optionally, update HR metrics if available from backend
        this.updateHRMetrics();
        this.filterReports();
      },
      error: (err) => {
        console.error('Failed to fetch admin users:', err);
        this.candidateReports = [];
        this.filterReports();
      }
    });
  }

  updateHRMetrics(): void {
    this.hrMetrics.activeCandidates = this.candidateReports.length;
    this.hrMetrics.hrHiredPeople = this.candidateReports.filter(r => r.status === 'Hired').length;
    this.hrMetrics.hiringSuccessRate = this.hrMetrics.activeCandidates > 0 
      ? Math.round((this.hrMetrics.hrHiredPeople / this.hrMetrics.activeCandidates) * 100) 
      : 0;
    this.hrMetrics.totalInterviews = this.candidateReports.length; // Adjust based on actual data
  }

  filterReports(): void {
    let filtered = [...this.candidateReports];
    // Filter by status
    if (this.filterStatus) {
      filtered = filtered.filter(report => 
        report.status && report.status.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }
    // Filter by date range with validation
    if (this.filterDateStart && this.filterDateEnd) {
      const startDate = new Date(this.filterDateStart);
      const endDate = new Date(this.filterDateEnd);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.updatedAt || '');
          return !isNaN(reportDate.getTime()) && reportDate >= startDate && reportDate <= endDate;
        });
      }
    } else if (this.filterDateStart) {
      const startDate = new Date(this.filterDateStart);
      if (!isNaN(startDate.getTime())) {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.updatedAt || '');
          return !isNaN(reportDate.getTime()) && reportDate >= startDate;
        });
      }
    } else if (this.filterDateEnd) {
      const endDate = new Date(this.filterDateEnd);
      if (!isNaN(endDate.getTime())) {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.updatedAt || '');
          return !isNaN(reportDate.getTime()) && reportDate <= endDate;
        });
      }
    }
    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(report => 
        (report.user && report.user.toLowerCase().includes(query)) || 
        (report.email && report.email.toLowerCase().includes(query)) ||
        (report.position && report.position.toLowerCase().includes(query))
      );
    }
    this.candidateReports = filtered; // Update candidateReports with filtered data
    this.candidatePage = 1; // Reset to first page on filter
    this.updatePaginatedCandidateReports();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.searchQuery = '';
    this.filterReports();
    this.showToast('Filters cleared successfully.');
  }

  updatePaginatedCandidateReports(): void {
    const start = (this.candidatePage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCandidateReports = this.candidateReports.slice(start, end);
  }

  previousCandidatePage(): void {
    if (this.candidatePage > 1) {
      this.candidatePage--;
      this.updatePaginatedCandidateReports();
    }
  }

  nextCandidatePage(): void {
    if (this.candidatePage < this.getTotalPages()) {
      this.candidatePage++;
      this.updatePaginatedCandidateReports();
    }
  }

  goToCandidatePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.candidatePage = page;
      this.updatePaginatedCandidateReports();
    }
  }

  getCandidatePageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.candidatePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getTotalPages(): number {
    return Math.ceil(this.candidateReports.length / this.itemsPerPage);
  }

  viewDetails(report: Report): void {
    this.selectedReport = report; // Set selected report for modal display
    // Optionally navigate to a details page if needed
    // this.router.navigate(['/candidate', report.id]);
  }

  editReport(report: Report): void {
    this.router.navigate(['/candidate', report.id, 'edit']);
  }

  refreshData(): void {
    this.fetchAdminUsers();
    this.showToast('Data refreshed successfully.');
  }

  openExportModal(): void {
    this.showExportModal = true;
  }

  cancelExport(): void {
    this.showExportModal = false;
  }

  confirmExport(): void {
    let exportData = this.includeAll ? this.candidateReports : this.paginatedCandidateReports;

    if (this.exportFormat === 'CSV') {
      const headers = ['ID,User,Email,Position,Job ID,Status,Updated At'];
      const rows = exportData.map(report =>
        `${report.id},${report.user},${report.email || ''},${report.position},${report.jobId || ''},${report.status || ''},${report.updatedAt || ''}`
      );
      const csvContent = headers.join('\n') + '\n' + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_${formatDate(new Date(), 'yyyyMMdd_HHmmss', 'en-US')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.showToast('Export completed successfully.');
    } else {
      console.log(`Exporting as ${this.exportFormat} (Not implemented)`);
      setTimeout(() => {
        alert(`Export as ${this.exportFormat} is not implemented yet`);
      }, 1000);
    }
    this.showExportModal = false;
  }

  restrictCandidate(report: Report): void {
    if (confirm(`Are you sure you want to restrict ${report.user}?`)) {
      this.http.post('/api/admin-users/restrict', { id: report.id }).subscribe({
        next: () => {
          this.fetchAdminUsers();
          this.showToast(`${report.user} has been restricted.`);
        },
        error: (err) => {
          console.error('Failed to restrict candidate:', err);
          this.showToast('Failed to restrict candidate.', true);
        }
      });
    }
  }

  private showToast(message: string, isError: boolean = false): void {
    this.toastMessage = message;
    this.toastOpacity = 1;
    setTimeout(() => {
      this.toastOpacity = 0;
      setTimeout(() => {
        this.toastMessage = '';
        this.cdr.detectChanges();
      }, 300); // Allow fade-out animation to complete
    }, 2500); // Toast visible for 2.5 seconds
  }
}