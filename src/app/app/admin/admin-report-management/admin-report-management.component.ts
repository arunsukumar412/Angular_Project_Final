import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminFooterComponent } from '../admin-footer/admin-footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faSyncAlt,
  faFileCsv,
  faFilePdf,
  faFileExcel,
  faTasks,
  faClock,
  faPlus,
  faMinus,
  faEye,
  faDownload,
  faEdit,
  faSpinner,
  faTimes,
  faCheck,
  faSearch,
  faCalendarAlt,
  faUsers,
  faChartLine,
  faUserCheck,
  faCalendarDay,
  faCalendarWeek,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faChevronDown,
  faChevronUp,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faFileExport,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  status: string;
  user: string;
  hrId?: number;
  candidateId?: number;
  role?: string;
  email?: string;
  phone?: string;
  department?: string;
  location?: string;
  experience?: number;
  skills?: string[];
  selected?: boolean;
  tag?: string;
  folder?: string;
  jobId?: number;
  position?: string;
  [key: string]: any;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  actions?: boolean;
}

interface ExportHistory {
  id: number;
  date: Date;
  reportType: string;
  format: string;
  exportedBy: string;
  filePath?: string;
}

interface HR {
  id: number;
  name: string;
  email: string;
  phone: string;
  hiringCapacity: number;
  hiredCount: number;
  department: string;
  location: string;
}

interface Field {
  name: string;
  selected: boolean;
  visible?: boolean;
}

interface HRMetrics {
  totalInterviews: number;
  hrCount: number;
  activeCandidates: number;
  jobOpenings: number;
  reportsGenerated: number;
  hiringSuccessRate: number;
  avgInterviewTime?: number;
  candidateDropOff?: number;
  hrHiringCapacity: number;
  usersAppliedJobs: number;
  hrHiredPeople: number;
  avgHiringTime?: number;
  hrTurnoverRate?: number;
}

