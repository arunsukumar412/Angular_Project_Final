import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { NgSelectOption } from '@angular/forms';
import { NgModelGroup } from '@angular/forms';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
interface Report {
  id: string;
  type: string;
  data: { [key: string]: any }[];
  timestamp: Date;
}

@Component({
  selector: 'app-admin-report-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin-report-management.component.html',
  styleUrls: ['./admin-report-management.component.css'],
})
export class AdminReportManagementComponent implements OnInit, OnDestroy {
  showSidebar = false;
  currentUser = 'Admin';
  currentDate = new Date('2025-07-05T00:21:00+05:30'); // 12:21 AM IST, July 05, 2025
  currentYear = this.currentDate.getFullYear();
  version = '2.4.1';
  showUserDropdown = false;
  searchQuery = '';
  filterDate: string | null = null;
  activityLog: { message: string; timestamp: Date }[] = []; // Explicitly initialized
  private activityLogInterval: any | null = null;

  reportTypes = [
    'User Report',
    'HR Report',
    'Application Report',
    'Platform Performance Report',
    'All Reports Summary',
  ];
  selectedReport = 'User Report';
  reports: Report[] = []; // Initialized but populated in ngOnInit
  exportFormats = ['PDF', 'Excel', 'Tableau', 'Power BI'];

  functionalities = [
    'View Report Summary',
    'Filter Reports by Date',
    'Sort Reports by Type',
    'Search Reports by Keyword',
    'Export to PDF',
    'Export to Excel',
    'Export to Tableau',
    'Export to Power BI',
    'Generate Custom Report',
    'Schedule Report Export',
    'View Report History',
    'Delete Old Reports',
    'Share Report via Email',
    'Download Report as ZIP',
    'Preview Report',
    'Apply Date Range Filter',
    'Group Reports by Category',
    'Export Selected Rows',
    'Set Report Access Permissions',
    'View Real-Time Data',
    'Customize Report Layout',
    'Add Notes to Reports',
    'Merge Multiple Reports',
    'Validate Report Data',
    'Generate Charts from Data',
    'Export Report Metadata',
    'Set Report Refresh Interval',
    'Archive Reports',
    'Restore Archived Reports',
    'Audit Report Access',
  ];

  ngOnInit(): void {
    console.log('Component initializing...');
    this.generateMockReports();
    if (!this.reports.length) {
      console.warn('No reports initialized. Check generateMockReports.');
    }
    this.startActivityLogging();
  }

  ngOnDestroy(): void {
    if (this.activityLogInterval) {
      clearInterval(this.activityLogInterval);
      this.activityLogInterval = null;
    }
  }

  generateMockReports(): void {
    const mockData: Report[] = [
      {
        id: 'R001',
        type: 'User Report',
        data: [
          { userId: 'U001', name: 'John Doe', role: 'Admin', lastLogin: '2025-07-04' },
          { userId: 'U002', name: 'Jane Smith', role: 'HR', lastLogin: '2025-07-03' },
        ],
        timestamp: new Date('2025-07-04T23:00+05:30'),
      },
      {
        id: 'R002',
        type: 'HR Report',
        data: [
          { employeeId: 'E001', name: 'Alice Johnson', department: 'HR', salary: 50000 },
          { employeeId: 'E002', name: 'Bob Brown', department: 'IT', salary: 60000 },
        ],
        timestamp: new Date('2025-07-04T22:00+05:30'),
      },
      {
        id: 'R003',
        type: 'Application Report',
        data: [
          { appId: 'A001', applicant: 'Charlie Wilson', status: 'Applied', date: '2025-07-02' },
          { appId: 'A002', applicant: 'Dana Lee', status: 'Reviewed', date: '2025-07-01' },
        ],
        timestamp: new Date('2025-07-04T21:00+05:30'),
      },
      {
        id: 'R004',
        type: 'Platform Performance Report',
        data: [
          { metric: 'Uptime', value: '99.9%', timestamp: '2025-07-04 23:00 IST' },
          { metric: 'Response Time', value: '200ms', timestamp: '2025-07-04 22:00 IST' },
        ],
        timestamp: new Date('2025-07-04T20:00+05:30'),
      },
      {
        id: 'R005',
        type: 'All Reports Summary',
        data: [
          { type: 'User', count: 2 },
          { type: 'HR', count: 2 },
          { type: 'Application', count: 2 },
          { type: 'Performance', count: 2 },
        ],
        timestamp: new Date('2025-07-04T19:00+05:30'),
      },
    ];
    this.reports = mockData;
    console.log('Mock reports generated:', this.reports);
  }

  onReportChange(): void {
    this.filterReports();
    console.log('Report changed to:', this.selectedReport);
  }

  filterReports(): void {
    this.reports = this.reports.filter(report =>
      report.type.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
      (!this.filterDate || new Date(report.timestamp).toISOString().split('T')[0] === this.filterDate)
    );
    console.log('Filtered reports:', this.reports);
  }

  getTableHeaders(): string[] {
    const report = this.reports.find(r => r.type === this.selectedReport);
    if (report?.data && report.data.length > 0) {
      return Object.keys(report.data[0]);
    }
    console.warn('No headers found for selected report:', this.selectedReport);
    return [];
  }

  exportReport(format: string): void {
    const report = this.reports.find(r => r.type === this.selectedReport);
    if (report) {
      const reportName = `${this.selectedReport}_${new Date().toISOString().split('T')[0]}`;
      console.log(`Exporting ${reportName} to ${format}`);
      if (format === 'PDF') {
        // Placeholder for jsPDF
      } else if (format === 'Excel') {
        // Placeholder for xlsx
      } else if (format === 'Tableau' || format === 'Power BI') {
        // Placeholder for integration
      }
    } else {
      console.warn('No report found to export for:', this.selectedReport);
    }
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    console.log('Sidebar toggled, state:', this.showSidebar);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    console.log('User dropdown toggled, state:', this.showUserDropdown);
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
    if (this.activityLog.length > 10) this.activityLog.pop();
    console.log('Activity logged:', message);
  }

  startActivityLogging(): void {
    this.activityLogInterval = setInterval(() => {
      this.logActivity(`System checked at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    }, 300000); // Every 5 minutes
  }
}