@Component({
  selector: 'app-admin-report-management',
  templateUrl: './admin-report-management.component.html',
  styleUrls: ['./admin-report-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, FilterPipe, AdminHeaderComponent, FontAwesomeModule],
})
export class AdminReportManagementComponent implements OnInit {
  // Font Awesome icons
  faSyncAlt = faSyncAlt;
  faFileCsv = faFileCsv;
  faFilePdf = faFilePdf;
  faFileExcel = faFileExcel;
  faTasks = faTasks;
  faClock = faClock;
  faPlus = faPlus;
  faMinus = faMinus;
  faEye = faEye;
  faDownload = faDownload;
  faEdit = faEdit;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faTimes = faTimes;
  faSearch = faSearch;
  faCalendarAlt = faCalendarAlt;
  faUsers = faUsers;
  faChartLine = faChartLine;
  faUserCheck = faUserCheck;
  faCalendarDay = faCalendarDay;
  faCalendarWeek = faCalendarWeek;
  faCalendar = faCalendar;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;
  faAngleDoubleRight = faAngleDoubleRight;
  faFileExport = faFileExport;
  faCircle = faCircle;

  // Component state
  currentUser = 'Admin User';
  userProfileImage = 'https://via.placeholder.com/32';
  currentYear = new Date().getFullYear();
  currentDate = new Date('2025-07-08T20:28:00+05:30');

  // Data
  reports: Report[] = [];
  filteredReports: Report[] = [];
  candidateReports: Report[] = [];
  hrReports: Report[] = [];
  paginatedCandidateReports: Report[] = [];
  paginatedHrReports: Report[] = [];
  hrList: HR[] = [];
  hrMetrics: HRMetrics = {
    totalInterviews: 0,
    hrCount: 0,
    activeCandidates: 0,
    jobOpenings: 0,
    reportsGenerated: 0,
    hiringSuccessRate: 0,
    avgInterviewTime: 0,
    candidateDropOff: 0,
    hrHiringCapacity: 0,
    usersAppliedJobs: 0,
    hrHiredPeople: 0,
    avgHiringTime: 0,
    hrTurnoverRate: 0,
  };
  exportHistory: ExportHistory[] = [];
  filteredExportHistory: ExportHistory[] = [];
  notifications: Notification[] = [
    { id: 1, title: 'New Report', message: 'Candidate report generated.', time: new Date('2025-07-08T10:00:00'), actions: true },
    { id: 2, title: 'Export Complete', message: 'HR report exported as CSV.', time: new Date('2025-07-08T14:00:00'), actions: false }
  ];

  // Fields for export and table visibility
  availableFields: Field[] = [
    { name: 'id', selected: false, visible: false },
    { name: 'title', selected: true, visible: true },
    { name: 'type', selected: true, visible: true },
    { name: 'date', selected: true, visible: true },
    { name: 'status', selected: true, visible: true },
    { name: 'user', selected: true, visible: true },
    { name: 'role', selected: false, visible: false },
    { name: 'email', selected: true, visible: true },
    { name: 'phone', selected: false, visible: false },
    { name: 'department', selected: false, visible: false },
    { name: 'location', selected: false, visible: false },
    { name: 'experience', selected: false, visible: false },
    { name: 'skills', selected: false, visible: false },
    { name: 'hrId', selected: false, visible: false },
    { name: 'candidateId', selected: true, visible: true },
    { name: 'jobId', selected: true, visible: true },
    { name: 'position', selected: true, visible: true },
    { name: 'tag', selected: false, visible: false },
    { name: 'folder', selected: false, visible: false },
  ];
  visibleColumns: string[] = this.availableFields.filter(f => f.visible).map(f => f.name);

  // Filters
  filterDateStart = '';
  filterDateEnd = '';
  filterReportType = '';
  filterHR = '';
  filterStatus = '';
  filterRole = '';
  searchQuery = '';
  showSuggestions = false;
  searchSuggestions: string[] = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Lee', 'Emma Wilson'];

  // Export History Filters
  historyFilterDateStart = '';
  historyFilterDateEnd = '';
  historyFilterFormat = '';

  // Pagination
  candidatePage = 1;
  hrPage = 1;
  itemsPerPage = 5;

  // Sorting
  currentSortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // UI State
  showUserDropdown = false;
  showNotifications = false;
  showExportModal = false;
  showExportPreviewModal = false;
  showScheduleExportModal = false;
  showBulkActionsModal = false;
  showDownloadAllModal = false;
  showAdvancedFilters = false;
  downloadAllType: 'candidates' | 'hr' = 'candidates';
  downloadAllFormat = 'CSV';
  exportFormat = 'CSV';
  exportCompression = 'none';
  csvDelimiter = ',';
  bulkAction = 'export';
  bulkStatus = 'Hired';
  bulkEmailSubject = '';
  bulkEmailBody = '';
  bulkAssignedHR = '';
  bulkTag = '';
  bulkFolder = '';
  scheduleFrequency = 'daily';
  scheduleStartDate = '';
  scheduleEndDate = '';
  scheduleEmail = '';
  scheduleTimeZone = 'IST';
  scheduleNotification = 'email';
  unreadNotifications = 2;
  exporting = false;
  exportProgress = 0;
  showAdditionalMetrics = false;
  selectAll = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchData();
    }
    this.updateVisibleColumns();
  }

  private fetchData(): void {
    this.fetchReports().subscribe(reports => {
      this.reports = reports;
      this.filterReports();
      this.cdr.detectChanges();
    });
    this.fetchHrList().subscribe(hrList => {
      this.hrList = hrList;
      this.hrMetrics.hrCount = hrList.length;
      this.cdr.detectChanges();
    });
    this.fetchHrMetrics().subscribe(metrics => {
      this.hrMetrics = { ...this.hrMetrics, ...metrics };
      this.cdr.detectChanges();
    });
    this.fetchExportHistory().subscribe(history => {
      this.exportHistory = history;
      this.filterExportHistory();
      this.cdr.detectChanges();
    });
  }

  private fetchReports(): Observable<Report[]> {
    return this.http.get<Report[]>('http://localhost:3000/reports').pipe(
      catchError(error => {
        console.error('Error fetching reports:', error);
        return of([
          {
            id: 1,
            title: 'Candidate Interview Q1',
            type: 'Interview',
            date: '2025-07-08',
            status: 'Hired',
            user: 'Arun Sharma',
            role: 'Candidate',
            email: 'arun.sharma@example.com',
            phone: '123-456-7890',
            department: 'Engineering',
            location: 'New York',
            experience: 5,
            skills: ['Java', 'Python'],
            hrId: 1,
            candidateId: 101,
            jobId: 1001,
            position: 'Software Engineer',
            selected: false
          },
          {
            id: 2,
            title: 'Candidate Review Q2',
            type: 'Interview',
            date: '2025-07-07',
            status: 'Pending',
            user: 'Jane Smith',
            role: 'Candidate',
            email: 'jane.smith@example.com',
            phone: '987-654-3210',
            department: 'Marketing',
            location: 'London',
            experience: 3,
            skills: ['Marketing', 'SEO'],
            hrId: 1,
            candidateId: 102,
            jobId: 1002,
            position: 'Marketing Manager',
            selected: false
          },
          {
            id: 3,
            title: 'HR Performance Q1',
            type: 'HR',
            date: '2025-07-01',
            status: 'Completed',
            user: 'Arun Sharma',
            role: 'HR',
            email: 'arun.sharma@genworx.com',
            phone: '123-456-7890',
            department: 'HR',
            location: 'New York',
            hrId: 1,
            selected: false
          },
          {
            id: 4,
            title: 'Candidate Interview Q3',
            type: 'Interview',
            date: '2025-07-08',
            status: 'Rejected',
            user: 'Mike Johnson',
            role: 'Candidate',
            email: 'mike.johnson@example.com',
            phone: '555-123-4567',
            department: 'Engineering',
            location: 'San Francisco',
            experience: 7,
            skills: ['Python', 'AWS'],
            hrId: 1,
            candidateId: 103,
            jobId: 1003,
            position: 'DevOps Engineer',
            selected: false
          }
        ]);
      })
    );
  }

  private fetchHrList(): Observable<HR[]> {
    return this.http.get<HR[]>('http://localhost:3000/hrList').pipe(
      catchError(error => {
        console.error('Error fetching HR list:', error);
        return of([
          { id: 1, name: 'Arun Sharma', email: 'arun.sharma@genworx.com', phone: '123-456-7890', hiringCapacity: 10, hiredCount: 1, department: 'Engineering', location: 'New York' }
        ]);
      })
    );
  }

  private fetchHrMetrics(): Observable<HRMetrics> {
    return this.http.get<HRMetrics>('http://localhost:3000/hrMetrics').pipe(
      catchError(error => {
        console.error('Error fetching HR metrics:', error);
        return of({
          totalInterviews: 250,
          hrCount: 7,
          activeCandidates: 150,
          jobOpenings: 30,
          reportsGenerated: 100,
          hiringSuccessRate: 85,
          avgInterviewTime: 45,
          candidateDropOff: 15,
          hrHiringCapacity: 50,
          usersAppliedJobs: 400,
          hrHiredPeople: 30,
          avgHiringTime: 12,
          hrTurnoverRate: 5,
        });
      })
    );
  }

  private fetchExportHistory(): Observable<ExportHistory[]> {
    return this.http.get<ExportHistory[]>('http://localhost:3000/exportHistory').pipe(
      catchError(error => {
        console.error('Error fetching export history:', error);
        return of([
          { id: 1, date: new Date('2025-07-07T09:00:00'), reportType: 'Interview', format: 'CSV', exportedBy: 'Arun Sharma' }
        ]);
      })
    );
  }

  clearFilters(): void {
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.filterReportType = '';
    this.filterHR = '';
    this.filterStatus = '';
    this.filterRole = '';
    this.searchQuery = '';
    this.filterReports();
    this.cdr.detectChanges();
  }

  clearHistoryFilters(): void {
    this.historyFilterDateStart = '';
    this.historyFilterDateEnd = '';
    this.historyFilterFormat = '';
    this.filterExportHistory();
    this.cdr.detectChanges();
  }

  applyQuickFilter(period: string): void {
    const today = new Date('2025-07-08');
    this.clearFilters();
    switch (period) {
      case 'today':
        this.filterDateStart = formatDate(today, 'yyyy-MM-dd', 'en-US');
        this.filterDateEnd = formatDate(today, 'yyyy-MM-dd', 'en-US');
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        this.filterDateStart = formatDate(weekStart, 'yyyy-MM-dd', 'en-US');
        this.filterDateEnd = formatDate(today, 'yyyy-MM-dd', 'en-US');
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filterDateStart = formatDate(monthStart, 'yyyy-MM-dd', 'en-US');
        this.filterDateEnd = formatDate(today, 'yyyy-MM-dd', 'en-US');
        break;
      case 'pending':
        this.filterStatus = 'Pending';
        break;
      case 'hired':
        this.filterStatus = 'Hired';
        break;
      case 'rejected':
        this.filterStatus = 'Rejected';
        break;
    }
    this.filterReports();
    this.cdr.detectChanges();
  }

  filterReports(): void {
    let filtered = [...this.reports];
    if (this.searchQuery) {
      filtered = filtered.filter(report =>
        (
          report.title?.toLowerCase()?.includes(this.searchQuery.toLowerCase()) ||
          report.user?.toLowerCase()?.includes(this.searchQuery.toLowerCase()) ||
          (report.email?.toLowerCase()?.includes(this.searchQuery.toLowerCase()) ?? false)
        )
      );
    }
    if (this.filterDateStart && this.filterDateEnd) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.date);
        const startDate = new Date(this.filterDateStart);
        const endDate = new Date(this.filterDateEnd);
        return !isNaN(reportDate.getTime()) &&
               !isNaN(startDate.getTime()) &&
               !isNaN(endDate.getTime()) &&
               reportDate >= startDate &&
               reportDate <= new Date(endDate.getTime() + 86400000 - 1);
      });
    }
    if (this.filterReportType) {
      filtered = filtered.filter(report => report.type.toLowerCase() === this.filterReportType.toLowerCase());
    }
    if (this.filterHR) {
      filtered = filtered.filter(report => report.hrId === +this.filterHR);
    }
    if (this.filterStatus) {
      filtered = filtered.filter(report => report.status.toLowerCase() === this.filterStatus.toLowerCase());
    }
    if (this.filterRole) {
      filtered = filtered.filter(report => report.role?.toLowerCase() === this.filterRole.toLowerCase());
    }
    this.filteredReports = filtered;
    this.candidateReports = filtered.filter(report => report.role?.toLowerCase() === 'candidate' || report.type.toLowerCase() === 'interview');
    this.hrReports = filtered.filter(report => report.role?.toLowerCase() === 'hr');
    this.candidatePage = 1;
    this.hrPage = 1;
    this.updatePaginatedCandidateReports();
    this.updatePaginatedHrReports();
  }

  filterExportHistory(): void {
    this.filteredExportHistory = [...this.exportHistory];
    if (this.historyFilterDateStart && this.historyFilterDateEnd) {
      this.filteredExportHistory = this.filteredExportHistory.filter(history => {
        const historyDate = new Date(history.date);
        const startDate = new Date(this.historyFilterDateStart);
        const endDate = new Date(this.historyFilterDateEnd);
        return !isNaN(historyDate.getTime()) &&
               !isNaN(startDate.getTime()) &&
               !isNaN(endDate.getTime()) &&
               historyDate >= startDate &&
               historyDate <= new Date(endDate.getTime() + 86400000 - 1);
      });
    }
    if (this.historyFilterFormat) {
      this.filteredExportHistory = this.filteredExportHistory.filter(history =>
        history.format.toLowerCase() === this.historyFilterFormat.toLowerCase()
      );
    }
  }

  sortData(column: string): void {
    if (!this.isSortable(column)) return;
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filteredReports.sort((a, b) => {
      const valueA = a[column] ?? '';
      const valueB = b[column] ?? '';
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });
    this.filterReports();
    this.cdr.detectChanges();
  }

  isSortable(column: string): boolean {
    return ['id', 'title', 'type', 'date', 'status', 'user', 'role', 'email', 'phone', 'department', 'location', 'experience', 'hrId', 'candidateId', 'jobId', 'position', 'tag', 'folder'].includes(column);
  }

  updatePaginatedCandidateReports(): void {
    const start = (this.candidatePage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCandidateReports = this.candidateReports.slice(start, end);
    this.cdr.detectChanges();
  }

  updatePaginatedHrReports(): void {
    const start = (this.hrPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedHrReports = this.hrReports.slice(start, end);
    this.cdr.detectChanges();
  }

  firstCandidatePage(): void {
    this.candidatePage = 1;
    this.updatePaginatedCandidateReports();
  }

  previousCandidatePage(): void {
    if (this.candidatePage > 1) {
      this.candidatePage--;
      this.updatePaginatedCandidateReports();
    }
  }

  nextCandidatePage(): void {
    if (this.candidatePage < Math.ceil(this.candidateReports.length / this.itemsPerPage)) {
      this.candidatePage++;
      this.updatePaginatedCandidateReports();
    }
  }

  lastCandidatePage(): void {
    this.candidatePage = Math.ceil(this.candidateReports.length / this.itemsPerPage);
    this.updatePaginatedCandidateReports();
  }

  goToCandidatePage(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.candidateReports.length / this.itemsPerPage)) {
      this.candidatePage = page;
      this.updatePaginatedCandidateReports();
    }
  }

  getCandidatePageNumbers(): number[] {
    const totalCandidatePages = Math.ceil(this.candidateReports.length / this.itemsPerPage);
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.candidatePage - 2);
    let endPage = Math.min(totalCandidatePages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  firstHrPage(): void {
    this.hrPage = 1;
    this.updatePaginatedHrReports();
  }

  previousHrPage(): void {
    if (this.hrPage > 1) {
      this.hrPage--;
      this.updatePaginatedHrReports();
    }
  }

  nextHrPage(): void {
    if (this.hrPage < Math.ceil(this.hrReports.length / this.itemsPerPage)) {
      this.hrPage++;
      this.updatePaginatedHrReports();
    }
  }

  lastHrPage(): void {
    this.hrPage = Math.ceil(this.hrReports.length / this.itemsPerPage);
    this.updatePaginatedHrReports();
  }

  goToHrPage(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.hrReports.length / this.itemsPerPage)) {
      this.hrPage = page;
      this.updatePaginatedHrReports();
    }
  }

  getHrPageNumbers(): number[] {
    const totalHrPages = Math.ceil(this.hrReports.length / this.itemsPerPage);
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.hrPage - 2);
    let endPage = Math.min(totalHrPages, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatCellValue(value: any, key: string): string {
    if (key === 'date') {
      return value ? formatDate(value, 'mediumDate', 'en-US') : '';
    }
    if (key === 'skills') {
      return Array.isArray(value) ? value.join(', ') : value || '';
    }
    return value?.toString() || '';
  }

  viewDetails(report: Report): void {
    this.router.navigate(['/report-details', report.id]);
  }

  downloadSingle(report: Report): void {
    this.exportReport([report], `${report.title}_${report.id}.${this.exportFormat.toLowerCase()}`);
    this.notifications.push({
      id: this.notifications.length + 1,
      title: 'Report Downloaded',
      message: `Report ${report.title} downloaded.`,
      time: new Date(),
      actions: false
    });
  }

  editReport(report: Report): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.put<Report>(`http://localhost:3000/reports/${report.id}`, report).subscribe({
        next: updatedReport => {
          console.log('Report updated:', updatedReport);
          this.fetchData();
        },
        error: error => console.error('Error updating report:', error)
      });
    }
  }

  openExportModal(format: string): void {
    this.exportFormat = format;
    this.showExportModal = true;
  }

  openDownloadAllModal(type: 'candidates' | 'hr'): void {
    this.downloadAllType = type;
    this.downloadAllFormat = 'CSV';
    this.showDownloadAllModal = true;
  }

  cancelDownloadAll(): void {
    this.showDownloadAllModal = false;
  }

  confirmDownloadAll(): void {
    this.exporting = true;
    this.exportProgress = 0;
    const reports = this.downloadAllType === 'candidates' ? this.candidateReports : this.hrReports;
    const filename = `all_${this.downloadAllType}_reports_${new Date().toISOString().split('T')[0]}.${this.downloadAllFormat.toLowerCase()}`;
    const interval = setInterval(() => {
      this.exportProgress += 20;
      if (this.exportProgress >= 100) {
        clearInterval(interval);
        this.exporting = false;
        this.showDownloadAllModal = false;
        if (this.downloadAllFormat === 'PDF') {
          this.generatePDF(reports, filename);
        } else {
          this.exportReport(reports, filename);
        }
        this.logExport(this.downloadAllType === 'candidates' ? 'Candidate' : 'HR', this.downloadAllFormat);
        this.notifications.push({
          id: this.notifications.length + 1,
          title: 'Export Complete',
          message: `All ${this.downloadAllType} reports exported as ${this.downloadAllFormat}.`,
          time: new Date(),
          actions: false
        });
        this.cdr.detectChanges();
      }
    }, 500);
  }

  previewExport(): void {
    this.showExportModal = false;
    this.showExportPreviewModal = true;
  }

  cancelExport(): void {
    this.showExportModal = false;
    this.showExportPreviewModal = false;
  }

  confirmExport(): void {
    this.exporting = true;
    this.exportProgress = 0;
    const selectedFields = this.availableFields.filter(field => field.selected).map(field => field.name);
    const selectedReports = this.paginatedCandidateReports.filter(report => report.selected)
      .concat(this.paginatedHrReports.filter(report => report.selected));
    const reports = selectedReports.length ? selectedReports : this.filteredReports;
    const filename = `report_export_${new Date().toISOString().split('T')[0]}.${this.exportFormat.toLowerCase()}`;
    const interval = setInterval(() => {
      this.exportProgress += 20;
      if (this.exportProgress >= 100) {
        clearInterval(interval);
        this.exporting = false;
        this.showExportModal = false;
        this.showExportPreviewModal = false;
        if (this.exportFormat === 'PDF') {
          this.generatePDF(reports, filename);
        } else {
          this.exportReport(reports, filename);
        }
        this.logExport(this.filterReportType || 'Mixed', this.exportFormat);
        this.notifications.push({
          id: this.notifications.length + 1,
          title: 'Export Complete',
          message: `Report exported as ${this.exportFormat}.`,
          time: new Date(),
          actions: false
        });
        this.cdr.detectChanges();
      }
    }, 500);
  }

  private exportReport(reports: Report[], filename: string): void {
    try {
      const selectedFields = this.availableFields.filter(field => field.selected).map(field => field.name);
      
      if (!selectedFields.length) {
        this.notifications.push({
          id: this.notifications.length + 1,
          title: 'Export Error',
          message: 'No fields selected for export',
          time: new Date(),
          actions: false
        });
        return;
      }

      if (!reports.length) {
        this.notifications.push({
          id: this.notifications.length + 1,
          title: 'Export Error',
          message: 'No reports to export',
          time: new Date(),
          actions: false
        });
        return;
      }

      if (this.exportFormat === 'CSV') {
        let csvContent = selectedFields.join(this.csvDelimiter) + '\n';
        reports.forEach(report => {
          csvContent += selectedFields.map(field => `"${this.formatCellValue(report[field], field)}"`).join(this.csvDelimiter) + '\n';
        });
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      } else if (this.exportFormat === 'JSON') {
        const jsonContent = JSON.stringify(
          reports.map(report => {
            const filteredReport: { [key: string]: any } = {};
            selectedFields.forEach(field => filteredReport[field] = report[field]);
            return filteredReport;
          }),
          null,
          2
        );
        this.downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
      } else if (this.exportFormat === 'XML') {
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<reports>\n';
        reports.forEach(report => {
          xmlContent += '  <report>\n';
          selectedFields.forEach(field => {
            xmlContent += `    <${field}>${this.formatCellValue(report[field], field)}</${field}>\n`;
          });
          xmlContent += '  </report>\n';
        });
        xmlContent += '</reports>';
        this.downloadFile(xmlContent, filename, 'application/xml;charset=utf-8;');
      } else if (this.exportFormat === 'Excel') {
        console.log('Excel export not implemented. Use a library like XLSX.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.notifications.push({
        id: this.notifications.length + 1,
        title: 'Export Failed',
        message: 'An error occurred during export',
        time: new Date(),
        actions: false
      });
    } finally {
      this.cdr.detectChanges();
    }
  }

  private generatePDF(reports: Report[], filename: string): void {
    console.log('Generating PDF with LaTeX for reports:', reports);
    const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{parskip}
\\setlength{\\parindent}{0pt}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{times}
\\usepackage{graphicx}
\\titleformat{\\section}{\\large\\bfseries}{\\thesection}{1em}{}
\\titleformat{\\subsection}{\\normalsize\\bfseries}{\\thesubsection}{1em}{}
\\newcommand{\\reportheader}[1]{\\textbf{\\large #1}}
\\newcommand{\\reportentry}[1]{\\item #1}
\\begin{document}
\\begin{minipage}[t]{0.3\\textwidth}
  \\includegraphics[width=\\linewidth]{Gen.png}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.6\\textwidth}
  \\raggedleft
  \\reportheader{GenWox Report: Generated on July 8, 2025}
\\end{minipage}
\\vspace{1em}
\\section*{Candidate Report}
\\begin{itemize}[noitemsep]
${reports.map(report => `\\reportentry{${report.title} - ${report.status}}`).join('\n')}
\\end{itemize}
\\vspace{1em}
\\textbf{Candidates}
\\vspace{0.5em}
\\begin{itemize}[noitemsep]
${reports.filter(r => r.status === 'Hired').map(report => `\\reportentry{${report.user} - Hired}`).join('\n')}
\\end{itemize}
\\end{document}
    `;
    this.downloadFile(latexContent, filename.replace('.pdf', '.tex'), 'text/plain;charset=utf-8;');
  }

  private downloadFile(content: string, filename: string, contentType: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const blob = new Blob([content], { type: contentType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  openScheduleExportModal(): void {
    this.showScheduleExportModal = true;
  }

  cancelScheduleExport(): void {
    this.showScheduleExportModal = false;
  }

  confirmScheduleExport(): void {
    console.log(`Scheduling export: Format=${this.exportFormat}, Frequency=${this.scheduleFrequency}, StartDate=${this.scheduleStartDate}, EndDate=${this.scheduleEndDate}, TimeZone=${this.scheduleTimeZone}, Emails=${this.scheduleEmail}, Notification=${this.scheduleNotification}`);
    this.notifications.push({
      id: this.notifications.length + 1,
      title: 'Export Scheduled',
      message: `Report export scheduled for ${this.scheduleFrequency}.`,
      time: new Date(),
      actions: false
    });
    this.showScheduleExportModal = false;
    this.cdr.detectChanges();
  }

  openBulkActionsModal(): void {
    this.showBulkActionsModal = true;
  }

  cancelBulkActions(): void {
    this.showBulkActionsModal = false;
  }

  confirmBulkActions(): void {
    const selectedCandidateReports = this.paginatedCandidateReports.filter(report => report.selected);
    const selectedHrReports = this.paginatedHrReports.filter(report => report.selected);
    const selectedReports = [...selectedCandidateReports, ...selectedHrReports];
    if (selectedReports.length === 0) {
      this.notifications.push({
        id: this.notifications.length + 1,
        title: 'No Selection',
        message: 'No reports selected for bulk action.',
        time: new Date(),
        actions: false
      });
      this.cdr.detectChanges();
      return;
    }
    switch (this.bulkAction) {
      case 'export':
        this.openExportModal('CSV');
        break;
      case 'archive':
        selectedReports.forEach(report => (report.status = 'Archived'));
        this.filterReports();
        break;
      case 'delete':
        this.reports = this.reports.filter(report => !selectedReports.includes(report));
        this.filterReports();
        break;
      case 'updateStatus':
        selectedReports.forEach(report => (report.status = this.bulkStatus));
        this.filterReports();
        break;
      case 'sendEmail':
        console.log('Sending email:', { subject: this.bulkEmailSubject, body: this.bulkEmailBody, reports: selectedReports });
        break;
      case 'assignHR':
        selectedReports.forEach(report => (report.hrId = +this.bulkAssignedHR));
        this.filterReports();
        break;
      case 'tag':
        selectedReports.forEach(report => (report.tag = this.bulkTag));
        this.filterReports();
        break;
      case 'moveToFolder':
        selectedReports.forEach(report => (report.folder = this.bulkFolder));
        this.filterReports();
        break;
    }
    this.notifications.push({
      id: this.notifications.length + 1,
      title: 'Bulk Action Applied',
      message: `Action ${this.bulkAction} applied to ${selectedReports.length} reports.`,
      time: new Date(),
      actions: false
    });
    this.showBulkActionsModal = false;
    this.selectAll = false;
    this.paginatedCandidateReports.forEach(report => (report.selected = false));
    this.paginatedHrReports.forEach(report => (report.selected = false));
    this.cdr.detectChanges();
  }

  toggleSelectAll(): void {
    const isCandidateTable = this.paginatedCandidateReports.length > 0;
    (isCandidateTable ? this.paginatedCandidateReports : this.paginatedHrReports).forEach(report => (report.selected = this.selectAll));
    this.cdr.detectChanges();
  }

  updateSelectedReports(): void {
    const isCandidateTable = this.paginatedCandidateReports.length > 0;
    this.selectAll = (isCandidateTable ? this.paginatedCandidateReports : this.paginatedHrReports).every(report => report.selected);
    this.cdr.detectChanges();
  }

  downloadExport(history: ExportHistory): void {
    this.downloadFile('Export data placeholder', `export_${history.id}.${history.format.toLowerCase()}`, 'text/plain');
    this.notifications.push({
      id: this.notifications.length + 1,
      title: 'Export Downloaded',
      message: `Export ${history.reportType} (${history.format}) downloaded.`,
      time: new Date(),
      actions: false
    });
    this.cdr.detectChanges();
  }

  refreshData(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchData();
      this.notifications.push({
        id: this.notifications.length + 1,
        title: 'Data Refreshed',
        message: 'Reports have been updated.',
        time: new Date(),
        actions: false
      });
      this.cdr.detectChanges();
    }
  }

  toggleAdditionalMetrics(show: boolean): void {
    this.showAdditionalMetrics = show;
    this.cdr.detectChanges();
  }

  acceptNotification(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.cdr.detectChanges();
  }

  rejectNotification(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
    this.cdr.detectChanges();
  }

  getHiredCount(hrId: number | undefined): number {
    return hrId ? this.candidateReports.filter(report => report.hrId === hrId && report.status.toLowerCase() === 'hired').length : 0;
  }

  getOffersGiven(hrId: number | undefined): number {
    return hrId ? this.candidateReports.filter(report => report.hrId === hrId && ['hired', 'onhold', 'pending'].includes(report.status.toLowerCase())).length : 0;
  }

  updateVisibleColumns(): void {
    this.visibleColumns = this.availableFields.filter(f => f.visible).map(f => f.name);
    this.cdr.detectChanges();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  private logExport(reportType: string, format: string): void {
    const exportEntry: ExportHistory = {
      id: this.exportHistory.length + 1,
      date: new Date(),
      reportType,
      format,
      exportedBy: this.currentUser,
    };
    this.exportHistory.unshift(exportEntry);
    this.filterExportHistory();
    this.cdr.detectChanges();
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.filterReports();
    this.showSuggestions = false;
    this.cdr.detectChanges();
  }

  getStatusIcon(status: string): IconProp {
    switch(status?.toLowerCase()) {
      case 'hired': return faCheckCircle;
      case 'rejected': return faTimesCircle;
      case 'pending': return faClock;
      case 'onhold': return faClock;
      default: return faCircle;
    }
  }
}